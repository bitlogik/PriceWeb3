# PriceWeb3

A slim Web3 DeFi live ticker.

Source code of the web app live at  
https://ticker.blkhub.net/

The PriceWeb3 web app displays in real-time some crypto-currencies tokens prices listed on a DeFi platform. The price is read in a decentralized way, directly from the blockchain source, by interacting with the <a href="https://academy.ivanontech.com/blog/decentralized-exchanges-what-is-a-dex" target="_blank">decentralized exchange "DEX"</a> smart-contracts. It computes and displays the price tickers of a DeFi exchange, from Web3 queries data.

PriceWeb3 is a small web application, where your browser gets the data by itself directly from a <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/" target="_blank">blockchain RPC node</a>, using plain <a href="https://eth.wiki/json-rpc/API" target="_blank">web3 smart-contracts calls</a>. It is compatible with any <a href="https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair" target="_blank">Uniswap v2 automated pair market maker contract</a>, and it is currently setup to work with <a href="https://docs.sushi.com/products/amm-exchange" target="_blank">SushiSwap</a> on the <a href="https://polygon.technology/technology/" target="_blank">Polygon network</a>.

The PriceWeb3 app is designed to be simple and minimalist. Many methods are slim with zero-overhead, without any external dependency like web3js.
It uses the <a href="https://kit.svelte.dev" target="_blank">SvelteKit JavaScript framework</a>, and <a href="https://bulma.io/" target="_blank">Bulma</a> for the styling. The app is a "JAMstack" <a href="https://en.wikipedia.org/wiki/Single-page_application" target="_blank">Single Page Application</a> bundled using <a href="https://vitejs.dev/guide/why.html" target="_blank">ViteJS</a>.

## Developing

Install dependencies once with `npm install` (or `yarn`), then start a development server :

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

```bash
npm run build
```

You can preview the built app with `npm run preview`.

The output directory for the files to serve is /build.

## Serving

The web server or proxy needs to be configured so that 200.html is a default fallback when a html page is not found.  
Brotli "br" and/or gzip is highly recommended to be activated as content encoding header method on the web server.

The current recommended configuration for the Content-Security-Policy header is :  
```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; connect-src 'self' https://rpc.ankr.com/polygon;
```

