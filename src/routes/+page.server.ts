import { monthRange, todayJst } from '#lib/format.js';
import { monthlyTotals, netWorth } from '#lib/balance.js';
import { loadBalances } from '#lib/server/balances.js';
import { loadReference } from '#lib/server/reference.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const month = todayJst().slice(0, 7);
	const { from, to } = monthRange(month);

	const [{ balances }, ref, monthTx, recent] = await Promise.all([
		loadBalances(locals.supabase),
		loadReference(locals.supabase),
		locals.supabase.from('transactions').select('*').gte('date', from).lt('date', to),
		locals.supabase
			.from('transactions')
			.select('*')
			.order('date', { ascending: false })
			.order('created_at', { ascending: false })
			.limit(8)
	]);
	if (monthTx.error) throw new Error(monthTx.error.message);
	if (recent.error) throw new Error(recent.error.message);

	return {
		month,
		netWorth: netWorth(balances),
		totals: monthlyTotals(monthTx.data),
		recent: recent.data,
		accounts: ref.accounts,
		categories: ref.categories
	};
};
