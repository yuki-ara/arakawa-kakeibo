import { fail } from '@sveltejs/kit';
import { todayJst } from '#lib/format.js';
import { loadFundProjections } from '#lib/server/projection.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	fundRows: await loadFundProjections(locals.supabase, todayJst().slice(0, 7))
});

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const form = await request.formData();
		const fundId = Number(form.get('fund_id'));
		const expectedReturn = Number(form.get('expected_return'));
		const monthly = Number(form.get('monthly_amount'));

		if (!Number.isInteger(fundId)) return fail(400, { fundId, message: 'ファンドが不正です' });
		if (!Number.isFinite(expectedReturn) || expectedReturn < -50 || expectedReturn > 50)
			return fail(400, { fundId, message: '想定リターンは -50〜50（%）で入力してください' });
		if (!Number.isInteger(monthly) || monthly < 0)
			return fail(400, { fundId, message: '積立額は0以上の整数で入力してください' });

		const fund = await locals.supabase
			.from('funds')
			.update({ expected_return: expectedReturn })
			.eq('id', fundId);
		if (fund.error) return fail(400, { fundId, message: fund.error.message });

		// 現在有効な（終了日なしの）プランを1本として扱い、あれば更新・なければ追加する
		const open = await locals.supabase
			.from('investment_plans')
			.select('id')
			.eq('fund_id', fundId)
			.is('valid_to', null)
			.maybeSingle();
		if (open.error) return fail(400, { fundId, message: open.error.message });

		const res = open.data
			? await locals.supabase
					.from('investment_plans')
					.update({ monthly_amount: monthly })
					.eq('id', open.data.id)
			: monthly > 0
				? await locals.supabase.from('investment_plans').insert({
						fund_id: fundId,
						monthly_amount: monthly,
						valid_from: `${todayJst().slice(0, 7)}-01`
					})
				: { error: null };
		if (res.error) return fail(400, { fundId, message: res.error.message });

		return { fundId, saved: true };
	}
};
