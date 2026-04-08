import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'
import { feedPlugin } from '@11ty/eleventy-plugin-rss'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import mathJaxPlugin from 'eleventy-plugin-mathjax'
import markdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import footnote from 'markdown-it-footnote'
import toc from 'markdown-it-table-of-contents'
import o from 'javascript-obfuscator'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

export default function (eleventyConfig) {
  // -----------------------------------------------------------------------------------------------
  // Markdown-it plugins and modifications.
  // -----------------------------------------------------------------------------------------------
  // Configure markdown-it settings.
  eleventyConfig.setLibrary('md', markdownIt({
    html: true,
    typographer: true,
  }))

  // Register heading anchor plugin.
  eleventyConfig.amendLibrary('md', (md) => md.use(anchor, {
    permalink: anchor.permalink.headerLink(),
  }))

  // Register table of contents plugin.
  eleventyConfig.amendLibrary('md', (md) => md.use(toc, {
    includeLevel: [2, 3],
    containerClass: 'toc',
    listType: 'ol',
    transformContainerOpen: () => `<aside class="toc"><div>
      <h2 id="toc"><a href="#toc" class="header-anchor">Table of Contents</a></h2>`,
    transformContainerClose: () => `</div></aside>`,
  }))

  // Register footnotes plugin and modify output to produce sidenotes.
  eleventyConfig.amendLibrary('md', (md) => {
    md.use(footnote)
    // Output two refs, one for footnotes and the other for sidenotes.
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
    // Customize footnotes separator style.
    md.renderer.rules.footnote_block_open = (tokens, idx, options) => {
      return ((options.xhtmlOut
        ? '<hr class="footnotes-sep asterism" />\n'
        : '<hr class="footnotes-sep asterism">\n')) +
        '<section class="footnotes" aria-label="footnotes">\n' +
        '<ol class="footnotes-list">\n'
    }
    // For each footnote, copy its content into the global sidenotes map.
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
          const html = state.md.renderer
            .render(footnoteTokens, state.md.options, state.env)
            .replaceAll('fnref', 'snref')

          return [id, html]
        }))
      state.env.sidenotes = sidenotes
    })
    // For each sidenote, output the HTML.
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

  // -----------------------------------------------------------------------------------------------
  // Eleventy plugins.
  // -----------------------------------------------------------------------------------------------
  // Register Input path to url plugin.
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin)

  // Register and configure syntax highlight plugin.
  eleventyConfig.addPlugin(syntaxHighlight, {
    // Extra Prism rules added by GPT 5.4. I couldn't bother writing the regex myself.
    languages: ['javascript', 'clojure', 'zig', 'go'],
    init: ({ Prism }) => {
      Prism.languages.insertBefore('javascript', 'function-variable', {
        definitions: {
          // Approximate top-level declarations by requiring the name to start at line start.
          pattern: /(^(?:(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+|(?:export\s+(?:default\s+)?)?class\s+|(?:export\s+)?const\s+))[$A-Z_a-z][\w$]*/m,
          lookbehind: true,
        },
      })
      Prism.languages.insertBefore('clojure', 'keyword', {
        definitions: {
          // Highlight names introduced by top-level def-like forms.
          pattern: /(^\s*\((?:def[a-z-!?*+<>=/.]*|deftype|defrecord|defprotocol|defstruct|definterface)\s+)[\w*+!?'<>=/.-]+/m,
          lookbehind: true,
        },
      })
      Prism.languages.insertBefore('zig', 'class-name', {
        definitions: [
          {
            pattern: /(^\s*(?:pub\s+)?(?:inline\s+)?(?:noinline\s+)?(?:export\s+)?(?:extern\s+)?fn\s+)\w+/m,
            lookbehind: true,
          },
          {
            pattern: /(^\s*(?:pub\s+)?const\s+)\w+(?=\s*=\s*(?:(?:extern|packed)\s+)?(?:struct|enum|union|opaque)\b)/m,
            lookbehind: true,
          },
        ],
      })
      Prism.languages.insertBefore('go', 'keyword', {
        definitions: [
          {
            pattern: /(^\s*func(?:\s*\([^\n)]*\))?\s+)[A-Za-z_]\w*/m,
            lookbehind: true,
          },
          {
            pattern: /(^\s*type\s+)[A-Za-z_]\w*/m,
            lookbehind: true,
          },
        ],
      })
    },
  })

  // Register and configure feed plugin.
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

  // Register and configure image transform plugin.
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

  // Register and configure mathjax plugin.
  eleventyConfig.addPlugin(mathJaxPlugin)

  // -----------------------------------------------------------------------------------------------
  // Passthrough copies and bundles.
  // -----------------------------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ './src/_assets/*': '/' })
  eleventyConfig.addBundle('css')
  eleventyConfig.addBundle('js')

  // -----------------------------------------------------------------------------------------------
  // Filters and short codes.
  // -----------------------------------------------------------------------------------------------
  eleventyConfig.addFilter('cleanMarkdown', (s) =>
    s.replaceAll('[[toc]]', '').replaceAll(/\{.*\}/g, '')
  )

  eleventyConfig.addShortcode("commitHash", () => execSync('git show -s --format="%h"'))
  eleventyConfig.addShortcode("commitMessage", () => execSync('git show -s --format="%s"'))

  eleventyConfig.addPairedShortcode('table', (content) => (
    `<div style="overflow-x: auto; border: 0.05rem solid var(--color-border);">${content}</div>`
  ))
  eleventyConfig.addPairedShortcode('code', (content, filename) => (
    `<div class="codeblock">
      <div>
        <span>${filename ?? ''}</span>
        <button onclick="copy(this)" hidden>Copy</button>
      </div>
      ${content}
    </div>`
  ))

  // -----------------------------------------------------------------------------------------------
  // Collections, data, output transformation.
  // -----------------------------------------------------------------------------------------------
  eleventyConfig.addGlobalData('eleventyComputed', {
    permalink: (data) => data.draft
      ? `drafts/${data.page.fileSlug}/`
      : data.permalink,
    eleventyExcludeFromCollections: (data) => data.draft
      ? ['articles']
      : data.eleventyExcludeFromCollections,
  })

  eleventyConfig.addCollection('tags', (collection) => {
    const frequencies = collection
      .getAll()
      .filter((item) => !item.data.draft)
      .flatMap((item) => item.data.tags ?? [])
      .filter((tag) => !['articles'].includes(tag))
      .reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }), {})
    return Object.entries(frequencies)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  })
  eleventyConfig.addCollection('drafts', (collection) => {
    return collection.getAll().filter((item) => item.data.draft === true)
  })
  eleventyConfig.addCollection('markdown', (collection) => {
    return collection.getAll().filter((item) => item.data.tags?.includes('articles'))
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

  // -----------------------------------------------------------------------------------------------
  // CTF build.
  // -----------------------------------------------------------------------------------------------
  // Obfuscate before build so the %include in base.liquid still works.
  eleventyConfig.on('eleventy.before', ({ runMode, directories }) => {
    // if (runMode !== 'build') return // Comment out for local testing
    console.log('[11ty/ctf] Obfuscating analytics.js')

    const js = readFileSync('./src/ctf/js/analytics.js', 'utf-8');
    const result = o.obfuscate(js, {
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 1
    })

    writeFileSync('./src/_assets/js/analytics.gen.js', result.getObfuscatedCode(), 'utf-8')
  })

  // Update /flag/ and  sw.js w the correct asset names.
  eleventyConfig.on('eleventy.after', ({ runMode, directories }) => {
    // if (runMode !== 'build') return // Comment out for local testing
    console.log('[11ty/ctf] Updating service worker')

    const result = readdirSync(directories.output)
    const css = result.filter((file) => file.endsWith('.css'))[0]
    console.assert(css, 'css bundle not found')


    let swContents = readFileSync('./src/ctf/js/sw.js', 'utf-8')
    swContents = swContents.replace('__CSS_FILE__', css)
    const swOutputName = `flag/${hash(swContents)}.js`

    writeFileSync(`${directories.output}/${swOutputName}`, swContents)

    const flagName = `${directories.output}/flag/index.html`
    const flagContents = readFileSync(flagName, 'utf-8')

    writeFileSync(flagName, flagContents.replace('__SW_FILE__', swOutputName))
  })

  // Build the checker and copy it to the output directory.
  eleventyConfig.on('eleventy.after', ({ runMode, directories }) => {
    // if (runMode !== 'build') return // Comment out for local testing
    console.log('[11ty/ctf] Building flag checker')

    const checkerName = './src/ctf/checker.zig'
    const checkerContents = readFileSync(checkerName)
    const outputName = `${hash(checkerContents)}.wasm`

    execSync(`zig build-exe ${checkerName} -target wasm32-freestanding -fno-entry --export=check_flag -O ReleaseSmall -femit-bin='${directories.output}/${outputName}'`)

    const ctf = readFileSync(`${directories.output}/ctf/index.html`, 'utf-8')
    const scripts = [...ctf.matchAll(/<script.*src="(.+.js)".*>/g)]
    const ctfScriptName = `${directories.output}/${scripts[scripts.length - 1][1]}`
    const ctfScriptContents = readFileSync(ctfScriptName, 'utf-8')

    writeFileSync(ctfScriptName, ctfScriptContents.replace('__WASM_FILE__', outputName))
  })

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  }
}

function hash(contents) {
  return createHash('sha256').update(contents).digest('base64url').slice(0, 10)
}
