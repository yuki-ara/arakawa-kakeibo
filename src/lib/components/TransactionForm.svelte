<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		TX_TYPE_LABEL,
		type Account,
		type Category,
		type PaymentMethod,
		type Shop,
		type Transaction,
		type TxType
	} from '#lib/types.js';

	interface Props {
		accounts: Account[];
		categories: Category[];
		shops: Shop[];
		paymentMethods: PaymentMethod[];
		initial?: Partial<Transaction> & { date: string };
		message?: string | null;
		submitLabel: string;
		action?: string;
	}
	let {
		accounts,
		categories,
		shops,
		paymentMethods,
		initial,
		message,
		submitLabel,
		action
	}: Props = $props();

	// 初期値のみ使う（以降は選択操作で変わる）
	// svelte-ignore state_referenced_locally
	let type = $state<TxType>((initial?.type as TxType) ?? 'expense');
	const field = 'w-full rounded border border-slate-300 px-3 py-2 text-base';
</script>

<form method="post" {action} use:enhance class="flex flex-col gap-4">
	<div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="種別">
		{#each Object.entries(TX_TYPE_LABEL) as [value, label] (value)}
			<label
				class="cursor-pointer rounded border py-2 text-center text-sm {type === value
					? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-700'
					: 'border-slate-300 text-slate-600'}"
			>
				<input class="sr-only" type="radio" name="type" {value} bind:group={type} />
				{label}
			</label>
		{/each}
	</div>

	<label class="flex flex-col gap-1 text-sm"
		>日付
		<input class={field} type="date" name="date" required value={initial?.date} />
	</label>
	<label class="flex flex-col gap-1 text-sm"
		>金額（円）
		<input
			class={field}
			type="number"
			name="amount"
			inputmode="numeric"
			min="1"
			step="1"
			required
			value={initial?.amount ?? ''}
		/>
	</label>
	<label class="flex flex-col gap-1 text-sm"
		>{type === 'transfer' ? '振替元の口座' : '口座'}
		<select class={field} name="account_id" required>
			{#each accounts as a (a.id)}
				<option value={a.id} selected={a.id === initial?.account_id}>{a.name}</option>
			{/each}
		</select>
	</label>

	{#if type === 'transfer'}
		<label class="flex flex-col gap-1 text-sm"
			>振替先の口座
			<select class={field} name="to_account_id" required>
				{#each accounts as a (a.id)}
					<option value={a.id} selected={a.id === initial?.to_account_id}>{a.name}</option>
				{/each}
			</select>
		</label>
	{:else}
		<label class="flex flex-col gap-1 text-sm"
			>カテゴリ
			<select class={field} name="category_id">
				<option value="">（未選択）</option>
				{#each categories as c (c.id)}
					<option value={c.id} selected={c.id === initial?.category_id}>{c.name}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1 text-sm"
			>店
			<select class={field} name="shop_id">
				<option value="">（未選択）</option>
				{#each shops as s (s.id)}
					<option value={s.id} selected={s.id === initial?.shop_id}>{s.name}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1 text-sm"
			>支払方法
			<select class={field} name="payment_method_id">
				<option value="">（未選択）</option>
				{#each paymentMethods as p (p.id)}
					<option value={p.id} selected={p.id === initial?.payment_method_id}>{p.name}</option>
				{/each}
			</select>
		</label>
	{/if}

	<label class="flex flex-col gap-1 text-sm"
		>品目
		<input class={field} name="item" value={initial?.item ?? ''} />
	</label>
	<label class="flex flex-col gap-1 text-sm"
		>メモ
		<input class={field} name="note" value={initial?.note ?? ''} />
	</label>

	{#if message}<p class="text-sm text-red-600">{message}</p>{/if}
	<button class="rounded bg-emerald-600 px-4 py-3 font-medium text-white">{submitLabel}</button>
</form>
