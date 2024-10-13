import { feedPlugin } from '@11ty/eleventy-plugin-rss'
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import markdownIt from 'markdown-it'
import footnote from 'markdown-it-footnote'
import anchor from 'markdown-it-anchor'

export default function (eleventyConfig) {
  eleventyConfig.setLibrary('md', markdownIt({
    html: true,
    typographer: true
  }))
  eleventyConfig.amendLibrary('md', (md) => md.use(footnote))
  eleventyConfig.amendLibrary('md', (md) => md.use(anchor, {
    permalink: anchor.permalink.headerLink()
  }))

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
      title: 'Ryan Martin\'s Blog',
      subtitle: '',
      base: 'https://ryanmartin.me/',
      author: {
        name: 'Ryan Martin',
        email: 'hi@ryanmartin.me'
      }
    }
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

  eleventyConfig.addTransform('ps1', (content) => {
    return content.replaceAll('__$ ',
      `<code style="user-select:none;color:var(--color-links)">$ </code>`
    );
  })

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  }
}
