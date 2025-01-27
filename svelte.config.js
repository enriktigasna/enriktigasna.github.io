import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx', '.md'],
			layout: {
				_: './src/lib/components/PostLayout.svelte'
			}
		})
	],

	kit: {
		adapter: adapter()
	},

	extensions: ['.svelte', '.svx', '.md']
};

export default config;
