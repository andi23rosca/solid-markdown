/* eslint-disable no-unused-vars */
import { visit } from "unist-util-visit";
import type { Element as HElement, Root as HRoot } from "hast";
import type { Plugin } from "unified";

type AllowElement = (
	element: HElement,
	index: number,
	parent: HElement | HRoot,
) => boolean | undefined;

export type Options = {
	allowedElements?: string[];
	disallowedElements?: string[];
	allowElement?: AllowElement;
	unwrapDisallowed: boolean;
};

const rehypeFilter: Plugin<[Options], HRoot> = (options: Options) => {
	if (options.allowedElements && options.disallowedElements) {
		throw new TypeError(
			"Only one of `allowedElements` and `disallowedElements` should be defined",
		);
	}

	if (
		options.allowedElements ||
		options.disallowedElements ||
		options.allowElement
	) {
		return (tree) => {
			visit(tree, "element", (node, index, parent_) => {
				const parent = parent_;
				if (parent === null) return;

				let remove: boolean | undefined;

				if (options.allowedElements) {
					remove = !options.allowedElements.includes(node.tagName);
				} else if (options.disallowedElements) {
					remove = options.disallowedElements.includes(node.tagName);
				}

				if (
					!remove &&
					options.allowElement &&
					typeof index === "number" &&
					parent
				) {
					remove = !options.allowElement(node, index, parent);
				}

				if (remove && typeof index === "number" && parent) {
					if (options.unwrapDisallowed && node.children) {
						parent.children.splice(index, 1, ...node.children);
					} else {
						parent.children.splice(index, 1);
					}

					return index;
				}

				return undefined;
			});
		};
	}
};
export default rehypeFilter;
