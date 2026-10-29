import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			/** 認証済みユーザーの auth uid（未ログインは null） */
			userId: string | null;
		}
	}
}

export {};
