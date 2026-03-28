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

{% assign drafts = collections.drafts | sort: 'data.updated' | reverse %}
{% for draft in drafts %}
  1. [{{ draft.data.title}}]({{ draft.page.url }})
{% endfor %}
