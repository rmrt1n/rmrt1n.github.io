---
layout: base.liquid
title: The Flag is Here!
permalink: /flag/
---

You fell for the oldest trick in the book LOL! But seriously, the flag is right here.

![Get rick rolled](./rickroll.gif)

<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/__SW_FILE__')
        .then((reg) => console.log('Service Worker registered:', reg.scope))
        .catch((error) => console.error('Service Worker registration failed:', error))
    });
  }
</script>
