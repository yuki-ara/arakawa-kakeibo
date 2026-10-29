import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';
import { computeBalances } from '../balance.js';

/** 見える口座の現在残高を計算して返す。 */
export async function loadBalances(supabase: SupabaseClient<Database>) {
	const [accounts, snapshots, funds] = await Promise.all([
		supabase.from('accounts').select('*').eq('is_active', true).order('id'),
		supabase.from('balance_snapshots').select('*'),
		supabase.from('funds').select('*').eq('is_active', true)
	]);
	const err = accounts.error ?? snapshots.error ?? funds.error;
	if (err) throw new Error(err.message);

	const earliest = (snapshots.data ?? []).reduce(
		(min, s) => (s.as_of < min ? s.as_of : min),
		'9999-12-31'
	);
	// 取引は最古のスナップショット以降だけ取得すれば足りる（PostgREST の上限対策でページング）
	const transactions: Database['public']['Tables']['transactions']['Row'][] = [];
	for (let from = 0; ; from += 1000) {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.gte('date', earliest)
			.order('date')
			.order('id')
			.range(from, from + 999);
		if (error) throw new Error(error.message);
		transactions.push(...data);
		if (data.length < 1000) break;
	}

	return {
		balances: computeBalances(accounts.data ?? [], snapshots.data ?? [], transactions),
		snapshots: snapshots.data ?? [],
		funds: funds.data ?? []
	};
}
