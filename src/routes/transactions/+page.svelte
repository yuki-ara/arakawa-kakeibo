<script lang="ts">
	import { resolve } from '$app/paths';
	import { shiftMonth, yen } from '#lib/format.js';
	import TransactionList from '#lib/components/TransactionList.svelte';
	let { data } = $props();
</script>

<div class="mb-4 flex items-center justify-between">
	<a
		class="px-3 py-1 text-slate-500"
		href={resolve(`/transactions?month=${shiftMonth(data.month, -1)}`)}
		aria-label="前の月">◀</a
	>
	<h1 class="text-lg font-bold">{data.month.replace('-', '年')}月</h1>
	<a
		class="px-3 py-1 text-slate-500"
		href={resolve(`/transactions?month=${shiftMonth(data.month, 1)}`)}
		aria-label="次の月">▶</a
	>
</div>

<div class="mb-4 grid grid-cols-2 gap-3 text-sm">
	<div class="rounded bg-emerald-50 p-3">
		収入
		<div class="text-lg font-bold">{yen(data.totals.income)}</div>
	</div>
	<div class="rounded bg-rose-50 p-3">
		支出
		<div class="text-lg font-bold">{yen(data.totals.expense)}</div>
	</div>
</div>

<TransactionList
	transactions={data.transactions}
	accounts={data.accounts}
	categories={data.categories}
	editable
/>
