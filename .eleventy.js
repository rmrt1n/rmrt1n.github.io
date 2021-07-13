const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const pluginRss = require("@11ty/eleventy-plugin-rss")

module.exports = function (eleventyConfig) {
  // css & assets
  eleventyConfig.addPassthroughCopy('./src/css/')
  eleventyConfig.addPassthroughCopy('./src/assets/')
  eleventyConfig.addWatchTarget('./src/css/')

  // for copyright year
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // plugins
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(pluginRss)

  return {
    dir: {
      input: "src",
      output: "docs"
    }
  }
}

