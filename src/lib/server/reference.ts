import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';

/** 入力フォーム用のマスタ（口座は RLS で見える分だけ返る）。 */
export async function loadReference(supabase: SupabaseClient<Database>) {
	const [accounts, categories, shops, methods] = await Promise.all([
		supabase.from('accounts').select('*').eq('is_active', true).order('id'),
		supabase.from('categories').select('*').order('name'),
		supabase.from('shops').select('*').order('name'),
		supabase.from('payment_methods').select('*').order('id')
	]);
	const err = accounts.error ?? categories.error ?? shops.error ?? methods.error;
	if (err) throw new Error(err.message);
	return {
		accounts: accounts.data ?? [],
		categories: categories.data ?? [],
		shops: shops.data ?? [],
		paymentMethods: methods.data ?? []
	};
}

/** ログイン中ユーザーに対応するメンバー。 */
export async function currentMember(supabase: SupabaseClient<Database>, userId: string) {
	const { data } = await supabase
		.from('members')
		.select('*')
		.eq('auth_user_id', userId)
		.maybeSingle();
	return data;
}
