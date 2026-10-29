import { describe, expect, it } from 'vitest';
import { computeBalances, monthlyTotals, netWorth } from './balance.js';
import type { Account, Snapshot, Transaction } from './types.js';

const acc = (id: number, kind: string, extra: Partial<Account> = {}): Account => ({
	id,
	name: `a${id}`,
	kind,
	owner_id: null,
	include_in_net_worth: true,
	is_active: true,
	created_at: '',
	...extra
});
const snap = (
	account_id: number,
	as_of: string,
	value: number,
	fund_id: number | null = null
): Snapshot => ({
	id: Math.random(),
	account_id,
	as_of,
	value,
	fund_id,
	created_at: ''
});
const tx = (p: Partial<Transaction>): Transaction => ({
	id: 'x',
	date: '2026-10-05',
	type: 'expense',
	amount: 100,
	account_id: 1,
	to_account_id: null,
	category_id: null,
	shop_id: null,
	payment_method_id: null,
	item: null,
	note: null,
	created_by: null,
	source_key: null,
	legacy_id: null,
	created_at: '',
	...p
});

describe('computeBalances', () => {
	it('銀行: スナップショット当日以降の取引を反映する', () => {
		const r = computeBalances(
			[acc(1, 'bank')],
			[snap(1, '2026-10-01', 1000)],
			[
				tx({ date: '2026-09-30', amount: 999 }),
				tx({ date: '2026-10-01', amount: 100 }),
				tx({ type: 'income', amount: 500 })
			]
		);
		expect(r[0].balance).toBe(1000 - 100 + 500);
	});

	it('振替は振替元を減らし振替先を増やす', () => {
		const r = computeBalances(
			[acc(1, 'bank'), acc(2, 'bank')],
			[snap(1, '2026-10-01', 1000), snap(2, '2026-10-01', 0)],
			[tx({ type: 'transfer', amount: 300, to_account_id: 2 })]
		);
		expect(r.map((b) => b.balance)).toEqual([700, 300]);
	});

	it('投資: ファンドごとの最新スナップショットの合計', () => {
		const r = computeBalances(
			[acc(3, 'nisa')],
			[snap(3, '2026-10-01', 100, 1), snap(3, '2026-10-27', 150, 1), snap(3, '2026-10-01', 50, 2)],
			[tx({ account_id: 3, amount: 9999 })]
		);
		expect(r[0].balance).toBe(200);
	});
});

describe('netWorth / monthlyTotals', () => {
	it('純資産は対象外口座を除く', () => {
		const balances = computeBalances(
			[acc(1, 'bank'), acc(2, 'bank', { include_in_net_worth: false })],
			[snap(1, '2026-10-01', 100), snap(2, '2026-10-01', 900)],
			[]
		);
		expect(netWorth(balances)).toBe(100);
	});

	it('月次集計は振替を含めない', () => {
		const t = monthlyTotals([
			tx({ type: 'income', amount: 1000 }),
			tx({ amount: 300 }),
			tx({ type: 'transfer', amount: 5000, to_account_id: 2 })
		]);
		expect(t).toEqual({ income: 1000, expense: 300 });
	});
});
