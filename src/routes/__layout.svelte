<script>
	import '../app.css';
	import '../prism-theme.css';
</script>

<div class="h-screen">
	<header class="h-16 w-full px-8 lg:px-16 py-4 lg:pt-6 text-3xl font-bold">
		<a href="/" class="text-black">Ryan Martin</a>
	</header>

	<main class="grid md:grid-cols-2 md:h-[calc(100%-64px-24px)] pb-8">
		<slot />
	</main>

	<footer class="h-6 text-xs px-4 text-center">
		Made with ❤️ by Ryan Martin © 2021
	</footer>
</div>
