import { describe, expect, it } from 'vitest';
import { parseTransactionForm } from './transaction-form.js';

const fd = (o: Record<string, string>) => {
	const f = new FormData();
	for (const [k, v] of Object.entries(o)) f.set(k, v);
	return f;
};

describe('parseTransactionForm', () => {
	it('支出を正しく変換する', () => {
		const r = parseTransactionForm(
			fd({
				type: 'expense',
				date: '2026-10-05',
				amount: '1200',
				account_id: '1',
				category_id: '3',
				item: ' 昼食 '
			})
		);
		expect(r).toMatchObject({
			ok: true,
			value: { amount: 1200, category_id: 3, item: '昼食', to_account_id: null }
		});
	});
	it('振替は振替先が必須で同一口座は不可', () => {
		expect(
			parseTransactionForm(
				fd({ type: 'transfer', date: '2026-10-05', amount: '1', account_id: '1' })
			).ok
		).toBe(false);
		expect(
			parseTransactionForm(
				fd({
					type: 'transfer',
					date: '2026-10-05',
					amount: '1',
					account_id: '1',
					to_account_id: '1'
				})
			).ok
		).toBe(false);
		expect(
			parseTransactionForm(
				fd({
					type: 'transfer',
					date: '2026-10-05',
					amount: '1',
					account_id: '1',
					to_account_id: '2'
				})
			).ok
		).toBe(true);
	});
	it('金額が0・小数・空は不可', () => {
		for (const amount of ['0', '1.5', '', '-3']) {
			expect(
				parseTransactionForm(fd({ type: 'expense', date: '2026-10-05', amount, account_id: '1' }))
					.ok
			).toBe(false);
		}
	});
});
