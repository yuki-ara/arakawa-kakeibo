import type { TablesInsertTx } from './types.js';

const num = (v: FormDataEntryValue | null) => {
	const s = String(v ?? '').trim();
	return s === '' ? null : Number(s);
};
const text = (v: FormDataEntryValue | null) => {
	const s = String(v ?? '').trim();
	return s === '' ? null : s;
};

export type ParsedTx = Omit<TablesInsertTx, 'created_by'>;

/** フォーム入力を検証して取引レコードに変換する。エラー時は message を返す。 */
export function parseTransactionForm(
	form: FormData
): { ok: true; value: ParsedTx } | { ok: false; message: string } {
	const type = String(form.get('type'));
	if (!['income', 'expense', 'transfer'].includes(type))
		return { ok: false, message: '種別が不正です' };

	const date = String(form.get('date') ?? '');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: '日付を入力してください' };

	const amount = num(form.get('amount'));
	if (amount === null || !Number.isInteger(amount) || amount <= 0)
		return { ok: false, message: '金額は1以上の整数で入力してください' };

	const account_id = num(form.get('account_id'));
	if (account_id === null) return { ok: false, message: '口座を選んでください' };

	let to_account_id: number | null = null;
	if (type === 'transfer') {
		to_account_id = num(form.get('to_account_id'));
		if (to_account_id === null) return { ok: false, message: '振替先の口座を選んでください' };
		if (to_account_id === account_id) return { ok: false, message: '振替元と振替先が同じです' };
	}

	return {
		ok: true,
		value: {
			type,
			date,
			amount,
			account_id,
			to_account_id,
			category_id: type === 'transfer' ? null : num(form.get('category_id')),
			shop_id: type === 'transfer' ? null : num(form.get('shop_id')),
			payment_method_id: type === 'transfer' ? null : num(form.get('payment_method_id')),
			item: text(form.get('item')),
			note: text(form.get('note'))
		}
	};
}
