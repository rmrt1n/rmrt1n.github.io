---
title: The Problem with Using 7-Zip on Tar Files
tags:
  - linux
published: 2024-11-20
updated: 2024-11-20
---

If you're like me, you probably don't remember the [`tar`](https://www.man7.org/linux/man-pages/man1/tar.1.html) commands. In modern UX standards, `tar` probably stands at the very bottom of user-friendliness. They're so hard to remember, there's even an [xkcd about it](https://xkcd.com/1168/).

![xkcd on tar](./7z-tar-1.png)

Instead of remembering the `tar` commands, I use [7-Zip](https://en.wikipedia.org/wiki/7-Zip). Not only does it extract tar files, it also works on a lot of other archive formats like ZIP files and its own 7z format. There is however, a limitation of 7-Zip when dealing with tar files.

Tar files preserve file permissions and symbolic links. [7-Zip unfortunately doesn't respect this](https://unix.stackexchange.com/questions/600282/preserve-file-permissions-and-symlinks-in-archive-with-7-zip) and won't preserve them when extracting tar files. There are no workarounds here, so you'll have to fallback to using `tar`.

[Here's a cheatsheet](https://devhints.io/tar).
