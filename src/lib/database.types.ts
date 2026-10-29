// Supabase の generate_typescript_types で生成した型（2026-10-29 時点）。
// スキーマを変更したら再生成すること。汎用ヘルパー型（Tables 等）は省略している。

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	__InternalSupabase: {
		PostgrestVersion: '12.2.3';
	};
	public: {
		Tables: {
			accounts: {
				Row: {
					created_at: string;
					id: number;
					include_in_net_worth: boolean;
					is_active: boolean;
					kind: string;
					name: string;
					owner_id: number | null;
				};
				Insert: {
					created_at?: string;
					id?: never;
					include_in_net_worth?: boolean;
					is_active?: boolean;
					kind: string;
					name: string;
					owner_id?: number | null;
				};
				Update: {
					created_at?: string;
					id?: never;
					include_in_net_worth?: boolean;
					is_active?: boolean;
					kind?: string;
					name?: string;
					owner_id?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'accounts_owner_id_fkey';
						columns: ['owner_id'];
						isOneToOne: false;
						referencedRelation: 'members';
						referencedColumns: ['id'];
					}
				];
			};
			balance_snapshots: {
				Row: {
					account_id: number;
					as_of: string;
					created_at: string;
					fund_id: number | null;
					id: number;
					value: number;
				};
				Insert: {
					account_id: number;
					as_of: string;
					created_at?: string;
					fund_id?: number | null;
					id?: never;
					value: number;
				};
				Update: {
					account_id?: number;
					as_of?: string;
					created_at?: string;
					fund_id?: number | null;
					id?: never;
					value?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'balance_snapshots_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'balance_snapshots_fund_id_fkey';
						columns: ['fund_id'];
						isOneToOne: false;
						referencedRelation: 'funds';
						referencedColumns: ['id'];
					}
				];
			};
			categories: {
				Row: {
					created_at: string;
					id: number;
					kind: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					kind?: string;
					name: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					kind?: string;
					name?: string;
				};
				Relationships: [];
			};
			funds: {
				Row: {
					account_id: number;
					expected_return: number;
					id: number;
					is_active: boolean;
					name: string;
					sub_type: string | null;
				};
				Insert: {
					account_id: number;
					expected_return?: number;
					id?: never;
					is_active?: boolean;
					name: string;
					sub_type?: string | null;
				};
				Update: {
					account_id?: number;
					expected_return?: number;
					id?: never;
					is_active?: boolean;
					name?: string;
					sub_type?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'funds_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					}
				];
			};
			goals: {
				Row: {
					id: number;
					memo: string | null;
					name: string;
					target_amount: number;
					target_date: string | null;
				};
				Insert: {
					id?: never;
					memo?: string | null;
					name: string;
					target_amount: number;
					target_date?: string | null;
				};
				Update: {
					id?: never;
					memo?: string | null;
					name?: string;
					target_amount?: number;
					target_date?: string | null;
				};
				Relationships: [];
			};
			investment_plans: {
				Row: {
					fund_id: number;
					id: number;
					monthly_amount: number;
					valid_from: string;
					valid_to: string | null;
				};
				Insert: {
					fund_id: number;
					id?: never;
					monthly_amount: number;
					valid_from: string;
					valid_to?: string | null;
				};
				Update: {
					fund_id?: number;
					id?: never;
					monthly_amount?: number;
					valid_from?: string;
					valid_to?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'investment_plans_fund_id_fkey';
						columns: ['fund_id'];
						isOneToOne: false;
						referencedRelation: 'funds';
						referencedColumns: ['id'];
					}
				];
			};
			members: {
				Row: {
					auth_user_id: string | null;
					created_at: string;
					id: number;
					name: string;
				};
				Insert: {
					auth_user_id?: string | null;
					created_at?: string;
					id?: never;
					name: string;
				};
				Update: {
					auth_user_id?: string | null;
					created_at?: string;
					id?: never;
					name?: string;
				};
				Relationships: [];
			};
			payment_methods: {
				Row: {
					created_at: string;
					id: number;
					name: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			shops: {
				Row: {
					created_at: string;
					id: number;
					name: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			transactions: {
				Row: {
					account_id: number;
					amount: number;
					category_id: number | null;
					created_at: string;
					created_by: number | null;
					date: string;
					id: string;
					item: string | null;
					legacy_id: string | null;
					note: string | null;
					payment_method_id: number | null;
					shop_id: number | null;
					source_key: string | null;
					to_account_id: number | null;
					type: string;
				};
				Insert: {
					account_id: number;
					amount: number;
					category_id?: number | null;
					created_at?: string;
					created_by?: number | null;
					date: string;
					id?: string;
					item?: string | null;
					legacy_id?: string | null;
					note?: string | null;
					payment_method_id?: number | null;
					shop_id?: number | null;
					source_key?: string | null;
					to_account_id?: number | null;
					type: string;
				};
				Update: {
					account_id?: number;
					amount?: number;
					category_id?: number | null;
					created_at?: string;
					created_by?: number | null;
					date?: string;
					id?: string;
					item?: string | null;
					legacy_id?: string | null;
					note?: string | null;
					payment_method_id?: number | null;
					shop_id?: number | null;
					source_key?: string | null;
					to_account_id?: number | null;
					type?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'transactions_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'transactions_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'transactions_created_by_fkey';
						columns: ['created_by'];
						isOneToOne: false;
						referencedRelation: 'members';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'transactions_payment_method_id_fkey';
						columns: ['payment_method_id'];
						isOneToOne: false;
						referencedRelation: 'payment_methods';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'transactions_shop_id_fkey';
						columns: ['shop_id'];
						isOneToOne: false;
						referencedRelation: 'shops';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'transactions_to_account_id_fkey';
						columns: ['to_account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			can_see_account: { Args: { acc: number }; Returns: boolean };
			current_member_id: { Args: never; Returns: number };
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};
