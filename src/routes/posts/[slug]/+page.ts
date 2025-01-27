import type { Post } from '$lib/types';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;
export const load: PageLoad = async ({ params }): Promise<Post> => {
	try {
		const file = await import(`../../../posts/${params.slug}.md`);
		return {
			content: file.default,
			meta: file.metadata
		};
	} catch (err) {
		console.log(err);
		throw error(404, 'Post not found');
	}
};
