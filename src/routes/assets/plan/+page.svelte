<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { yen } from '#lib/format.js';
	let { data, form } = $props();
	const field = 'w-full rounded border border-slate-300 px-3 py-2 text-base';
</script>

<a href={resolve('/assets')} class="text-sm text-slate-500 underline">← 資産に戻る</a>
<h1 class="mt-2 mb-1 text-lg font-bold">積立・想定リターン</h1>
<p class="mb-4 text-xs text-slate-500">
	想定評価額の計算に使う設定です（実際の運用成果を保証するものではありません）。
</p>

<div class="flex flex-col gap-4">
	{#each data.fundRows as f (f.id)}
		<form method="post" action="?/save" use:enhance class="rounded-lg border border-slate-200 p-4">
			<input type="hidden" name="fund_id" value={f.id} />
			<div class="text-sm font-bold">{f.name}</div>
			<div class="mb-3 text-xs text-slate-500">
				現在の評価額 {yen(f.value)}{f.asOf ? `（${f.asOf.slice(5).replace('-', '/')}時点）` : ''}
			</div>
			<div class="grid grid-cols-2 gap-3">
				<label class="flex flex-col gap-1 text-xs"
					>想定リターン（年率 %）
					<input
						class={field}
						type="number"
						name="expected_return"
						step="0.1"
						required
						value={f.expectedReturn}
					/>
				</label>
				<label class="flex flex-col gap-1 text-xs"
					>毎月の積立額（円）
					<input
						class={field}
						type="number"
						name="monthly_amount"
						step="1"
						min="0"
						required
						value={f.monthlyAmount}
					/>
				</label>
			</div>
			{#if form?.fundId === f.id}
				{#if form.message}<p class="mt-2 text-sm text-red-600">{form.message}</p>
				{:else if form.saved}<p class="mt-2 text-sm text-emerald-700">保存しました</p>{/if}
			{/if}
			<button class="mt-3 w-full rounded bg-emerald-600 py-2 text-sm font-medium text-white"
				>保存</button
			>
		</form>
	{/each}
</div>
