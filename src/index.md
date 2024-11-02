---
layout: base.liquid
title: Ryan Martin | About
---

I'm a designer and developer based in Indonesia. My work usually ranges from
product design and web development to low-level systems and software security.
Currently I'm working on developer tooling for the
<a href="https://github.com/argus-labs/world-engine">World Engine</a>, an SDK
for building onchain games, at <a href="https://argus.gg">Argus Labs</a>.

<!-- placeholder for any previous exp -->

Occasionally, I write (mostly technical) articles about the things I've learnt.
Here are some of my recent posts:

<ul style="margin-left: 1rem">
  {% assign articles = collections.articles | sort: 'data.published' | reverse %}
  {%- for article in articles limit:3 -%}
    <li style="margin-top: .25rem;">
      <a href="{{ article.page.url }}">{{ article.data.title}}</a>
    </li>
  {%- endfor -%}
</ul>


If you ever want to chat or have any questions, don’t hesitate to reach out! You
can find me on [GitHub](https://github.com/rmrt1n),
[X](https://x.com/gud_mornign), [LinkedIn](https://linkedin.com/in/ryanmrt1n),
or email me directly at [hi@ryanmartin.me](mailto:hi@ryanmartin.me).
