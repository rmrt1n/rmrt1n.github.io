---
layout: base.liquid
title: Snippets
eleventyImport:
  collections: ['snippets']
---

Snippets are random notes, thoughts, or code that I want to remember and share, but are not long
enough to be an article by themselves.

<ul class="archive">
  {% assign snippets = collections.snippets | sort: 'data.published' | reverse %} 
  {%- for snippet in snippets -%}
    <li>
      <time>{{ snippet.data.published | toISODateString }}</time>
      <a href="{{ snippet.page.url }}">{{ snippet.data.title}}</a>
    </li>
  {%- endfor -%}
</ul>
