import type { Account, Snapshot, Transaction } from './types.js';

const INVESTMENT_KINDS = new Set(['securities', 'nisa', 'ideco']);

export interface AccountBalance {
	account: Account;
	balance: number;
}

/**
 * 口座ごとの現在残高を計算する。
 *
 * - スナップショットは「その日の開始時点の残高」とみなす。
 * - 銀行・現金など: 口座ごとの最新スナップショット + as_of 以降（当日含む）の取引。
 *   収入は加算、支出は減算、振替は振替元を減算・振替先を加算する。
 * - 投資系（証券・NISA・iDeCo）: ファンドごとの最新スナップショットの合計（取引は反映しない）。
 * - ローンは残債をマイナスで扱いたい場合、スナップショットに負の値を入れる。
 */
export function computeBalances(
	accounts: Account[],
	snapshots: Snapshot[],
	transactions: Transaction[]
): AccountBalance[] {
	return accounts.map((account) => {
		const mine = snapshots.filter((s) => s.account_id === account.id);

		if (INVESTMENT_KINDS.has(account.kind)) {
			const latestByFund = new Map<number | null, Snapshot>();
			for (const s of mine) {
				const cur = latestByFund.get(s.fund_id);
				if (!cur || s.as_of > cur.as_of) latestByFund.set(s.fund_id, s);
			}
			const balance = [...latestByFund.values()].reduce((sum, s) => sum + s.value, 0);
			return { account, balance };
		}

		const base = mine.reduce<Snapshot | null>(
			(best, s) => (!best || s.as_of > best.as_of ? s : best),
			null
		);
		let balance = base?.value ?? 0;
		const from = base?.as_of ?? '0000-00-00';
		for (const t of transactions) {
			if (t.date < from) continue;
			if (t.type === 'income' && t.account_id === account.id) balance += t.amount;
			else if (t.type === 'expense' && t.account_id === account.id) balance -= t.amount;
			else if (t.type === 'transfer') {
				if (t.account_id === account.id) balance -= t.amount;
				if (t.to_account_id === account.id) balance += t.amount;
			}
		}
		return { account, balance };
	});
}

/** 純資産（include_in_net_worth の口座のみ合計）。 */
export function netWorth(balances: AccountBalance[]): number {
	return balances
		.filter((b) => b.account.include_in_net_worth)
		.reduce((sum, b) => sum + b.balance, 0);
}

/** 月間の収入・支出合計（振替は除外）。 */
export function monthlyTotals(transactions: Transaction[]): { income: number; expense: number } {
	let income = 0;
	let expense = 0;
	for (const t of transactions) {
		if (t.type === 'income') income += t.amount;
		else if (t.type === 'expense') expense += t.amount;
	}
	return { income, expense };
}
