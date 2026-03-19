---
layout: base.liquid
title: Articles
eleventyImport:
  collections: ['articles']
---

An archive of things I've written, mostly technical. You can [filter by tags](/tags) or subscribe to
updates via [this RSS feed](/feed.xml). If you have any feedback or corrections on my posts, please
[email](mailto:{{ metadata.author.email }}) or [message me on X]({{ metadata.author.x }})!

<ul class="archive">
  {% assign articles = collections.articles | sort: 'data.published' | reverse %} 
  {%- for article in articles -%}
    {%- if not article.data.draft -%}
      <li>
        <time>{{ article.data.published | toISODateString }}</time>
        <a href="{{ article.page.url }}">{{ article.data.title}}</a>
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>
