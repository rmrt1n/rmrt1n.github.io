---
layout: base.liquid
title: Drafts
eleventyImport:
  collections: ['drafts']
---

You have stumbled upon my drafts. This is where I put my article drafts for review. I usually only
write one article at a time, so it's more often empty or contains only a single draft.

These are works in progress, so please don't share them yet. If you happen to spot a mistake or have
any feedback, I'd love to hear them!

<ol style="margin-left: 1rem">
  {% assign drafts = collections.drafts | sort: 'data.updated' | reverse %}
  {%- for draft in drafts -%}
    <li>
      <a href="{{ draft.page.url }}">{{ draft.data.title}}</a>
    </li>
  {%- endfor -%}
</ol>
