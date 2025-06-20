import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'
import { feedPlugin } from '@11ty/eleventy-plugin-rss'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import markdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import footnote from 'markdown-it-footnote'
import toc from 'markdown-it-table-of-contents'
import crypto from 'node:crypto'
import { execSync } from 'node:child_process'

export default function (eleventyConfig) {
  eleventyConfig.setLibrary('md', markdownIt({
    html: true,
    typographer: true,
  }))
  eleventyConfig.amendLibrary('md', (md) => md.use(footnote))
  eleventyConfig.amendLibrary('md', (md) => md.renderer.rules.footnote_block_open = () => (
    '<p id="asterism">⁂</p>' +
    '<section class="footnotes">\n' +
    '<ol class="footnotes-list">\n'
  ))
  eleventyConfig.amendLibrary('md', (md) => md.use(anchor, {
    permalink: anchor.permalink.headerLink(),
  }))
  eleventyConfig.amendLibrary('md', (md) => md.use(toc, {
    includeLevel: [2, 3],
    containerClass: 'toc',
    listType: 'ol',
    transformContainerOpen: () => `<aside class="toc"><div><h2>Table of Contents</h2>`,
    transformContainerClose: () => `</div></aside>`,
  }))

  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin)
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(feedPlugin, {
    type: 'atom',
    outputPath: '/feed.xml',
    collection: {
      name: 'articles',
      limit: 0,
    },
    metadata: {
      language: 'en',
      title: "Ryan Martin's Blog",
      subtitle: '',
      base: 'https://ryanmartin.me/',
      author: {
        name: 'Ryan Martin',
        email: 'hi@ryanmartin.me',
      },
    },
  })
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

  eleventyConfig.addShortcode("commitHash", () => execSync('git show -s --format="%h"'))
  eleventyConfig.addShortcode("commitMessage", () => execSync('git show -s --format="%s"'))

  eleventyConfig.addPairedShortcode('table', (content) => (
    `<div style="overflow-x: auto">${content}</div>`
  ))

  eleventyConfig.addCollection('tags', (collection) => {
    const frequencies = collection
      .getAll()
      .flatMap((item) => item.data.tags ?? [])
      .filter((tag) => !['articles', 'snippets'].includes(tag))
      .reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }), {})
    return Object.entries(frequencies)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  })

  eleventyConfig.addPreprocessor('toc', 'md', (data, content) => (
    data.tags?.includes('articles')
      ? content.replace(/^##\s/m, '[[toc]]\n## ')
      : content
  ))

  eleventyConfig.addTransform('ps1', (content) => {
    return content.replaceAll(
      '__$ ',
      `<code style="user-select:none;color:var(--color-links)">$ </code>`,
    )
  })

  eleventyConfig.addGlobalData('eleventyComputed', {
    eleventyExcludeFromCollections: (data) => data.draft ?? data.eleventyExcludeFromCollections,
    permalink: (data) => {
      if (data.draft) {
        const hash = crypto.createHash('md5').update(data.title).digest('hex')
        return `drafts/${hash}/`
      }
      return data.permalink
    },
  })

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  }
}
