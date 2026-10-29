import { error, fail, redirect } from '@sveltejs/kit';
import { parseTransactionForm } from '#lib/transaction-form.js';
import { loadReference } from '#lib/server/reference.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data, error: err } = await locals.supabase
		.from('transactions')
		.select('*')
		.eq('id', params.id)
		.maybeSingle();
	if (err) throw new Error(err.message);
	if (!data) error(404, '取引が見つかりません');
	return { transaction: data, ...(await loadReference(locals.supabase)) };
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const parsed = parseTransactionForm(await request.formData());
		if (!parsed.ok) return fail(400, { message: parsed.message });
		const { error: err } = await locals.supabase
			.from('transactions')
			.update(parsed.value)
			.eq('id', params.id);
		if (err) return fail(400, { message: `保存に失敗しました: ${err.message}` });
		redirect(303, `/transactions?month=${parsed.value.date.slice(0, 7)}`);
	},
	delete: async ({ locals, params }) => {
		const { error: err } = await locals.supabase.from('transactions').delete().eq('id', params.id);
		if (err) return fail(400, { message: `削除に失敗しました: ${err.message}` });
		redirect(303, '/transactions');
	}
};
