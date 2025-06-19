---
layout: base.liquid
title: Colophon
---

This site is built using [Eleventy (11ty)](https://www.11ty.dev/). I've tried a lot of web
frameworks but I always end up back with 11ty. It's simple, flexible, has a lot of useful plugins,
and just gets the job done. The site is hosted on [GitHub Pages](https://pages.github.com/).

Fonts used are based on a slightly modified [Modern Font Stacks](https://modernfontstacks.com/).
Heading text uses transitional typefaces and body text uses neo-grotesque typefaces. Code blocks are
set in [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono).

The code for this site is open source under the [MIT license](https://spdx.org/licenses/MIT.html)
and is available on [GitHub](https://github.com/rmrt1n/rmrt1n.github.io). Content on this site, such
as articles and snippets, is licensed under the Creative Commons license
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

This site doesn't use cookies or analytics scripts.

Build:
[`{% commitHash %}`](https://github.com/rmrt1n/rmrt1n.github.io/commit/{% commitHash %})
` – {% commitMessage %} ({{ 'now' | date: '%Y-%m-%d %H:%M %z' }})`.
