<script>
  import { BLOGS } from '$lib/constants'
  import Details from '$lib/components/Details.svelte';
</script>

<div class="h-full px-8 lg:pl-16 pt-6 md:overflow-y-auto">
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

<div class="w-screen md:w-full h-full px-8 lg:pr-16 pt-6 md:overflow-y-auto">
	<slot />
</div>
