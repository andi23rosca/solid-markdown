import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { Component, mergeProps } from "solid-js";
import { html } from "property-information";
import { PluggableList, unified } from "unified";
import { VFile } from "vfile";
import { childrenToSolid, Options as TransformOptions } from "./ast-to-solid";

import rehypeFilter, { Options as FilterOptions } from "./rehype-filter";

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
const SolidMarkdown: Component<Partial<SolidMarkdownOptions>> = (opts) => {
  const options: SolidMarkdownOptions = mergeProps(defaults, opts);
  const processor = unified()
    .use(remarkParse)
    .use(options.remarkPlugins || [])
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(options.rehypePlugins || [])
    .use(rehypeFilter, options);

  const file = new VFile();

  if (typeof options.children === "string") {
    file.value = options.children;
  } else if (options.children !== undefined && options.children !== null) {
    console.warn(
      `[solid-markdown] Warning: please pass a string as \`children\` (not: \`${options.children}\`)`
    );
  }

  const hastNode = processor.runSync(processor.parse(file), file);

  if (hastNode.type !== "root") {
    throw new TypeError("Expected a `root` node");
  }

  return (
    <div class={options.class}>
      {childrenToSolid({ options, schema: html, listDepth: 0 }, hastNode)}
    </div>
  );
};

export default SolidMarkdown;
