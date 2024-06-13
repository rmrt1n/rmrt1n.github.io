const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const rss = require('@11ty/eleventy-plugin-rss')
const { eleventyImageTransformPlugin } = require('@11ty/eleventy-img')
const markdownIt = require('markdown-it')
const footnote = require('markdown-it-footnote')
const anchor = require('markdown-it-anchor')

const markdownItOpts = {
  html: true,
  typographer: true,
}

module.exports = (eleventyConfig) => {
  const md = markdownIt(markdownItOpts)
    .use(footnote)
    .use(anchor, {
      permalink: anchor.permalink.headerLink()
    })

  eleventyConfig.setLibrary('md', md)

  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(rss)
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['webp'],
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
    },
    sharpOptions: {
      animated: true,
    },
  })

  eleventyConfig.addPassthroughCopy({
    './public/': '/',
  })

  eleventyConfig.addFilter('toISODateString', (d) => d && d.toISOString().split('T')[0])

  eleventyConfig.addPairedShortcode(
    'table',
    (content) => `<div style="overflow-x: auto">${content}</div>`,
  )

  eleventyConfig.addCollection('tags', (collection) => {
    const tags = {}
    collection.getAll().forEach((item) => {
      if (!item.data.tags) return
      item.data.tags
        .filter((tag) => !['articles', 'snippets'].includes(tag))
        .forEach((tag) => {
          if (tags[tag]) {
            tags[tag]++
          } else {
            tags[tag] = 1
          }
        })
    })
    return Object.keys(tags)
      .map((tag) => ({ tag, count: tags[tag] }))
      .sort((a, b) => b.count - a.count)
  })

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  }
}
