<script lang="ts">
	import { resolve } from '$app/paths';
	import { yen } from '#lib/format.js';
	import TransactionList from '#lib/components/TransactionList.svelte';
	let { data } = $props();
</script>

<section class="rounded-lg bg-emerald-600 p-5 text-white">
	<div class="text-sm opacity-80">純資産</div>
	<div class="text-3xl font-bold">{yen(data.netWorth)}</div>
	<a href={resolve('/assets')} class="mt-2 inline-block text-xs underline opacity-80"
		>口座別の内訳</a
	>
</section>

<section class="mt-4">
	<h2 class="mb-2 text-sm font-bold text-slate-600">{data.month.replace('-', '年')}月</h2>
	<div class="grid grid-cols-2 gap-3 text-sm">
		<div class="rounded bg-emerald-50 p-3">
			収入
			<div class="text-lg font-bold">{yen(data.totals.income)}</div>
		</div>
		<div class="rounded bg-rose-50 p-3">
			支出
			<div class="text-lg font-bold">{yen(data.totals.expense)}</div>
		</div>
	</div>
</section>

<section class="mt-6">
	<div class="mb-1 flex items-center justify-between">
		<h2 class="text-sm font-bold text-slate-600">最近の取引</h2>
		<a href={resolve('/transactions')} class="text-xs text-slate-500 underline">すべて見る</a>
	</div>
	<TransactionList
		transactions={data.recent}
		accounts={data.accounts}
		categories={data.categories}
	/>
</section>

<a
	href={resolve('/new')}
	class="fixed right-5 bottom-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-lg"
	aria-label="入力">＋</a
>
