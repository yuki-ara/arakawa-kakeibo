export const yen = (n: number) => `${n < 0 ? '−' : ''}¥${Math.abs(n).toLocaleString('ja-JP')}`;

/** 日本時間の今日 (YYYY-MM-DD) */
export const todayJst = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

/** YYYY-MM の月初・翌月初 */
export function monthRange(month: string): { from: string; to: string } {
	const [y, m] = month.split('-').map(Number);
	const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
	return { from: `${month}-01`, to: `${next}-01` };
}

export const shiftMonth = (month: string, delta: number) => {
	const [y, m] = month.split('-').map(Number);
	const d = new Date(Date.UTC(y, m - 1 + delta, 1));
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const isMonth = (s: string | null | undefined): s is string =>
	!!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
