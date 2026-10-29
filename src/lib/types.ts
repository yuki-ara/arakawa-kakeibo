import type { Database } from './database.types.js';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type Account = Row<'accounts'>;
export type Snapshot = Row<'balance_snapshots'>;
export type Transaction = Row<'transactions'>;
export type Category = Row<'categories'>;
export type Shop = Row<'shops'>;
export type PaymentMethod = Row<'payment_methods'>;

export type TxType = 'income' | 'expense' | 'transfer';
export const TX_TYPE_LABEL: Record<TxType, string> = {
	income: '収入',
	expense: '支出',
	transfer: '振替'
};
export const ACCOUNT_KIND_LABEL: Record<string, string> = {
	bank: '銀行',
	cash: '現金',
	securities: '証券',
	nisa: 'NISA・投資信託',
	ideco: 'iDeCo',
	loan: 'ローン',
	other: 'その他'
};

export type TablesInsertTx = Database['public']['Tables']['transactions']['Insert'];
