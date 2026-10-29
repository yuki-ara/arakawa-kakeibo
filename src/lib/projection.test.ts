import { describe, expect, it } from 'vitest';
import { addMonthsToKey, projectValue } from './projection.js';

const plan = (
	monthly_amount: number,
	valid_from = '2026-10-01',
	valid_to: string | null = null
) => ({
	monthly_amount,
	valid_from,
	valid_to
});

describe('projectValue', () => {
	it('リターン0%・積立なしなら起点評価額のまま', () => {
		expect(
			projectValue({ value: 1000, asOf: '2026-10-27', expectedReturn: 0, plans: [] }, '2030-01')
		).toBe(1000);
	});

	it('起点月以前は起点評価額', () => {
		const input = { value: 1000, asOf: '2026-10-27', expectedReturn: 5, plans: [plan(100)] };
		expect(projectValue(input, '2026-10')).toBe(1000);
		expect(projectValue(input, '2026-01')).toBe(1000);
	});

	it('リターン0%なら翌月から積立額が加算される', () => {
		const input = { value: 1000, asOf: '2026-10-27', expectedReturn: 0, plans: [plan(100)] };
		expect(projectValue(input, '2026-11')).toBe(1100);
		expect(projectValue(input, '2027-10')).toBe(2200);
	});

	it('年率はちょうど1年で反映される（積立なし）', () => {
		const input = { value: 1_000_000, asOf: '2026-10-01', expectedReturn: 6, plans: [] };
		expect(projectValue(input, '2027-10')).toBe(1_060_000);
	});

	it('積立の有効期間外の月は加算されない', () => {
		const input = {
			value: 0,
			asOf: '2026-10-01',
			expectedReturn: 0,
			plans: [plan(100, '2026-11-01', '2026-12-31')]
		};
		expect(projectValue(input, '2027-06')).toBe(200);
	});
});

describe('addMonthsToKey', () => {
	it('年をまたいで加算できる', () => {
		expect(addMonthsToKey('2026-11', 3)).toBe('2027-02');
		expect(addMonthsToKey('2026-10', 120)).toBe('2036-10');
	});
});
