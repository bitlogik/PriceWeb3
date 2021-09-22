<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.scss';
</script>

<Header />

<main>
	<slot />
</main>

<footer>
	<p>made by <a href="https://bitlogik.fr" target="_blank">BitLogiK</a> - <a href="https://github.com/bitlogik/PriceWeb3" target="_blank">source code</a></p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 16px;
		font-size: 0.75em;
		border-top: 2px solid #ccc;
	}

	footer a {
		text-decoration-line: underline;
		color: inherit;
		text-decoration-color: #B0B0B0;
	}

	@media (min-width: 480px) {
		footer {
			padding: 24px 0;
		}
	}
</style>
