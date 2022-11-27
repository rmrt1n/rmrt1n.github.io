const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function (eleventyConfig) {
  const markdownLib = markdownIt().use(markdownItAttrs).disable("code");
  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.addPassthroughCopy("./src/styles");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/resume.pdf");
  eleventyConfig.addPassthroughCopy("./src/CNAME");

  // for copyright year
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());
  // fmt date (e.g. Sep 24 2022)
  eleventyConfig.addFilter("dateFmt", (dateStr) =>
    new Date(dateStr).toDateString().slice(4)
  );

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
