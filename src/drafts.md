---
layout: base.liquid
title: Drafts
eleventyImport:
  collections: ['articles']
---

You have stumbled upon my drafts. This is where I put my article drafts for review. I usually only
write one article at a time, so it's more often empty or contains only a single draft.

These are works in progress, so please don't share them yet. If you happen to spot a mistake or have
any feedback, I'd love to hear them!

<ol style="margin-left: 1rem">
  {% assign articles = collections.articles | sort: 'data.updated' | reverse %}
  {%- for article in articles -%}
    {%- if article.data.draft -%}
      <li>
        <a href="{{ article.page.url }}">{{ article.data.title}}</a>
      </li>
    {%- endif -%}
  {%- endfor -%}
</ol>
