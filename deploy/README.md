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
GitHub 上で型チェック・lint・テストを実行し、通ったらラズパイのランナーが `deploy/deploy.sh` を実行する。

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
   `./config.sh` の途中でラベルを聞かれたら `raspi-kakeibo` を追加する。
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
- ワークフローは `main` への push のみで動く。PR では動かない。

## 自動デプロイ（GitHub の main が更新されたら反映）

ラズパイは tailnet 内にあり GitHub から直接は届かないため、ラズパイ側から 2 分おきに GitHub を確認する方式にしている。
`origin/main` に新しいコミットがあれば `deploy/deploy.sh`（pull → npm ci → build → 再起動）を実行する。

```sh
# 1. restart だけ、パスワードなしで実行できるようにする
echo 'yuki ALL=(root) NOPASSWD: /usr/bin/systemctl restart arakawa-kakeibo' | sudo tee /etc/sudoers.d/arakawa-kakeibo-deploy
sudo chmod 440 /etc/sudoers.d/arakawa-kakeibo-deploy
sudo visudo -c   # parsed OK と出ること

# 2. ユニットを登録（User / パスを環境に合わせて編集）
sudo cp deploy/arakawa-kakeibo-deploy.service deploy/arakawa-kakeibo-deploy.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now arakawa-kakeibo-deploy.timer
```

- 動作確認: `systemctl list-timers arakawa-kakeibo-deploy.timer` / `journalctl -u arakawa-kakeibo-deploy -f`
- 手動実行: `./deploy/auto-deploy.sh`
- 止める: `sudo systemctl disable --now arakawa-kakeibo-deploy.timer`
- ビルドに失敗した場合は再起動されず、動いているアプリはそのまま。次の確認時に再試行される。

## 自動デプロイ（GitHub Actions のセルフホストランナー方式）

`.github/workflows/deploy.yml`: main への push で、GitHub 上で型チェック・lint・テスト・ビルドを実行し、
すべて通ったときだけラズパイのランナーが `deploy/deploy.sh` を実行する。PR ではテストのみ。

1. GitHub のリポジトリ → Settings → Actions → Runners → New self-hosted runner → Linux / ARM64 を選び、
   表示される手順（ダウンロード → `./config.sh --url ... --token ...`）をラズパイで実行する。
2. サービスとして常駐させる: `sudo ./svc.sh install yuki && sudo ./svc.sh start`
3. 上の「自動デプロイ（定期確認）」のタイマーを止める（二重デプロイ防止）:
   `sudo systemctl disable --now arakawa-kakeibo-deploy.timer`
4. 稼働用ディレクトリが `/home/yuki/Documents/yuki-dir/arakawa-kakeibo` と違う場合は、
   リポジトリの Settings → Secrets and variables → Actions → Variables に `DEPLOY_DIR` を登録する。

`deploy.sh` 内の `sudo systemctl restart` をパスワードなしで実行できるよう、sudoers の設定（上記）は引き続き必要。
