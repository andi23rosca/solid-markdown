import withSolid from "rollup-preset-solid";
import { babel } from "@rollup/plugin-babel";

export default withSolid({
  plugins: [babel({ babelHelpers: "bundled" })],
});
