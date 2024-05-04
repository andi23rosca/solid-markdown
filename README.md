<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-markdown&background=tiles&project=%20" alt="solid-markdown">
</p>

# `solid-markdown`

Render markdown as solid components.

The implementation is 90% shamelessly copied from https://github.com/remarkjs/react-markdown.

Changes include:

- Replacing React specific component creation with SolidJS components
- Porting the implementation from javascript with JSDoc types to typescript

Please check the original repo for in-depth details on how to use.

## Installation
```bash
npm install solid-markdown
```


## Usage

```jsx
import { SolidMarkdown } from "solid-markdown";

const markdown = `
# This is a title

- here's
- a
- list
`;
const App = () => {
  return <SolidMarkdown children={markdown} />;
};
```

## Rendering strategy
There's an extra option you can pass to the markdown component: `renderingStrategy: "memo" | "reconcile"`.

The default value is `"memo"`, which means that the markdown parser will generate a new full AST tree each time (inside a `useMemo`), and use that.
As a consequence, the full DOM will be re-rendered, even the markdown nodes that haven't changed. (Should be fine 90% of the time).

Using `reconcile` will switch the strategy to using a solid store with the `reconcile` function (https://docs.solidjs.com/reference/store-utilities/reconcile). This will diff the previous and next markdown ASTs and only trigger re-renders for the parts that have changed.
This will help with cases like streaming partial content and updating the markdown gradually (see https://github.com/andi23rosca/solid-markdown/issues/32).


```tsx
<SolidMarkdown renderingStrategy="reconcile" children={markdown} />;
```

## TODO

- [ ] Port unit tests from from original library
