<script>
	export let title, emoji, open;
</script>

<details bind:open>
	<summary
		class="text-lg font-bold border-b border-black mb-2 pr-2"
		style={`list-style-type: '${emoji} '`}
		>{title}:
		<span class="float-right">{open ? '▾' : '▸'}</span>
	</summary>
	<slot />
</details>
