import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'
import { feedPlugin } from '@11ty/eleventy-plugin-rss'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import mathJaxPlugin from 'eleventy-plugin-mathjax'
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
  eleventyConfig.amendLibrary('md', (md) => md.use(anchor, {
    permalink: anchor.permalink.headerLink(),
  }))
  eleventyConfig.amendLibrary('md', (md) => md.use(toc, {
    includeLevel: [2, 3],
    containerClass: 'toc',
    listType: 'ol',
    transformContainerOpen: () => `<aside class="toc"><div>
      <h2 id="toc"><a href="#toc" class="header-anchor">Table of Contents</a></h2>`,
    transformContainerClose: () => `</div></aside>`,
  }))
  eleventyConfig.amendLibrary('md', (md) => {
    md.use(footnote)
    // See: https://github.com/markdown-it/markdown-it-footnote/blob/master/index.mjs
    md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
      const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf)
      const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf)
      let refid = id

      if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`

      return `<sup class="footnote-ref">
        <a href="#fn${id}" id="fnref${refid}">${caption}</a>
        <a href="#sn${id}" id="snref${refid}">${caption}</a>
        </sup>`
    }
    md.core.ruler.after('footnote_tail', 'sidenote_content', (state) => {
      const sidenotes = Object.fromEntries(state.tokens
        .map((token, i) => ({ token, i }))
        .filter(({ token }) => token.type === 'footnote_open')
        .map(({ token, i }) => {
          const id = token.meta.id
          const end = state.tokens
            .slice(i + 1)
            .findIndex((t) => t.type === 'footnote_close') + i + 1
          console.assert(end !== -1)

          const footnoteTokens = state.tokens.slice(i + 1, end)
          const html = state.md.renderer.render(footnoteTokens, state.md.options, state.env).replaceAll('fnref', 'snref')

          return [id, html]
        }))
      state.env.sidenotes = sidenotes
    })
    md.core.ruler.after('sidenote_content', 'sidenote_paragraph_inject', (state) => {
      state.tokens = state.tokens.flatMap((token, i, tokens) => {
        if (
          token.type !== 'paragraph_open' ||
          tokens[i + 1]?.type !== 'inline' ||
          tokens[i + 2]?.type !== 'paragraph_close' ||
          !tokens[i + 1].children?.length
        ) {
          return [token]
        }

        const footnotes = tokens[i + 1].children
          .filter((token) => token.type === 'footnote_ref')
          .map((token) => token.meta)
        if (footnotes.length === 0) return [token]

        const sidenote = new state.Token('html_block', '', 0)
        sidenote.content = footnotes
          .map(({ id, label }) =>
            `<aside id="sn${label}" class="sidenote">
               <span class="sidenote-number">${label}.</span>
               <div class="sidenote-content">${state.env.sidenotes[id]}</div>
            </aside>`)
          .join('\n')

        return [sidenote, token]
      })
    })
  })

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
  eleventyConfig.addPlugin(mathJaxPlugin)

  eleventyConfig.addPassthroughCopy({
    './public/': '/',
    './src/ctf/js/ctf.js': '/ctf/ctf.js',
    './src/ctf/js/sw.js': '/flag/sw.js'
  })

  eleventyConfig.addFilter('toISODateString', (d) => d && d.toISOString().split('T')[0])

  eleventyConfig.addShortcode("commitHash", () => execSync('git show -s --format="%h"'))
  eleventyConfig.addShortcode("commitMessage", () => execSync('git show -s --format="%s"'))

  eleventyConfig.addPairedShortcode('table', (content) => (
    `<div style="overflow-x: auto">${content}</div>`
  ))
  eleventyConfig.addPairedShortcode('code', (content, filename) => (
    `<div class="codeblock">
      <div>
        <span>${filename ?? ''}</span>
        <button onclick="copy(this)">Copy</button>
      </div>
      ${content}
    </div>`
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
