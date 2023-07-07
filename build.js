import { URL } from "url";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  cpSync,
  rmSync,
} from "fs";
import { dirname, join } from "path";
import { sync } from "glob";
import data from "./data.json" assert { type: "json" };
import { Eta } from "eta";

const __dirname = new URL(".", import.meta.url).pathname;
const eta = new Eta({ views: join(__dirname, "src/static") });

rmSync("dist", {
  recursive: true,
  force: true,
});

if (!existsSync("dist")) {
  mkdirSync("dist");
}

cpSync("public", "dist/public", {
  recursive: true,
});

const pages = sync("src/static/**/*.html");

console.table(pages.map((page) => ({ page })));

function render(template) {
  const str = readFileSync(join(__dirname, template), "utf-8");
  // const options = {
  //   root: join(process.cwd(), "src/static"),
  // };

  const html = eta.renderString(str, data);
  const output = template.replace("src/static/", "dist/public/");

  if (!existsSync(dirname(output))) {
    mkdirSync(dirname(output));
  }

  try {
    writeFileSync(output, html);
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

pages.forEach(render);

const templates = sync("src/static/**/*.eta");

console.table(templates.map((template) => ({ template })));

function copyTemplate(template) {
  const str = readFileSync(join(__dirname, template), "utf-8");
  const output = template.replace("src/static/", "dist/templates/");

  if (!existsSync(dirname(output))) {
    mkdirSync(dirname(output), {
      recursive: true,
    });
  }

  try {
    writeFileSync(output, str);
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

templates.forEach(copyTemplate);
