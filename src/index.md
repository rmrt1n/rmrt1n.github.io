---
title: rmrt1n
layout: base.njk
---

<ul>
{% assign posts = collections.posts | reverse %}
{% for post in posts %}
<li>
  <date>{{ post.date | date: "%Y-%m-%d" }}</date>
  <a href="{{ post.url }}" class="post-title">{{ post.data.title }}</a>
</li>
{% endfor %}
<ul>

