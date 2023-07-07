import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
// import commonjs from "@rollup/plugin-commonjs";
// import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/static/main.ts",
    output: {
      file: "dist/public/main.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      resolve({
        extensions: [".ts"],
      }),
      typescript({
        sourceMap: true,
      }),
      terser(),
    ],
  },
];
