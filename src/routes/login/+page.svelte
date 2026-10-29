<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
	<h1 class="text-2xl font-bold">荒川家の家計簿</h1>
	<form method="post" use:enhance class="flex flex-col gap-4">
		<label class="flex flex-col gap-1 text-sm">
			メールアドレス
			<input
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
				class="rounded border border-slate-300 px-3 py-2 text-base"
			/>
		</label>
		<label class="flex flex-col gap-1 text-sm">
			パスワード
			<input
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="rounded border border-slate-300 px-3 py-2 text-base"
			/>
		</label>
		{#if form?.message}<p class="text-sm text-red-600">{form.message}</p>{/if}
		<button class="rounded bg-emerald-600 px-4 py-2 font-medium text-white">ログイン</button>
	</form>
</main>
