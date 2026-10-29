import { netWorth } from '#lib/balance.js';
import { loadBalances } from '#lib/server/balances.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { balances, snapshots, funds } = await loadBalances(locals.supabase);
	return { balances, snapshots, funds, netWorth: netWorth(balances) };
};
