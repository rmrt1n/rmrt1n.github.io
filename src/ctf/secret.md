---
layout: base.liquid
title: Secret
permalink: /secret/
---

Welcome to the not-so-secret secret page. Here's your riddle:

<form action="/ctf/">
  <label for="flag">Flag:</label>
  <input
    required
    id="flag"
    name="rm8"
    pattern="^(?=.{36}$)(?=.{0,})(?=.*(?<=\5e4)(.{4}))(?=.{34}d)(?=[a-z0-9:]+)(?=.{12}(?=..92..c7(?<=c2..1d..)))(?=^.+.82(?=\x65\x32(?=(..)b2)))(?=.{8}f)(?=.{9}c)(?<=^)(^\x72m\x38:)(.+(1c((?<=\x31\x63)f8(?=\x33\x35)(35(..)))))(?!flag).+(?=..\x39\x30)(?=80)\1(.)\9$"
  >
  <button>check</button>
</form>
