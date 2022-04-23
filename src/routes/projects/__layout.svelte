<script>
	import { PROJS } from '$lib/constants';
	import Details from '$lib/components/Details.svelte';
</script>

<div class="h-full border-black px-8 lg:pl-16 pt-6 md:overflow-y-auto">
	<Details open title="Projects" emoji="💻">
		<ul class="md:list-disc list-inside">
			{#each PROJS as i, j}
				<li class="list-item">
					<a class="font-bold" href={`/projects/${i.title}`}>{i.title}</a>
					<p class="ml-4">{i.desc}</p>
					<p />
				</li>
			{/each}
		</ul>
	</Details>
</div>

<div class="h-full border-black px-8 lg:pr-16 pt-6 md:overflow-y-auto">
	<slot />
</div>
