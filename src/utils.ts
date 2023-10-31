import { stringify as commas } from "comma-separated-tokens";
import type { Root, Element } from "hast";
import { find } from "property-information";
import { stringify as spaces } from "space-separated-tokens";
import style from "style-to-object";
import { Position } from "unist";
import { Context } from "./types";

export function getInputElement(node: Element | Root): Element | null {
	let index = -1;

	while (++index < node.children.length) {
		const child = node.children[index];

		if (child?.type === "element" && child?.tagName === "input") {
			return child;
		}
	}

	return null;
}
export function getElementsBeforeCount(
	parent: Element | Root,
	node?: Element,
): number {
	let index = -1;
	let count = 0;

	while (++index < parent.children.length) {
		if (parent.children[index] === node) break;
		if (parent.children[index]?.type === "element") count++;
	}

	return count;
}
export function addProperty(
	props: Record<string, unknown>,
	prop: string,
	value: unknown,
	ctx: Context,
) {
	const info = find(ctx.schema, prop);
	let result = value;

	// Ignore nullish and `NaN` values.
	// eslint-disable-next-line no-self-compare
	// biome-ignore lint/suspicious/noSelfCompare: <explanation>
	if (result === null || result === undefined || result !== result) {
		return;
	}

	// Accept `array`.
	// Most props are space-separated.
	if (Array.isArray(result)) {
		result = info.commaSeparated ? commas(result) : spaces(result);
	}

	if (info.property === "style" && typeof result === "string") {
		result = parseStyle(result);
	}

	if (info.space && info.property) {
		props[info.property] = result;
	} else if (info.attribute) {
		props[info.attribute] = result;
	}
}
function parseStyle(value: string): Record<string, string> {
	const result: Record<string, string> = {};

	try {
		style(value, iterator);
	} catch {
		// Silent.
	}

	return result;

	function iterator(name: string, v: string) {
		const k = name.slice(0, 4) === "-ms-" ? `ms-${name.slice(4)}` : name;
		result[k.replace(/-([a-z])/g, styleReplacer)] = v;
	}
}
function styleReplacer(_: unknown, $1: string) {
	return $1.toUpperCase();
}
export function flattenPosition(
	pos:
		| Position
		| {
				start: { line: null; column: null; offset: null };
				end: { line: null; column: null; offset: null };
		  },
): string {
	return [
		pos.start.line,
		":",
		pos.start.column,
		"-",
		pos.end.line,
		":",
		pos.end.column,
	]
		.map((d) => String(d))
		.join("");
}
