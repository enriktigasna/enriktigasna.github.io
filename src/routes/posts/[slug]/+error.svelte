<script lang="ts">
	import { page } from '$app/state';

	export let errorCode: number = 404;
	export let errorMessage: string | undefined = page.error?.message;
</script>

<main class="flex h-screen w-screen items-center justify-center">
	<div class="flex flex-col items-center justify-center">
		<div class="text-[160px] font-semibold">
			{errorCode}
		</div>
		<span>
			{#if errorMessage}
				<div>{errorMessage}</div>
			{:else}
				<div>Unknown Error</div>
			{/if}
		</span>
	</div>
</main>
