import { isMonth, monthRange, todayJst } from '#lib/format.js';
import { monthlyTotals } from '#lib/balance.js';
import { loadReference } from '#lib/server/reference.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const param = url.searchParams.get('month');
	const month = isMonth(param) ? param : todayJst().slice(0, 7);
	const { from, to } = monthRange(month);

	const [ref, tx] = await Promise.all([
		loadReference(locals.supabase),
		locals.supabase
			.from('transactions')
			.select('*')
			.gte('date', from)
			.lt('date', to)
			.order('date', { ascending: false })
			.order('created_at', { ascending: false })
	]);
	if (tx.error) throw new Error(tx.error.message);

	return { month, transactions: tx.data, totals: monthlyTotals(tx.data), ...ref };
};
