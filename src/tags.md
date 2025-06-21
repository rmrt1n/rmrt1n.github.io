---
layout: base.liquid
title: Tags
---

<p>Browse by topic:</p>

<ol class="tags">
  {%- for tag in collections.tags -%}
    <li><a href="#{{ tag.tag | slugify }}">#{{ tag.tag | slugify }} ({{ tag.count }})</a></li>
  {%- endfor -%}
</ol>

{%- for tag in collections.tags -%}
  <h2 id="{{ tag.tag | slugify }}">
    <a href="#{{ tag.tag }}" class="header-anchor">{{ tag.tag }}</a>
  </h2>
  <ul class="archive">
    {% assign posts = collections[tag.tag] | sort: 'data.published' | reverse %}
    {%- for post in posts -%}
        <li>
          <time>{{ post.data.published | toISODateString }}</time>
          <a href="{{ post.page.url }}">{{ post.data.title }}</a>
        </li>
    {%- endfor -%}
  </ul>
{%- endfor -%}
