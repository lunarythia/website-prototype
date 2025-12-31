import fs, { watch } from "fs";
import path from "path";

import cssnano from 'cssnano';
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import htmlminifier from "html-minifier-terser";

import autoprefixer from "autoprefixer";

import { HtmlBasePlugin } from "@11ty/eleventy";

export default async function (eleventyConfig) {
  eleventyConfig.addWatchTarget("./src/");

  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Minify HTML : https://www.11ty.dev/docs/transforms/#minify-html-output
  eleventyConfig.addTransform("htmlminifier", function (content) {
    // String conversion to handle `permalink: false`
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlminifier.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });

      return minified;
    }

    // If not an HTML output, return content as-is
    return content;
  });

  // Compile Tailwind : https://www.humankode.com/eleventy/how-to-set-up-tailwind-4-with-eleventy-3/
  eleventyConfig.on("eleventy.after", async () => {
    const tailwindInput = path.resolve("./src/style.css");
    const tailwindOutput = path.resolve("./build/style.css");
    const cssContent = fs.readFileSync(tailwindInput);
    const outputDir = path.dirname(tailwindOutput);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const result = await processor.process(cssContent, {
      from: tailwindInput,
      to: tailwindOutput,
    });
    fs.writeFileSync(tailwindOutput, result.css);
  });

  const processor = postcss([
    tailwindcss({ base: "./build" }),
    autoprefixer(),
    cssnano({
      preset: 'default',
    }),
  ]);
}

export const config = {
  dir: {
    input: "src",
    output: "build",
  },
};
