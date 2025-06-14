---
layout: base.liquid
title: Tags
pagination:
  data: collections
  size: 1
  alias: tag
  filter:
    - articles
    - snippets
permalink: /tags/{{ tag }}/
---

Tagged **#{{ tag }}**:

<ul class="archive">
  {% assign posts = collections[tag] | sort: 'data.published' | reverse %} 
  {%- for post in posts -%}
    <li>
      <time>{{ post.data.published | toISODateString }}</time>
      <a href="{{ post.page.url }}">{{ post.data.title }}</a>
    </li>
  {%- endfor -%}
</ul>
