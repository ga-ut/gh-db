import { build } from "rolldown";
import pkg from "./package.json";

const external = [...Object.keys(pkg.devDependencies)];

build([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.mjs",
      format: "esm",
      target: "es2018",
    },
    external,
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      target: "es2018",
    },
    external,
  },
]);
