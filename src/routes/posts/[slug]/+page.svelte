<script lang="ts">
	import type { Component } from 'svelte';
	import type { Post } from '$lib/types';

	export let data: Post;
	let PostComponent: Component = data.content;
</script>

<svelte:component this={PostComponent} />
