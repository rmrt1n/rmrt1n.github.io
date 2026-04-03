---
layout: base.liquid
title: About Me
---

Hi, my name is Ryan Martin. I'm a software developer with way too many interests. Lately, I've been
really into software correctness, security, and performance.
Outside of tech, I enjoy reading, billiards, and exploring good food and drinks.

Currently I'm working on the core systems behind the
[World Engine](https://github.com/argus-labs/world-engine), a real-time game server framework, at
[Argus Labs](https://argus.gg).

<!-- placeholder for any previous exp -->

Here's [what I'm up to now](/now/).

Occasionally, I write articles about things I find interesting. Here are a few recent ones:

{% assign articles = collections.articles | sort: 'data.published' | reverse %}
{% for article in articles limit:3 %}
  - [{{ article.data.title }}]({{ article.page.url }})
{% endfor %}

If you ever want to chat or work together on a project, you can find me on
[GitHub]({{ site.author.github }}), [X]({{ site.author.x }}),
[LinkedIn]({{ site.author.linkedin }}), or email me directly at
[{{ site.author.email }}](mailto:{{ site.author.email }}).

– Ryan.
