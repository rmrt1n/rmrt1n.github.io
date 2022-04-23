<script>
  export let title, date;
</script>

<article>
  <h1 class="text-2xl font-bold">{title}</h1>
  <p class="text-gray-500 font-sans text-bold">{date}</p>
  <slot />
</article>
<a class="float-right" href="/blog">[blog intro here]</a>
