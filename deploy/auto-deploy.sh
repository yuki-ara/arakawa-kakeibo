#!/usr/bin/env bash
# GitHub の main に更新があれば deploy.sh を実行する（systemd timer から定期実行）
set -euo pipefail
cd "$(dirname "$0")/.."

# 多重起動を防ぐ
exec 9>/tmp/arakawa-kakeibo-deploy.lock
flock -n 9 || { echo "別のデプロイが実行中のためスキップ"; exit 0; }

git fetch --quiet origin main
local_rev=$(git rev-parse HEAD)
remote_rev=$(git rev-parse origin/main)

if [ "$local_rev" = "$remote_rev" ]; then
	exit 0
fi

echo "更新を検出: ${local_rev:0:7} -> ${remote_rev:0:7}"
./deploy/deploy.sh
echo "デプロイ完了: ${remote_rev:0:7}"
