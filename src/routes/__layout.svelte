<script>
	import '../app.css';
	import '../prism-theme.css';
</script>

<div class="flex justify-center">
	<div class="h-screen px-2 sm:px-8 max-w-4xl">
		<header class="h-16 w-full  py-4 lg:pt-6 text-3xl font-bold">
			<a href="/" class="text-black">Ryan Martin</a>
		</header>

		<main class="grid gap-8 md:grid-cols-2 md:h-[calc(100%-64px-24px)] pb-8">
			<slot />
		</main>

		<footer class="h-6 text-xs px-4 text-center">Made with ❤️ by Ryan Martin © 2021</footer>
	</div>
</div>
