import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				mono: ['IBM Plex Mono', 'monospace']
			},
			fontWeight: {
				inherit: 'inherit'
			}
		}
	},

	plugins: [typography]
} satisfies Config;
