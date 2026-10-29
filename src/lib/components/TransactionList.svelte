<script lang="ts">
	import { yen } from '#lib/format.js';
	import type { Account, Category, Transaction } from '#lib/types.js';

	interface Props {
		transactions: Transaction[];
		accounts: Account[];
		categories: Category[];
		editable?: boolean;
	}
	let { transactions, accounts, categories, editable = false }: Props = $props();

	const accountName = (id: number | null) =>
		accounts.find((a) => a.id === id)?.name ?? '（非表示の口座）';
	const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name;
	const sign = { income: '+', expense: '−', transfer: '' } as const;
	const color = {
		income: 'text-emerald-700',
		expense: 'text-slate-900',
		transfer: 'text-slate-500'
	} as const;
</script>

{#if transactions.length === 0}
	<p class="py-8 text-center text-sm text-slate-400">取引はありません</p>
{:else}
	<ul class="divide-y divide-slate-100">
		{#each transactions as t (t.id)}
			{@const type = t.type as 'income' | 'expense' | 'transfer'}
			<li>
				<svelte:element
					this={editable ? 'a' : 'div'}
					href={editable ? `/transactions/${t.id}` : undefined}
					class="flex items-center justify-between gap-3 py-3"
				>
					<div class="min-w-0">
						<div class="truncate text-sm">
							{t.item ??
								categoryName(t.category_id) ??
								(type === 'transfer' ? '振替' : '（品目なし）')}
						</div>
						<div class="truncate text-xs text-slate-400">
							{t.date.slice(5).replace('-', '/')} ・ {type === 'transfer'
								? `${accountName(t.account_id)} → ${accountName(t.to_account_id)}`
								: `${accountName(t.account_id)}${categoryName(t.category_id) ? ' ・ ' + categoryName(t.category_id) : ''}`}
						</div>
					</div>
					<div class="shrink-0 font-medium {color[type]}">{sign[type]}{yen(t.amount)}</div>
				</svelte:element>
			</li>
		{/each}
	</ul>
{/if}
