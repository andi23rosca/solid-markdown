import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { Component, createMemo, mergeProps } from "solid-js";
import { html } from "property-information";
import { PluggableList, unified } from "unified";
import { VFile } from "vfile";
import { Options as TransformOptions } from "./types";

import rehypeFilter, { Options as FilterOptions } from "./rehype-filter";
import { MarkdownNode, MarkdownRoot } from "./renderer";

type CoreOptions = {
	children: string;
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

	const hastNode = createMemo(() => {
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

	return (
		<>
			<div class={options.class}>
				<MarkdownRoot
					context={{ options, schema: html, listDepth: 0 }}
					node={hastNode()}
				/>
			</div>
		</>
	);
};
