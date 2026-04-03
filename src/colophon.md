---
layout: base.liquid
title: Colophon
---

## Technology and Design

<!-- This site is built with [Eleventy (11ty)](https://www.11ty.dev/). I've tried a lot of different web -->
<!-- frameworks, but I keep coming back to it. It's simple, flexible, has a lot of useful plugins, and -->
<!-- just gets the job done. -->

This site is built with the [Eleventy (11ty)](https://www.11ty.dev/) static site generator and is
hosted on [GitHub Pages](https://pages.github.com/). Styling and bits of interactivity are done
using plain CSS and JavaScript.
I write my articles in [Obsidian](https://obsidian.md/)
and just manually copy+paste them into this site's repo.

The visual design of this site is largely inspired by the
[BMFW](http://bettermotherfuckingwebsite.com/) and [Craigslist](https://craigslist.org/). I'm a big
fan of brutalist aesthetics. I try to keep the design simple so the focus stays on the content.
Extra features are usually there to improve the reading experience.

The site doesn't use cookies or analytics scripts.


## AI Disclosure

I hate AI-generated content as much as you do. All articles on this site are written by me. I use AI
for editing and improving my writing, e.g. grammar correction, simplifying explanations,
prose/stylistic improvements, but the main ideas and content are my own.


## License

The code for this site is open source under the [MIT license](https://spdx.org/licenses/MIT.html)
and is available on [GitHub](https://github.com/rmrt1n/rmrt1n.github.io). Content on this site, such
as articles and snippets, is licensed under the Creative Commons license
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Version

Last updated on <time>{{ 'now' | date: '%d %B %Y' }}</time>:

<pre class="language-plaintext">
<code class="language-plaintext"><a href="https://github.com/rmrt1n/rmrt1n.github.io/commit/{% commitHash %}" style="display:inline-block">{% commitHash %}</a> – {% commitMessage %}</code></pre>
