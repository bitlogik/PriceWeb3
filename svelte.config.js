import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess({
		scss: {
			"prependData": "@import \"src/variables.scss\";"
		}
	})],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		ssr: false,
		hydrate: true,

		adapter: adapter({
			fallback: '200.html'
		}),

		vite: {
			css: {
				preprocessorOptions: {
					scss: {
						additionalData: "@import \"src/variables.scss\";"
					}
				}
			}
		}
	}
};

export default config;
