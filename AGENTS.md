# AGENTS.md — 0xCIV

> 目次ファイル。詳細は docs/ を参照。ここは100行以内に保つ。

## プロジェクト概要
AIシビライゼーション戦略ゲーム on Starknet（Dojo Game Jam VIII）。
プレイヤーは自然言語プロンプトでAIエージェントを指揮する。

## アーキテクチャ
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

## ゲーム仕様
→ [docs/product-specs/game-design.md](./docs/product-specs/game-design.md)

## デプロイ手順
→ [docs/references/deploy.md](./docs/references/deploy.md)

## 完了タスク
→ [docs/exec-plans/completed/](./docs/exec-plans/completed/)

## 技術スタック
- **Contracts**: Cairo / Dojo Engine (sozo, Katana, Torii)
- **Frontend**: React + Vite + Tailwind
- **Agent**: TypeScript + Claude LLM + Torii GraphQL + starknet.js
- **Hosting**: Slot (Cartridge)

## サービスURL
| サービス | URL |
|---------|-----|
| Katana | https://api.cartridge.gg/x/0xciv/katana |
| Torii | https://api.cartridge.gg/x/0xciv/torii/graphql |
| World | `0x026d5777...ef` |
| Contract | `0xf354bbf...a9` (dojo_starter-actions) |

## ルール

### コーディング規約
- Cairo: Dojo conventions (#[dojo::model], #[dojo::event], IActionsDispatcher)
- TypeScript: strict mode, async/await, proper error handling
- 退屈な技術を好む — LLMが正しく扱える技術を選ぶ

### コミット規約
- conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- 1 PR = 1関心事

### テスト
- Cairo: `sozo test` — 12テスト全パス必須
- Client: `npm run build` パス必須
- PRマージ前にCI全パス

### ドキュメント
- コードを変えたら関連ドキュメントも更新する
- AGENTS.mdは目次のみ — 仕様の詳細はdocs/に書く
