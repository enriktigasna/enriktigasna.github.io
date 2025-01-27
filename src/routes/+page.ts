import type { PostMetadata } from '$lib/types';
import type { PageLoad } from './$types';

export const prerender = true;
export const load: PageLoad = async (): Promise<{ posts: PostMetadata[] }> => {
	const postFiles = import.meta.glob<{metadata: PostMetadata}>('../posts/*.md', { eager: true });

	const posts: PostMetadata[] = Object.entries(postFiles)
		.map(([, module]) => module.metadata)
		.filter((a) => a.published == true);

	return { posts };
};
