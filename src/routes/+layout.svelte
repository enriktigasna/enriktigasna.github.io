<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<a
	class="flex h-14 w-40 items-center justify-center self-start font-mono text-xl font-semibold text-yellow-500"
	href="/"
>
	MACKAN.DEV
</a>
{@render children()}
