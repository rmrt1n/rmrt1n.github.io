<script>
	import { EXPS, SKILLS, PROJS, BLOGS, AWARDS, BOOKS } from '$lib/constants';
	import Details from '$lib/components/Details.svelte'
</script>

<div class="h-full px-8 lg:px-16 pt-6 md:overflow-y-auto">
	<Details open title="About" emoji="👋">
		<p class="mb-2">Hi there!</p>
		<p class="mb-2">
			I'm a software developer with a passion for open source and building solutions with 
			positive impact. Currently pursuing a degree in computer science at 
			<a href="https://apu.edu.my" target="_blank">Asia Pacific University</a>.
		</p>
		<p class="mb-1">
			This site contains my portfolio and my blog, which contains some of things I've 
			learnt over the years. If you dig around enough, maybe you'll find something interesting.
		</p>
	</Details>
</div>

<div class="h-full px-8 lg:px-16 md:pt-6 md:overflow-y-auto">
	<br class="md:hidden"><br class="md:hidden">

	<Details title="Experience" emoji="💼">
		<ul class="md:list-disc list-inside">
			{#each EXPS as i, j}
				<li>
					<strong>{i.role}</strong>
					<p class="ml-4">{i.at}</p>
					<p class="ml-4 text-sm">{i.period}</p>
				</li>
			{/each}
		</ul>
	</Details>

	<br><br class="md:hidden">

	<Details title="Skills" emoji="✨">
		<ul class="md:list-disc list-inside">
			{#each SKILLS as i, j}
				<li><strong>{i.title}</strong>
					<ul class="flex flex-wrap list-inside ml-4">
						{#each i.list as k, l}
							<li class="pr-2">{k}{l === i.list.length - 1 ? "" : ","}</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</Details>

	<br><br class="md:hidden">

	<Details title="Projects" emoji="💻">
		<p class="pb-2">
			Here are some of my notable side projects. Nowadays I mostly work on web applications. 
			Check out my <a href="https://github.com" target="_blank">GitHub</a> for more. There's
			stuff about compilers, linux, data, and other random experiments.
		</p>
		<ul class="md:list-disc list-inside">
			{#each PROJS.slice(0, 3) as i, j}
				<li>
					<a class="font-bold" href={i.url} target="_blank">{i.title}</a>
					<p class="ml-4">{i.desc}<p>
				</li>
			{/each}
		</ul>
		<p><a href="/projects" class="float-right">see more...</a></p>
	</Details>

	<br><br class="md:hidden">

	<Details title="Blog" emoji="✍️">
		<p>
			Here are my notes/guides/tips I've picked up from learning and fixing bugs and issues. 
			Might be useful to some. These are some of my latest posts:
		</p>
		<ul class="md:list-disc list-inside">
			{#each BLOGS.slice(0, 3) as i, j}
					<li class="list-item" class:hidden={j > 2 && hideBlogs}>
						<a href={`/blog/${i.slug}`}>{i.title}</a>
					</li>
			{/each}
		</ul>
		<p><a href="/blog" class="float-right">see more...</a></p>
	</Details>

	<br><br class="md:hidden">

	<Details title="Awards" emoji="🏆">
		<ul class="md:list-disc list-inside">
			{#each AWARDS as i, j}
				<li>{i}</li>
			{/each}
		</ul>
	</Details>

	<br><br class="md:hidden">

	<Details title="Bookshelf" emoji="📖">
		<ul class="md:list-disc list-inside">
			{#each BOOKS as i, j}
				<li>
					<a href={i.url} target="_blank">{i.title}</a>
					<p class="text-sm ml-4">By: {i.author}</p>
				</li>
			{/each}
		</ul>
	</Details>

	<br><br class="md:hidden">

	<Details title="Contact" emoji="📞">
		<p>Let's connect! You can reach me via:</p>
		<ul class="md:list-disc list-inside ml-4">
			<li>Email - 
				<a href="mailto:ryan.mrtinn@gmail.com">ryan.mrtinn@gmail.com</a>
			</li>
			<li>LinkedIn -
				<a href="https://linkedin.com/in/ryanmrt1n" target="_blank">linkedin.com/in/ryanmrt1n</a>
			</li>
			<li>GitHub -
				<a href="https://github.com/rmrt1n" target="_blank">github.com/rmrt1n</a>
			</li>
		</ul>
	</Details>
</div>
