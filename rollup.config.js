import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/static/main.ts",
    output: {
      file: "dist/main.js",
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
  }
];
