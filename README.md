# 荒川家の家計簿 (arakawa-kakeibo)

2人世帯の家計簿＋資産管理アプリ。SvelteKit + Svelte 5 + Tailwind CSS v4 + Supabase（Auth / Postgres / RLS）。
Raspberry Pi 上で adapter-node として動かし、Tailscale 経由で利用する想定。

## セットアップ

```sh
cp .env.example .env   # PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_KEY を設定
npm ci
npm run dev
```

- 本番: `npm run build && node build/index.js`（`.env` の値を環境変数として渡す）
- 検証: `npm run check` / `npm run lint` / `npm test`
- `service_role` / secret key はこのアプリには不要。コミット・配置しないこと。

## 残高の考え方

- `balance_snapshots` は「その日の開始時点の残高」。銀行・現金は最新スナップショット＋その日以降の取引で算出。
- 投資系口座はファンドごとの最新スナップショットの合計（想定評価額は今後実装）。
- 個人口座の可視性は DB 側の RLS で制御（共同口座は全員、個人口座は本人のみ）。
