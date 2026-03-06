# 0xCIV — Slot Deployment Guide

r0ze、起きたらこれを順番にやって！neoが横でサポートする。

## Step 1: Slot認証

```bash
slot auth login
```
→ ブラウザが開く → Cartridgeアカウントでログイン

## Step 2: Katana作成

```bash
slot deployments create 0xciv katana --version v1.8.6
```

## Step 3: デプロイ

```bash
# RPC URLをメモ（例: https://api.cartridge.gg/x/0xciv/katana）
sozo migrate --rpc-url https://api.cartridge.gg/x/0xciv/katana
```
→ World addressをメモ

## Step 4: Torii作成

```bash
slot deployments create 0xciv torii --version v1.8.15 --world <WORLD_ADDRESS> --rpc https://api.cartridge.gg/x/0xciv/katana
```

## Step 5: フロントエンド設定

```bash
cd client
echo "VITE_TORII_URL=https://api.cartridge.gg/x/0xciv/torii/graphql" > .env
echo "VITE_ACTIONS_CONTRACT=<CONTRACT_ADDRESS>" >> .env
npm run build
```

## Step 6: 提出PR

```bash
# game-jams repoをfork → submission fileをコピー → PR作成
gh repo fork dojoengine/game-jams --clone
cp submission/0x-civ.md game-jams/gj8/0x-civ.md
cd game-jams && git add -A && git commit -m "Submit 0xCIV" && git push
gh pr create --title "[Project Registration]: 0xCIV" --body "AI civilization prompt strategy game"
```

## Step 0 (もしまだなら): プロジェクト登録Issue

```bash
# dojoengine/game-jams に登録Issue作成（Webから）
# https://github.com/dojoengine/game-jams/issues/new?assignees=&labels=&projects=&template=register_project.yaml&title=%5BProject+Registration%5D:+0xCIV
```

## 所要時間: 約15分
