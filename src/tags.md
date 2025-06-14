---
layout: base.liquid
title: Tags
---

<ol class="tags">
  {%- for tag in collections.tags -%}
    <li><a href="/tags/{{ tag.tag }}">#{{ tag.tag }} ({{ tag.count }})</a></li>
  {%- endfor -%}
</ol>
