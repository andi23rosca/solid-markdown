import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
	type Component,
	createMemo,
	createRenderEffect,
	mergeProps,
} from "solid-js";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { html } from "property-information";
import { type PluggableList, unified } from "unified";
import { VFile } from "vfile";
import type { Options as TransformOptions } from "./types";

import rehypeFilter, { type Options as FilterOptions } from "./rehype-filter";
import { MarkdownChildren } from "./renderer";
import type { ElementContent, Root, RootContent, Text } from "hast";

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

export type SolidMarkdownOptions = CoreOptions &
	PluginOptions &
	LayoutOptions &
	FilterOptions &
	TransformOptions;

export type SolidMarkdownComponents = TransformOptions["components"];

enum DiffResult {
	Nothing = 0,
	RemoveRestOfChildrenFromParent = 1,
	AddRestOfChildrenToParent = 2,
	ReplaceParent = 3,
	HandleTextDiff = 4,
}

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
		<div class={options.class}>
			<MarkdownChildren
				context={{ options, schema: html, listDepth: 0 }}
				node={options.renderingStrategy === "memo" ? generateNode() : node}
			/>
		</div>
	);
};

// const SolidMarkdownStreamingContext = createContext<{

// }>

const nodeEquality = (a: RootContent | Root, b: RootContent | Root) => {
	return (
		a.type === b.type &&
		((a.type === "element" &&
			b.type === "element" &&
			a.tagName === b.tagName) ||
			(a.type === "text" && b.type === "text" && a.value === b.value)) &&
		a.position?.start.column === b.position?.start.column &&
		a.position?.start.line === b.position?.start.line &&
		a.position?.start.offset === b.position?.start.offset &&
		a.position?.end.column === b.position?.end.column &&
		a.position?.end.line === b.position?.end.line &&
		a.position?.end.offset === b.position?.end.offset &&
		a.position?.indent === b.position?.indent
	);
};
export const SolidMarkdownStreaming: Component<
	Partial<Omit<SolidMarkdownOptions, "renderingStrategy">>
> = (opts) => {
	const options: SolidMarkdownOptions = mergeProps(defaults, opts);
	const [node, setNode] = createStore<{ doc: Root }>({
		doc: { type: "root", children: [] },
	});
	const file = new VFile();
	const processor = unified()
		.use(remarkParse)
		.use(options.remarkPlugins || [])
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(options.rehypePlugins || [])
		.use(rehypeFilter, options);

	createRenderEffect(() => {
		const children = options.children;

		if (typeof children === "string") {
			file.value = children;
		} else if (children !== undefined && options.children !== null) {
			console.warn(
				`[solid-markdown] Warning: please pass a string as \`children\` (not: \`${typeof children}\`)`,
			);
		}

		processor.run(processor.parse(file), file).then((hastNode) => {
			if (hastNode.type !== "root") {
				throw new TypeError("Expected a `root` node");
			}

			setNode(
				produce((root) => {
					if (root.doc.children.length > hastNode.children.length) {
						root.doc = hastNode;
						return;
					}

					const isLastTextNode = (node: RootContent) => {
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						let next: any = hastNode;
						while (next) {
							if ("children" in next && next.children.at(-1)) {
								next = next.children.at(-1);
							} else {
								break;
							}
						}
						return next === node;
					};

					root.doc.position = hastNode.position;

					const process = (
						node: ElementContent | RootContent | Root | undefined,
						old: ElementContent | RootContent | Root | undefined,
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					): [DiffResult, meta: undefined | Record<string, any>] => {
						if (!node && old) {
							return [DiffResult.RemoveRestOfChildrenFromParent, undefined];
						}
						if (node && !old) {
							return [DiffResult.AddRestOfChildrenToParent, undefined];
						}

						if (!node || !old) {
							return [DiffResult.Nothing, undefined];
						}

						if (nodeEquality(node, old)) {
							return [DiffResult.Nothing, undefined];
						}

						if (node.type !== old.type) {
							overrideObjectKeepReference(old, node);
							return [DiffResult.Nothing, undefined];
						}

						if (node.type !== "text" && old.type !== "text") {
							old.type = node.type;
							old.data = node.data;
							old.position = node.position;
							//@ts-ignore
							old.properties = node.properties;
						}

						if (
							(node.type === "element" && old.type === "element") ||
							(node.type === "root" && old.type === "root")
						) {
							for (let i = 0; i < node.children.length; i++) {
								const [result, meta] = process(
									node.children[i],
									old.children[i],
								);
								switch (result) {
									case DiffResult.HandleTextDiff: {
										const n = node.children[i] as Text;
										const lastOld = old.children.at(-1) as Text;
										if (
											lastOld.position?.end.offset === undefined ||
											n.position?.end.offset === undefined
										) {
											lastOld.value = n.value;
											lastOld.position = n.position;
											lastOld.data = n.data;
											return [DiffResult.Nothing, undefined];
										}

										if (lastOld.position.end.offset < n.position.end.offset) {
											const diff = n.value.slice(lastOld.position.end.offset);
											old.children.push({
												type: "text",
												value: diff,
												position: {
													...n.position,
													start: {
														...n.position.start,
														offset: lastOld.position.end.offset,
													},
												},
												data: n.data,
											});
											return [DiffResult.Nothing, undefined];
										}

										lastOld.value = n.value;
										lastOld.position = n.position;
										lastOld.data = n.data;
										return [DiffResult.Nothing, undefined];
									}

									case DiffResult.RemoveRestOfChildrenFromParent:
										old.children = old.children.slice(i);
										return [DiffResult.Nothing, undefined];
									case DiffResult.AddRestOfChildrenToParent:
										// biome-ignore lint/suspicious/noExplicitAny: <explanation>
										old.children.push(...(node.children.slice(i) as any));
										return [DiffResult.Nothing, undefined];
									case DiffResult.ReplaceParent:
										overrideObjectKeepReference(old, node);
										return [DiffResult.Nothing, undefined];
									case DiffResult.Nothing:
										continue;
								}
							}
						}

						if (node.type === "text" && old.type === "text") {
							if (isLastTextNode(node)) {
								return [DiffResult.HandleTextDiff, { node: node }];
							}

							old.value = node.value;
							old.position = node.position;
							old.data = node.data;
							return [DiffResult.Nothing, undefined];
						}

						return [DiffResult.Nothing, undefined];
					};

					process(hastNode, root.doc);
				}),
			);
		});
	});

	return (
		<div class={options.class}>
			<MarkdownChildren
				context={{ options, schema: html, listDepth: 0 }}
				node={node.doc}
			/>
		</div>
	);
};

const overrideObjectKeepReference = (
	obj: RootContent | Root,
	newObj: RootContent | Root,
) => {
	for (const key of Object.keys(obj) as (keyof RootContent)[]) {
		delete obj[key];
	}
	Object.assign(obj, newObj);
};
