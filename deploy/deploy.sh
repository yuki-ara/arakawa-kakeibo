#!/usr/bin/env bash
# ラズパイ上で実行: 最新を取得 → 依存インストール → ビルド → 再起動
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
npm ci
npm run build
sudo systemctl restart arakawa-kakeibo
sleep 2
systemctl is-active arakawa-kakeibo
