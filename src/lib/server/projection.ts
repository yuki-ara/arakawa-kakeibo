import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';
import { addMonthsToKey, projectValue } from '../projection.js';

export const HORIZON_YEARS = [1, 5, 10, 20] as const;

export interface FundRow {
	id: number;
	name: string;
	accountId: number;
	expectedReturn: number;
	value: number;
	asOf: string | null;
	monthlyAmount: number;
	/** HORIZON_YEARS に対応する想定評価額 */
	projected: number[];
}

/** ファンドごとの最新評価額・現行の積立額・想定評価額を計算する。 */
export async function loadFundProjections(
	supabase: SupabaseClient<Database>,
	currentMonth: string
): Promise<FundRow[]> {
	const [funds, snapshots, plans] = await Promise.all([
		supabase.from('funds').select('*').eq('is_active', true).order('id'),
		supabase.from('balance_snapshots').select('*').not('fund_id', 'is', null),
		supabase.from('investment_plans').select('*')
	]);
	const err = funds.error ?? snapshots.error ?? plans.error;
	if (err) throw new Error(err.message);

	return (funds.data ?? []).map((f) => {
		const latest = (snapshots.data ?? [])
			.filter((s) => s.fund_id === f.id)
			.reduce<{ as_of: string; value: number } | null>(
				(b, s) => (!b || s.as_of > b.as_of ? s : b),
				null
			);
		const myPlans = (plans.data ?? []).filter((p) => p.fund_id === f.id);
		const today = `${currentMonth}-01`;
		const current = myPlans
			.filter((p) => p.valid_from <= today && (p.valid_to === null || p.valid_to >= today))
			.reduce((s, p) => s + p.monthly_amount, 0);

		const input = {
			value: latest?.value ?? 0,
			asOf: latest?.as_of ?? today,
			expectedReturn: Number(f.expected_return),
			plans: myPlans
		};
		return {
			id: f.id,
			name: f.name,
			accountId: f.account_id,
			expectedReturn: Number(f.expected_return),
			value: latest?.value ?? 0,
			asOf: latest?.as_of ?? null,
			monthlyAmount: current,
			projected: HORIZON_YEARS.map((y) => projectValue(input, addMonthsToKey(currentMonth, y * 12)))
		};
	});
}
