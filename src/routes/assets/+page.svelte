<script lang="ts">
	import { resolve } from '$app/paths';
	import { yen } from '#lib/format.js';
	import { ACCOUNT_KIND_LABEL } from '#lib/types.js';
	let { data } = $props();

	const COLORS = [
		'bg-emerald-500',
		'bg-sky-500',
		'bg-amber-500',
		'bg-violet-500',
		'bg-rose-400',
		'bg-slate-400'
	];

	const included = $derived(data.balances.filter((b) => b.account.include_in_net_worth));
	const positiveTotal = $derived(included.reduce((s, b) => s + Math.max(b.balance, 0), 0));

	const groups = $derived(
		Object.entries(Object.groupBy(included, (b) => b.account.kind)).map(([kind, items]) => ({
			kind,
			items: items ?? [],
			total: (items ?? []).reduce((s, b) => s + b.balance, 0)
		}))
	);

	const fundsOf = (accountId: number) =>
		data.funds
			.filter((f) => f.account_id === accountId)
			.map((f) => {
				const latest = data.snapshots
					.filter((s) => s.fund_id === f.id)
					.reduce<(typeof data.snapshots)[number] | null>(
						(b, s) => (!b || s.as_of > b.as_of ? s : b),
						null
					);
				return { fund: f, value: latest?.value ?? 0, asOf: latest?.as_of };
			});
</script>

<section class="rounded-lg bg-emerald-600 p-5 text-white">
	<div class="text-sm opacity-80">純資産</div>
	<div class="text-3xl font-bold">{yen(data.netWorth)}</div>
</section>

{#if positiveTotal > 0}
	<div class="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
		{#each included.filter((b) => b.balance > 0) as b, i (b.account.id)}
			<div
				class={COLORS[i % COLORS.length]}
				style="width: {(b.balance / positiveTotal) * 100}%"
			></div>
		{/each}
	</div>
	<ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
		{#each included.filter((b) => b.balance > 0) as b, i (b.account.id)}
			<li class="flex items-center gap-1">
				<span class="inline-block h-2 w-2 rounded-full {COLORS[i % COLORS.length]}"></span>
				{b.account.name}（{Math.round((b.balance / positiveTotal) * 100)}%）
			</li>
		{/each}
	</ul>
{/if}

{#each groups as g (g.kind)}
	<section class="mt-6">
		<div class="flex items-baseline justify-between border-b border-slate-200 pb-1">
			<h2 class="text-sm font-bold text-slate-600">{ACCOUNT_KIND_LABEL[g.kind] ?? g.kind}</h2>
			<span class="text-sm font-medium">{yen(g.total)}</span>
		</div>
		<ul class="divide-y divide-slate-100">
			{#each g.items as b (b.account.id)}
				<li class="py-3">
					<div class="flex items-center justify-between">
						<span class="text-sm">{b.account.name}</span>
						<span class="font-medium">{yen(b.balance)}</span>
					</div>
					{#each fundsOf(b.account.id) as f (f.fund.id)}
						<div class="mt-1 flex justify-between pl-3 text-xs text-slate-500">
							<span class="truncate">{f.fund.name}</span>
							<span class="shrink-0"
								>{yen(f.value)}{f.asOf ? `（${f.asOf.slice(5).replace('-', '/')}時点）` : ''}</span
							>
						</div>
					{/each}
				</li>
			{/each}
		</ul>
	</section>
{/each}

<section class="mt-8">
	<div class="flex items-baseline justify-between border-b border-slate-200 pb-1">
		<h2 class="text-sm font-bold text-slate-600">想定評価額</h2>
		<a href={resolve('/assets/plan')} class="text-xs text-slate-500 underline"
			>積立・リターンを設定</a
		>
	</div>
	<p class="mt-1 text-xs text-slate-400">
		現在の評価額に毎月の積立と想定リターンを反映した試算です。現金・預金は現状維持の前提です。
	</p>
	<div class="mt-3 overflow-x-auto">
		<table class="w-full text-right text-sm">
			<thead class="text-xs text-slate-500">
				<tr>
					<th class="py-1 text-left font-normal"></th>
					{#each data.horizons as y (y)}<th class="py-1 font-normal">{y}年後</th>{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each data.fundRows as f (f.id)}
					<tr>
						<td class="max-w-32 truncate py-2 text-left text-xs">{f.name}</td>
						{#each f.projected as v, i (i)}<td class="py-2">{yen(v)}</td>{/each}
					</tr>
				{/each}
				<tr class="font-bold">
					<td class="py-2 text-left text-xs">純資産</td>
					{#each data.projectedNetWorth as v, i (i)}<td class="py-2">{yen(v)}</td>{/each}
				</tr>
			</tbody>
		</table>
	</div>
</section>
