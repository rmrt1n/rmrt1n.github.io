<script>
	import { BLOGS } from '$lib/constants';
	import Details from '$lib/components/Details.svelte';
</script>

<div class="h-full pt-6 md:overflow-y-auto">
	<Details open title="Blog" emoji="✍️">
		<ul class="md:list-disc list-inside">
			{#each BLOGS as i, j}
				<li class="list-item">
					<a href={`/blog/${i.slug}`}>{i.title}</a>
				</li>
			{/each}
		</ul>
	</Details>
</div>

<div class="w-[calc(100vw_-_2rem)] md:w-full h-full pt-6 md:overflow-y-auto">
	<slot />
</div>
