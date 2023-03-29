<script context="module">
	import { browser, dev } from '$app/env';
	// SPA needs hydrate
	export const hydrate = true;
	export const router = browser;
	export const prerender = false;
</script>

<svelte:head>
	<title>About - PriceWeb3</title>
</svelte:head>

<div class="content">

	<h1>About</h1>

	<p>
		PriceWeb3 is a Web3 DeFi ticker. The PriceWeb3 web app displays in real-time some crypto-currencies tokens prices listed on a DeFi platform. The price is read in a decentralized way, directly from the blockchain source, by interacting with the <a href="https://academy.ivanontech.com/blog/decentralized-exchanges-what-is-a-dex" target="_blank">decentralized exchange "DEX"</a> smart-contracts. It computes and displays the price tickers of a DeFi exchange, from Web3 queries data. Additionally, it can compute the impermanent loss of liquidity in a constant product automatic market (UniswapV2 AMM DEX). It displays various useful metrics for liquidity deposited in such AMMs.
	</p>

	<img class="cryptobox" src="/tokens.jpg">

	<p>
		PriceWeb3 is a small web application, where your browser gets the data by itself directly from a <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/" target="_blank">blockchain RPC node</a>, using plain <a href="https://eth.wiki/json-rpc/API" target="_blank">web3 smart-contracts calls</a>. It is compatible with any <a href="https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair" target="_blank">Uniswap v2 automated pair market maker contract</a>, and it is currently setup to work with <a href="https://docs.sushi.com/products/amm-exchange" target="_blank">SushiSwap</a> on the <a href="https://polygon.technology/technology/" target="_blank">Polygon network</a>.
	</p>

	<p>
		The PriceWeb3 app is designed to be simple and minimalist. Many methods are slim with zero-overhead, without any external dependency like web3js.
		It uses the <a href="https://kit.svelte.dev" target="_blank">SvelteKit JavaScript framework</a>, and <a href="https://bulma.io/" target="_blank">Bulma</a> for the styling. The app is a "JAMstack" <a href="https://en.wikipedia.org/wiki/Single-page_application" target="_blank">Single Page Application</a> bundled using <a href="https://vitejs.dev/guide/why.html" target="_blank">ViteJS</a>.
	</p>

	<p>
		The PriceWeb3 app is fully open-source, and licensed under the <a href="http://www.gnu.org/licenses/agpl-3.0.html" target="_blank">GNU Affero General Public 3 License</a>.
		The  <a href="https://github.com/bitlogik/PriceWeb3" target="_blank">source code is available on Github</a>. It was made by <a href="https://bitlogik.fr" target="_blank">the BitLogiK team</a> in order to explorer direct Web3 calls, AMM DeFi live capability, and the SvelteKit framework.
	</p>

</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 1.5rem auto;
	}
	a {
		text-decoration-line: underline;
	}
	img {
		width: 50%;
		margin: auto;
	}
	p {
		text-align: justify;
	}
	.cryptobox {
		width: 100%;
		margin-top: 0.5em;
		margin-bottom: 0.75em;
	}
</style>
