#!/usr/bin/env bash
# ラズパイ上で実行: 最新を取得 → 依存インストール → ビルド → 再起動
set -euo pipefail

main() {
	cd "$(dirname "$0")/.."

	git pull --ff-only
	npm ci
	npm run build
	sudo systemctl restart arakawa-kakeibo
	sleep 3
	systemctl is-active arakawa-kakeibo
	curl -fsS -o /dev/null http://127.0.0.1:3100/login
	echo "deploy OK: $(git rev-parse --short HEAD)"
}

# git pull でこのスクリプト自体が書き換わっても途中で壊れないよう、全体を読み込んでから実行する
main "$@"
exit
