// solid-refresh
import { createSignal, type Component, createEffect, onMount } from "solid-js";
import remarkGfm from "remark-gfm";
import { SolidMarkdown } from "../src";
import { Components } from "src/types";
const initial = `# 🚀 solid-markdown demo

Edit any of the text and see it rendered in real time.

A paragraph with *emphasis* and **strong importance**.

## Custom component for heading 2

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done
	1. nested
	2. lists
* another one

  nested text under a list item

A table:

| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |`;

const App: Component = () => {
	const [md, setMd] = createSignal(initial);

	return (
		<div class="container">
			<textarea
				rows={md().split(/\r\n|\r|\n/).length + 2}
				class="editor"
				onInput={(e) => {
					setMd(e.currentTarget.value);
				}}
				contentEditable
			>
				{md()}
			</textarea>

			<SolidMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h2: Heading2,
				}}
			>
				{md()}
			</SolidMarkdown>
		</div>
	);
};

const Heading2: Components["h2"] = (props) => {
	return <p style={{ color: "red" }}>{props.children}</p>;
};

export default App;
