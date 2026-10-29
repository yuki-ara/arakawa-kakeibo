<script lang="ts">
	import TransactionForm from '#lib/components/TransactionForm.svelte';
	let { data, form } = $props();
</script>

<h1 class="mb-4 text-lg font-bold">入力</h1>
<TransactionForm
	accounts={data.accounts}
	categories={data.categories}
	shops={data.shops}
	paymentMethods={data.paymentMethods}
	initial={{ date: data.today }}
	message={form?.message}
	submitLabel="保存"
/>
