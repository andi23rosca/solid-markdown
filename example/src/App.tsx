import type { Component } from "solid-js";
import remarkGfm from "remark-gfm";

import SolidMarkdown from "../../lib";

const App: Component = () => {
  return (
    <div>
      <SolidMarkdown remarkPlugins={[remarkGfm]}>
        {`A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`}
      </SolidMarkdown>
    </div>
  );
};

export default App;
