import { fail, redirect } from '@sveltejs/kit';
import { todayJst } from '#lib/format.js';
import { parseTransactionForm } from '#lib/transaction-form.js';
import { currentMember, loadReference } from '#lib/server/reference.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	...(await loadReference(locals.supabase)),
	today: todayJst()
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const parsed = parseTransactionForm(await request.formData());
		if (!parsed.ok) return fail(400, { message: parsed.message });

		const member = await currentMember(locals.supabase, locals.userId!);
		if (!member) return fail(403, { message: 'メンバー情報が見つかりません' });

		const { error } = await locals.supabase
			.from('transactions')
			.insert({ ...parsed.value, created_by: member.id });
		if (error) return fail(400, { message: `保存に失敗しました: ${error.message}` });

		redirect(303, `/transactions?month=${parsed.value.date.slice(0, 7)}`);
	}
};
