// solid-refresh
import { createSignal, type Component, For } from "solid-js";
import remarkGfm from "remark-gfm";
import { SolidMarkdown, SolidMarkdownStreaming } from "../src";
import type { Components } from "src/types";
const initial = `
* [x] done
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list
	* Nested list`;

export const App: Component = () => {
	const [md, setMd] = createSignal(initial.slice(0, 10));

	setTimeout(() => {
		setMd(initial.slice(0, 20));
	}, 100);
	setTimeout(() => {
		setMd(initial.slice(0, 40));
	}, 200);

	const [streaming, setStreaming] = createSignal(false);
	const startStreaming = async () => {
		setStreaming(true);
		const m = initial.repeat(100);
		for (let i = 0; i < m.length; i += 5) {
			if (!streaming()) break;
			await new Promise((resolve) => setTimeout(resolve, 15));
			setMd(m.slice(0, i));
		}
	};

	return (
		<div class="grid grid-cols-2 gap-4 container place-content-start mx-auto px-10 pt-10">
			{/* <textarea
				rows={md().split(/\r\n|\r|\n/).length + 2}
				class="editor"
				onInput={(e) => {
					setMd(e.currentTarget.value);
				}}
				contentEditable
			>
				{md()}
			</textarea> */}

			<SolidMarkdownStreaming
				remarkPlugins={[remarkGfm]}
				components={{
					h2: Heading2,
				}}
			>
				{md()}
			</SolidMarkdownStreaming>
			<div class="flex flex-col gap-4">
				<button
					type="button"
					onClick={() => {
						if (streaming()) {
							setStreaming(false);
							return;
						}
						startStreaming();
					}}
				>
					{streaming() ? "Stop streaming" : "Start streaming"}
				</button>
			</div>
		</div>
	);
};

const Heading2: Components["h2"] = (props) => {
	return <p style={{ color: "red" }}>{props.children}</p>;
};
