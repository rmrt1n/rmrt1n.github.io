<script>
  export let hide, list, min;
  /* ••• */
</script>

<button
  class=" float-right"
  class:hidden={list.length < min}
  on:click={() => hide = !hide}
>
  {hide ? "see more..." : "see less..."}
</button>
