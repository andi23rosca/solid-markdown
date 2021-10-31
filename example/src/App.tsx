import type { Component } from "solid-js";
import remarkGfm from "remark-gfm";

import Markdown from "../../lib";

const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |
`;

const App: Component = () => (
  <div>
    <Markdown children={markdown} remarkPlugins={[remarkGfm]} />
  </div>
);

export default App;
