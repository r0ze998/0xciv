# ARCHITECTURE.md — 0xCIV

## ディレクトリ構造

```
0xciv/
├── AGENTS.md                ← 目次（このファイルへのリンク）
├── ARCHITECTURE.md          ← このファイル
├── README.md                ← 公開README
├── docs/
│   ├── product-specs/       ← ゲーム仕様
│   ├── exec-plans/          ← タスク・計画（active/completed）
│   ├── references/          ← デプロイ手順、外部ドキュメント
│   └── generated/           ← 自動生成ドキュメント
├── src/                     ← Cairo/Dojoコントラクト
│   ├── models/              ← Dojoモデル（Game, Civilization, Territory）
│   ├── systems/             ← Dojoシステム（actions.cairo）
│   └── tests/               ← Cairoテスト（12テスト）
├── client/                  ← React+Vite+Tailwindフロントエンド
│   └── src/
│       ├── App.tsx          ← メインUI
│       ├── sfx.ts           ← Web Audio APIサウンドエフェクト
│       └── ...
├── agent/                   ← AIエージェント
│   └── src/
│       ├── index.ts         ← エントリポイント
│       └── loop.ts          ← ゲームループ
├── assets/                  ← スライド、スクリーンショット、カバー画像
└── submission/              ← ゲームジャム提出ファイル
```

## レイヤー構造

```
Cairo Contracts → Torii Indexer → Agent (LLM + starknet.js) → Frontend (React)
                                                              ↕
                                                         Cartridge Controller
```

- **Contracts** (Cairo): ゲームロジック、状態管理、イベント発行
- **Torii**: オンチェーンデータのインデキシング・GraphQL API
- **Agent**: Toriiからゲーム状態取得 → Claude LLMで戦略決定 → starknet.jsでトランザクション実行
- **Frontend**: Toriiからリアルタイムデータ表示 + Cartridge Controllerでウォレット接続

## 技術選定

| カテゴリ | 技術 | 選定理由 |
|---------|------|---------|
| スマートコントラクト | Cairo / Dojo | ゲームジャム要件、Starknet native |
| フロントエンド | React + Vite + Tailwind | LLM可読性高い、エコシステム大 |
| AIエージェント | TypeScript + Claude | 安定、長いコンテキスト対応 |
| インデクサー | Torii | Dojo標準、GraphQL API |
| ホスティング | Slot (Cartridge) | Dojo公式、Katana+Toriiワンストップ |
