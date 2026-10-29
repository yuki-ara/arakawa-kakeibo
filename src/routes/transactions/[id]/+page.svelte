<script lang="ts">
	import { enhance } from '$app/forms';
	import TransactionForm from '#lib/components/TransactionForm.svelte';
	let { data, form } = $props();
</script>

<h1 class="mb-4 text-lg font-bold">取引を編集</h1>
<TransactionForm
	accounts={data.accounts}
	categories={data.categories}
	shops={data.shops}
	paymentMethods={data.paymentMethods}
	initial={data.transaction}
	message={form?.message}
	submitLabel="更新"
	action="?/update"
/>

<form
	method="post"
	action="?/delete"
	use:enhance={({ cancel }) => {
		if (!confirm('この取引を削除しますか？')) cancel();
	}}
	class="mt-6"
>
	<button class="w-full rounded border border-red-300 py-3 text-red-600">削除</button>
</form>
