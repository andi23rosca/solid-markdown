import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
	Component,
	createMemo,
	createRenderEffect,
	mergeProps,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { html } from "property-information";
import { PluggableList, unified } from "unified";
import { VFile } from "vfile";
import { Options as TransformOptions } from "./types";

import rehypeFilter, { Options as FilterOptions } from "./rehype-filter";
import { MarkdownNode, MarkdownRoot } from "./renderer";
import { Root } from "hast";

type CoreOptions = {
	children: string;
	renderingStrategy: "memo" | "reconcile";
};
type PluginOptions = {
	remarkPlugins: PluggableList;
	rehypePlugins: PluggableList;
};
type LayoutOptions = {
	class: string;
};

type SolidMarkdownOptions = CoreOptions &
	PluginOptions &
	LayoutOptions &
	FilterOptions &
	TransformOptions;

const defaults: SolidMarkdownOptions = {
	renderingStrategy: "memo",
	remarkPlugins: [],
	rehypePlugins: [],
	class: "",
	unwrapDisallowed: false,
	disallowedElements: undefined,
	allowedElements: undefined,
	allowElement: undefined,
	children: "",
	sourcePos: false,
	rawSourcePos: false,
	skipHtml: false,
	includeElementIndex: false,
	transformLinkUri: null,
	transformImageUri: undefined,
	linkTarget: "_self",
	components: {},
};
export const SolidMarkdown: Component<Partial<SolidMarkdownOptions>> = (
	opts,
) => {
	const options: SolidMarkdownOptions = mergeProps(defaults, opts);
	const [node, setNode] = createStore<Root>({ type: "root", children: [] });

	const generateNode = createMemo(() => {
		const children = options.children;
		const processor = unified()
			.use(remarkParse)
			.use(options.remarkPlugins || [])
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(options.rehypePlugins || [])
			.use(rehypeFilter, options);

		const file = new VFile();

		if (typeof children === "string") {
			file.value = children;
		} else if (children !== undefined && options.children !== null) {
			console.warn(
				`[solid-markdown] Warning: please pass a string as \`children\` (not: \`${typeof children}\`)`,
			);
		}

		const hastNode = processor.runSync(processor.parse(file), file);

		if (hastNode.type !== "root") {
			throw new TypeError("Expected a `root` node");
		}

		return hastNode;
	});

	if (options.renderingStrategy === "reconcile") {
		createRenderEffect(() => {
			setNode(reconcile(generateNode()));
		});
	}

	return (
		<>
			<div class={options.class}>
				<MarkdownRoot
					context={{ options, schema: html, listDepth: 0 }}
					node={options.renderingStrategy === "memo" ? generateNode() : node}
				/>
			</div>
		</>
	);
};
