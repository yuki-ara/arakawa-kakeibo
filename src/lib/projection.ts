export interface PlanPeriod {
	monthly_amount: number;
	valid_from: string; // YYYY-MM-DD
	valid_to: string | null;
}

export interface FundProjectionInput {
	/** 起点の評価額 */
	value: number;
	/** 起点の日付 (YYYY-MM-DD) */
	asOf: string;
	/** 想定リターン（年率 %） */
	expectedReturn: number;
	plans: PlanPeriod[];
}

const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

/** YYYY-MM-DD → 通算月数（年*12+月-1）。 */
const monthIndex = (date: string) => {
	const [y, m] = date.split('-').map(Number);
	return y * 12 + (m - 1);
};

export const monthIndexToKey = (idx: number) => monthKey(Math.floor(idx / 12), (idx % 12) + 1);

/**
 * 指定月（YYYY-MM）末時点の想定評価額を返す。
 *
 * - 起点の月の翌月から、毎月「積立額を追加 → 月利で成長」を繰り返す（起点月の積立は起点評価額に含まれる前提）。
 * - 月利は年率の複利換算 (1+R)^(1/12)-1。
 * - 積立額は plan の有効期間（valid_from〜valid_to の月）に応じて月ごとに決まる。
 * - 起点以前の月を指定した場合は起点評価額をそのまま返す。
 */
export function projectValue(input: FundProjectionInput, targetMonth: string): number {
	const start = monthIndex(input.asOf);
	const end = monthIndex(`${targetMonth}-01`);
	const r = Math.pow(1 + input.expectedReturn / 100, 1 / 12) - 1;

	let v = input.value;
	for (let i = start + 1; i <= end; i++) {
		const contribution = input.plans
			.filter(
				(p) => monthIndex(p.valid_from) <= i && (p.valid_to === null || monthIndex(p.valid_to) >= i)
			)
			.reduce((s, p) => s + p.monthly_amount, 0);
		v = (v + contribution) * (1 + r);
	}
	return Math.round(v);
}

/** 現在月から n ヶ月後の YYYY-MM。 */
export function addMonthsToKey(month: string, n: number): string {
	return monthIndexToKey(monthIndex(`${month}-01`) + n);
}
