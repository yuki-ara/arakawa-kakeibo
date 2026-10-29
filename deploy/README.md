# ラズパイへのデプロイ

前提: Node.js 22.17 以上（`node -v` で確認）、git、Tailscale 導入済み。

## 初回

```sh
git clone https://github.com/yuki-ara/arakawa-kakeibo.git ~/arakawa-kakeibo
cd ~/arakawa-kakeibo
cp .env.example .env && nano .env     # PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_KEY / ORIGIN
npm ci && npm run build
sudo cp deploy/arakawa-kakeibo.service /etc/systemd/system/   # User/パスを環境に合わせて編集
sudo systemctl daemon-reload
sudo systemctl enable --now arakawa-kakeibo
curl -I http://127.0.0.1:3100/login   # 200 なら起動OK
```

## Tailscale から開く

アプリは `127.0.0.1:3100` で待ち受けるので、`tailscale serve` で tailnet 内に公開する。

```sh
sudo tailscale serve --bg --https=443 http://127.0.0.1:3100
tailscale serve status    # 公開URLを確認 → .env の ORIGIN に設定
```

`ORIGIN` を設定したら `sudo systemctl restart arakawa-kakeibo`。
※ HTTPS 証明書を使うには Tailscale 管理画面で MagicDNS と HTTPS Certificates の有効化が必要。
※ 既存の Dash アプリが 443 を使っている場合は `--https=8443` など別ポートにする。

## 更新

```sh
~/arakawa-kakeibo/deploy/deploy.sh
```

ログ確認: `journalctl -u arakawa-kakeibo -f`
