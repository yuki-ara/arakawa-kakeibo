import { netWorth } from '#lib/balance.js';
import { todayJst } from '#lib/format.js';
import { loadBalances } from '#lib/server/balances.js';
import { HORIZON_YEARS, loadFundProjections } from '#lib/server/projection.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [{ balances, snapshots, funds }, fundRows] = await Promise.all([
		loadBalances(locals.supabase),
		loadFundProjections(locals.supabase, todayJst().slice(0, 7))
	]);
	const worth = netWorth(balances);

	// 投資系の現在額をファンドの想定評価額に置き換える（現金・預金は現状維持の前提）
	const fundAccountIds = new Set(fundRows.map((f) => f.accountId));
	const heldInFunds = balances
		.filter((b) => b.account.include_in_net_worth && fundAccountIds.has(b.account.id))
		.reduce((s, b) => s + b.balance, 0);
	const projectedNetWorth = HORIZON_YEARS.map(
		(_, i) => worth - heldInFunds + fundRows.reduce((s, f) => s + f.projected[i], 0)
	);

	return {
		balances,
		snapshots,
		funds,
		netWorth: worth,
		fundRows,
		horizons: [...HORIZON_YEARS],
		projectedNetWorth
	};
};
