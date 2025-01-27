<script lang="ts">
	import type { PageData } from './$types';
	import { formatUnixTimestamp } from '$lib/helpers';

	export let data: PageData;
</script>

{#each data.posts as post}
	<div class="mt-8 px-8">
		<div class="m-auto my-8 max-w-2xl border-gray-700 pb-8 lg:max-w-4xl">
			<h1 class="mb-4 font-mono text-2xl font-semibold">
				<a href={`/posts/${post.slug}`}>{post.title}</a>
			</h1>
			<span class="text-sm text-gray-400">{formatUnixTimestamp(post.date)}</span>
			<div class="my-2 font-mono text-sm text-black">
				{#each post.tags as tag}
					<span class="rounded-sm bg-yellow-500 px-2 py-0.5">{tag}</span>&nbsp;
				{/each}
			</div>
			<p>{post.description}</p>
		</div>
	</div>
{/each}
