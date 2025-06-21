---
title: My CSS reset
tags:
  - CSS
  - Web Development
published: 2024-06-05
updated: 2024-06-05
---

I find myself using vanilla CSS more often recently. Especially for smaller websites like this blog. The thing about using just CSS instead of a complete or opinionated styling system is that you have to worry about the default browser styles. This is what [normalise stylesheets and CSS resets](https://mattbrictson.com/blog/css-normalize-and-reset) are for.

Here's the CSS reset that I use now, it's a combination of [modern-normalize](https://github.com/sindresorhus/modern-normalize/) with resets I found from [Kevin Powell](https://www.youtube.com/@KevinPowell):

```css
@import 'modern-normalize.css';

/* src: https://www.youtube.com/watch?v=cCAtD_BAHNw */
* {
  margin: 0;
  padding: 0;
}

html {
  color-scheme: dark light;
  hanging-punctuation: first last;
}

body {
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}

p {
  text-wrap: pretty;
  max-width: 65ch; /* this is optional */
}

button, input, optgroup, select, textarea, legend {
  font: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}

/* src: https://www.youtube.com/watch?v=345V2MU3E_w */
img, picture, svg, video {
  max-width: 100%;
  vertical-align: middle;
  height: auto;
  font-style: italic;
  background-repeat: no-repeat;
  background-size: cover;
  shape-margin: 1rem;
}

@media (prefers-color-scheme: dark) {
  img, picture, video {
    filter: brightness(.8) contrast(1.2);
  }
}

@media (prefers-reduced-motion: no-preference) {
  :has(:target) {
    scroll-behavior: smooth;
    scroll-padding-top: 8rem;
  }
}
```

