# 0xCIV — Your Words Shape Civilizations

> AI agent civilization strategy game on Starknet. Command your civilization with natural language prompts.

![0xCIV Screenshot](assets/demo-screenshot.png)

**Dojo Game Jam VIII** | March 6-8, 2026 | Theme: *"Stop fighting bots — design around them"*

## 🎮 What is 0xCIV?

0xCIV is a **prompt strategy game** where players write natural language instructions to command AI agent civilizations. Your words determine how your civilization gathers resources, trades, attacks, and defends.

Same game state + different prompt = different outcome. **The game IS prompt engineering.**

## 🕹️ How to Play

1. **Create** a civilization on the 5×5 grid map (up to 4 players)
2. **Write** a strategy prompt in natural language
   - *"Prioritize knowledge. If attacked, retaliate with full force. Keep food above 50 at all costs."*
   - *"Attack the weakest neighbor every turn. Expand territory aggressively."*
   - *"Defend and trade only. Never attack first."*
3. **Advance** the turn — your AI agent (Claude) reads the game state and executes actions based on your prompt
4. **Watch** the results, edit your prompt anytime
5. **Survive** — last civilization standing wins

Or hit **👁️ SPECTATE** to watch 4 AI civilizations battle with preset strategies!

## 🌐 Play Now

**👉 [r0ze998.github.io/0xciv](https://r0ze998.github.io/0xciv/)**

## ✨ Features

### Gameplay
- **Prompt-driven AI** — Strategy prompts influence civilization behavior
- **Custom civilization names** — Click to rename, or use name packs (Classic, Warriors, 日本, Sci-Fi)
- **Difficulty settings** — Casual / Standard / Hardcore
- **Random events** — Famine, bounty, plague, renaissance every N turns
- **Knowledge matters** — Improves defense, healing, and trade rates
- **Smart AI targeting** — "Attack the weakest" in prompt → actually targets lowest HP

### Visualization
- **HP Timeline** — SVG line chart tracking health over turns
- **Territory Control** — Stacked bar visualization of map control
- **Threat Matrix** — Diplomacy panel showing who might attack who
- **Danger Indicators** — Pulsing warnings on resource panels
- **Prompt Hints** — Contextual strategy suggestions
- **Particle Effects** — Emoji particles on combat, gathering, elimination
- **Combat Shake** — Screen shake on attacks
- **Animated Grid** — Territory capture flash, hover tooltips, adjacency hints
- **Resource Deltas** — See +/- changes each turn with color coding
- **Event Toasts** — Floating notifications for important events

### Modes & Controls
- **Auto-play mode** — Watch at adjustable speed (Fast/Normal/Slow)
- **Spectator mode** — One-click AI vs AI battles
- **Replay system** — Scrub through game history after game over
- **Leaderboard** — Local win/loss tracking with stats
- **Share Card** — Generate & download result image for Twitter/X
- **On-chain actions** — Direct contract calls via Cartridge Controller
- **Sound Effects** — Web Audio API chiptune SFX with mute toggle
- **Keyboard Shortcuts** — N: next, 1-4: civ, A: auto-play, M: mute

## ☠️ Elimination Conditions

Your civilization is eliminated if **any** of these happen:
- **HP reaches 0**
- **All territories lost**
- **Food reaches 0** (starvation)

## 📦 Resources

| Resource | Purpose | Fatal if 0? |
|----------|---------|:-----------:|
| 🍞 Food | Sustains population | ☠️ YES |
| ⚒️ Metal | Military & building | No |
| 📚 Knowledge | Trade rates & defense bonus | No |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| On-chain | **Dojo Engine** (Cairo) on Starknet |
| AI Agent | **Claude AI** (Anthropic) |
| Indexer | **Torii** (GraphQL) |
| Devnet | **Katana** |
| Frontend | React + Vite + Tailwind CSS |
| Hosting | **Slot** (Cartridge) |

## 🏛️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend    │────▶│   Torii      │◀────│   Katana     │
│  React UI   │     │   (GraphQL)  │     │   (Devnet)   │
└─────┬───────┘     └──────────────┘     └──────┬───────┘
      │                                         │
      │  strategy prompt                        │ on-chain state
      ▼                                         │
┌─────────────┐     ┌──────────────┐            │
│  AI Agent   │────▶│  Claude API  │            │
│  (Node.js)  │     │  (Decision)  │            │
└─────┬───────┘     └──────────────┘            │
      │                                         │
      │  execute(gather/attack/defend/trade)     │
      └─────────────────────────────────────────┘
```

## 🔧 Build & Run

### Prerequisites

- [Dojo](https://book.dojoengine.org/) (sozo, katana, torii)
- Node.js 18+

### 1. Contracts

```bash
# Build & test
sozo build
sozo test    # 12/12 tests
```

### 2. Start Local Devnet

```bash
# Terminal 1: Katana
katana --dev --dev.no-fee --http.cors_origins "*"

# Terminal 2: Deploy contracts
sozo migrate

# Terminal 3: Torii indexer (use world address from migrate output)
torii --world 0x<WORLD_ADDRESS> --http.cors_origins "*"
```

### 3. Create a Game

```bash
# Setup 4 civilizations
bash scripts/setup_game.sh
```

### 4. Frontend

```bash
cd client
npm install
npm run dev
# Open http://localhost:5173
```

### 5. Run AI Agent

```bash
cd agent
npm install
export ANTHROPIC_API_KEY=your-key
export GAME_ID=1
export CIV_ID=1
export PLAYER_PROMPT="Gather resources. Trade when possible. Attack only if threatened."
npx ts-node src/index.ts
```

## 🎯 Slot Deployment

```bash
slot deployments create 0xciv katana --version v1.2.5
slot deployments create 0xciv torii --version v1.2.5 --world 0x<WORLD_ADDRESS>
```

## 📄 Game Design

See [docs/product-specs/game-design.md](./docs/product-specs/game-design.md) for the full specification.

## 👥 Team

- **r0ze** ([@r0ze_____](https://x.com/r0ze_____)) — Game Design & Direction
- **neo** ⚡ — AI Engineering & Development

## 📜 License

MIT
