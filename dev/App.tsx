// solid-refresh
import { createSignal, type Component, For } from "solid-js";
import remarkGfm from "remark-gfm";
import { SolidMarkdownStreaming } from "../src";
import type { Components } from "src/types";
// const initial = `# 🚀 **solid-markdown** demo

// Welcome to the **solid-markdown** playground! This is a demo showcasing various markdown features.

// Here is a simple paragraph. You can write sentences here, and they will be rendered as expected. Markdown is great for writing documentation and notes. With markdown, you can easily structure your thoughts, create lists, and even add code snippets. The flexibility of markdown makes it a popular choice for developers, writers, and anyone who values simplicity in formatting. Whether you are jotting down quick notes or composing detailed documentation, markdown provides a clean and efficient way to get your ideas across.

// Another paragraph follows, with more text. Did you know that you can _emphasize_ words, make them **bold**, or even combine **_both_** styles? Try editing this text to see live updates. The real power of markdown comes from its ability to be both human-readable and machine-parsable. This means you can focus on your content without worrying about complex formatting rules. As you continue to explore, you'll find that markdown supports a wide range of features, from tables and images to blockquotes and task lists, all designed to help you communicate more effectively.

// ## Custom component for heading 2

// > "Markdown allows you to write using an easy-to-read, easy-to-write plain text format."
// > — [CommonMark](https://commonmark.org)

// ### Lists

// - Unordered list item one
// - Unordered list item two
//   - Nested item
//   - Another nested item

// 1. Ordered list item one
// 2. Ordered list item two
//    1. Nested ordered item
//    2. Another nested ordered item

// ### Task List

// - [ ] Incomplete task
// - [x] Completed task

// ### Code

// Here is some inline code: \`const x = 42;\`

// \`\`\`js
// // Code block example
// function greet(name) {
//   return \`Hello, \${name}!\`;
// }
// \`\`\`

// ### Images

// ![Solid Logo](https://www.solidjs.com/assets/logo-123b04bc.svg)

// ### Table

// | Feature      | Supported | Notes                |
// | ------------ | :-------: | -------------------- |
// | Headings     |    ✅     | All levels           |
// | Lists        |    ✅     | Ordered & unordered  |
// | Code blocks  |    ✅     | Fenced & inline      |
// | Images       |    ✅     | Markdown & HTML      |
// | Tables       |    ✅     | With alignment       |

// ---

// This is the end of the demo markdown. Feel free to edit and experiment! The more you play with markdown, the more comfortable you'll become with its syntax and capabilities. Remember, markdown is designed to be intuitive and easy to learn, so don't hesitate to try out new features and see how they render in real time.
// `;

const initial = `The implementation, of streaming markdown content presents unique challenges in real-time rendering environments. When processing large documents incrementally, we must carefully balance performance considerations with the user experience. Each chunk of text needs to be parsed, transformed through the unified pipeline, and then efficiently reconciled with the existing DOM structure. This approach allows for responsive feedback even with substantial content, but requires thoughtful handling of state management and diffing algorithms to prevent unnecessary re-renders or visual inconsistencies during the streaming process.

This approach is particularly valuable in contexts where content is being generated or fetched asynchronously, such as AI-powered applications or real-time collaborative editing tools. By rendering content as it becomes available rather than waiting for the complete document, we can significantly improve perceived performance and provide immediate feedback to users. The implementation demonstrated here leverages Solid.js's fine-grained reactivity system to efficiently update only the portions of the DOM that correspond to newly arrived content, maintaining a smooth and responsive user interface throughout the streaming process.
`;
export const App: Component = () => {
	const [md, setMd] = createSignal(initial.slice(0, 10));

	setTimeout(() => {
		setMd(initial.slice(0, 20));
	}, 100);
	setTimeout(() => {
		setMd(initial.slice(0, 40));
	}, 200);

	const [time, setTime] = createSignal(300);

	const [streaming, setStreaming] = createSignal(false);
	const startStreaming = async () => {
		setStreaming(true);
		const m = initial.repeat(100);
		for (let i = 0; i < m.length; i += 10) {
			if (!streaming()) break;
			await new Promise((resolve) => setTimeout(resolve, time()));
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
					code: (props) => {
						console.log("mounted");
						return <code>{props.children}</code>;
					},
					p: (props) => {
						console.log("mounted");
						return (
							<p
								style={{
									color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
								}}
							>
								{props.children}
							</p>
						);
					},
				}}
			>
				{md()}
			</SolidMarkdownStreaming>
			<div class="flex flex-col gap-4">
				<input
					type="number"
					value={time()}
					onInput={(e) => {
						setTime(Number(e.currentTarget.value));
					}}
				/>
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
