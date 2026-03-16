# Frontend Design Guide — 0xCIV

## 方針
サイバーパンク路線。AIっぽいジェネリックなUIを徹底排除する。

## 禁止事項
- **フォント**: Inter, Roboto, Arial, system fonts → 個性的なフォントを使う
- **配色**: 紫グラデ on 白背景 → サイバーパンクに合った配色（ネオン×ダーク）
- **レイアウト**: 予測可能なグリッド → 非対称、重なり、グリッド破りを意識

## チェックポイント

### Typography
- ディスプレイ用とボディ用でフォントペアリング
- ユニークで記憶に残るフォント選定

### Color & Theme
- CSS変数で統一管理
- ドミナントカラー + シャープなアクセント
- ネオングリーン、サイバーブルー、レッド警告色

### Motion
- ページロード時のstaggered reveal（animation-delay）
- ホバーで驚きのあるインタラクション
- CSS-only優先、React時はMotionライブラリ

### Spatial Composition
- 非対称レイアウト
- 要素の重なり、対角線フロー
- 意図的なネガティブスペース

### Backgrounds & Visual Details
- ノイズテクスチャ、グレインオーバーレイ
- スキャンライン効果（既存を維持）
- グラデメッシュ、幾何学パターン

## 原則
> マクシマルでもミニマルでもいい。重要なのは「意図」があること。
> 実装の複雑さはビジョンに合わせる。振り切ったデザインには振り切ったコードを。

## Source
Based on: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
