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

## 自動デプロイ（GitHub Actions + セルフホストランナー）

`main` への push で、`.github/workflows/deploy.yml` が動く。
GitHub 上で型チェック・lint・テスト・ビルドを実行し、通ったらラズパイのランナーが `deploy/deploy.sh` を実行する。

### 初回セットアップ（ラズパイ側）

1. パスワードなしで再起動できるようにする（ユーザー名は環境に合わせる）

   ```sh
   sudo cp deploy/sudoers-arakawa-kakeibo /tmp/arakawa-kakeibo
   sudo visudo -cf /tmp/arakawa-kakeibo && sudo install -m 440 -o root -g root /tmp/arakawa-kakeibo /etc/sudoers.d/arakawa-kakeibo
   sudo -n systemctl restart arakawa-kakeibo && echo OK   # パスワードを聞かれず OK なら成功
   ```

2. ランナーを登録する
   GitHub のリポジトリ → Settings → Actions → Runners → New self-hosted runner
   （OS: Linux、Architecture: ARM64）に表示されるコマンドを、ラズパイで順に実行する。
   ラベルは既定（`self-hosted, Linux, ARM64`）のままでよい。
   その後、サービスとして常駐させる。

   ```sh
   sudo ./svc.sh install     # アプリを動かしているのと同じユーザーで
   sudo ./svc.sh start
   ```

3. リポジトリ変数を設定する
   Settings → Secrets and variables → Actions → Variables → New repository variable
   - 名前: `DEPLOY_DIR`
   - 値: アプリのフルパス（例: `/home/yuki/Documents/yuki-dir/arakawa-kakeibo`）

### 注意

- ランナーは private リポジトリでのみ使うこと（public だと外部の PR からコードを実行される危険がある）。
- main への push ではテスト後にデプロイまで行う。PR ではテストのみ実行し、デプロイはしない。
