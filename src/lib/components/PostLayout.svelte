<script lang="ts">
	import { formatUnixTimestamp } from '$lib/helpers';

	export let title: string;
	export let date: number;
	export let tags: string[];
</script>

<article class="my-8 px-8">
	<div class="m-auto max-w-2xl lg:max-w-4xl">
		<!-- Fix colors -->
		<h1 class="mb-4 font-mono text-3xl font-semibold">{title}</h1>
		<span class="text-sm text-gray-400">{formatUnixTimestamp(date)}</span>
		<div class="my-2 font-mono text-sm text-black">
			{#each tags as tag}
				<span class="mr-1 rounded-sm bg-yellow-500 px-2 py-0.5">{tag}</span>
			{/each}
		</div>

		<div
			class="prose min-w-full text-gray-50 prose-h2:m-0 prose-h2:font-mono prose-h2:text-gray-50 prose-h3:font-mono prose-h3:text-gray-50 prose-a:text-gray-50 prose-a:no-underline prose-a:font-inherit prose-pre:overflow-auto prose-pre:rounded-sm prose-pre:text-sm prose-code:font-mono prose-code:text-gray-50 prose-stong:bold prose-strong:text-gray-50"
		>
			<slot />
		</div>
	</div>
</article>
