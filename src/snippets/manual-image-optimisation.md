---
title: How to Manually Optimise Images for the Web
tags:
  - HTML
  - Performance
  - Web Development
published: 2024-05-16
updated: 2024-05-22
---

JavaScript frameworks and build tools like [Next.js](https://nextjs.org/), [Astro](https://astro.build/), and [Vite](https://vitejs.dev/) perform optimisations on images to improve the performance of websites. If you're not using any tools that does this automatically, here are some things you can do to optimise the images in your website.

1. Convert the images to `.webp` or `.avif` formats. These are the best formats for images on the web, as they are smaller in size but still have a similar image quality to larger formats like `.png`. In terms of image size, `.avif` is smaller than `.webp`, but both formats would still work well. Here's a command you can run to convert formats from the command line:[^1]

```bash
# this converts the image format. you can also specify the output file name
__$ gm convert image.jpg image.webp

# you can shrink the image size even further at the cost of image quality
__$ gm convert -quality 75 image.jpg image.webp
```

2. Set the `width` and `height` attributes. Just use the image's size if you're not resizing it. This is needed to prevent [cumulative layout shifts (CLS)](https://web.dev/articles/cls).
3. Set `loading="lazy"`. This will defer the loading of the image until it is almost scrolled into the viewport. There's an exception to this. For important images, such as the [largest contentful paint (LCP)](https://web.dev/articles/lcp) image, set `loading="eager"`. [SvelteKit](https://kit.svelte.dev/docs/images) also recommends to set `fetchpriority="high"` for this.
4. Set `decoding="async"`. This will defer the decoding of the image until after the other DOM content is loaded.
5. Set the `alt` attribute. Images aren't always loaded. It's just a good practice to have an `alt` text, except if the image is purely for decoration.

There are more optimisations you can do, such as using different image sizes depending on the user's device size,[^2] but these should be enough for basic use cases.

[^1]: I'm using [GraphicsMagick](http://www.graphicsmagick.org/) here, but the commands should still work the same if you're using [ImageMagick](https://imagemagick.org), as the APIs are compatible.
[^2]: Here's a good [article about implementing responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images). JavaScript frameworks have their own ways of doing this, usually through their own `Image` components.
