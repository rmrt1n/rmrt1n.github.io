---
layout: base.liquid
title: About
---

Hi there 👋,

I'm a software developer from Indonesia. I'm interested in foundational software, cybersecurity, and
the craft of software engineering — from compilers to command lines to user-facing apps. Outside of
work, I enjoy reading, playing billiards, and finding good food and drinks.

Currently I'm working on the core systems behind the
[World Engine](https://github.com/argus-labs/world-engine), an SDK for building onchain games, at
[Argus Labs](https://argus.gg).

<!-- placeholder for any previous exp -->

Occasionally, I write articles about the things I've learned or encountered at work. Here are a few
recent ones:

<ul style="margin-left: 1rem">
  {% assign articles = collections.articles | sort: 'data.published' | reverse %}
  {%- for article in articles limit:3 -%}
    <li style="margin-top: .25rem;">
      <a href="{{ article.page.url }}">{{ article.data.title}}</a>
    </li>
  {%- endfor -%}
</ul>


If you ever want to chat or work together on a project, you can find me on
[GitHub](https://github.com/rmrt1n), [X](https://x.com/gud_mornign),
[LinkedIn](https://linkedin.com/in/ryanmrt1n), or email me directly at
[hi@ryanmartin.me](mailto:hi@ryanmartin.me).

– Ryan.
