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
| Frontend | React + @dojoengine/sdk + Tailwind CSS |

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
sozo test
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

## 📄 Game Design

See [GAME_DESIGN_v2.md](./GAME_DESIGN_v2.md) for the full specification.

## 👥 Team

- **r0ze** ([@r0ze_____](https://x.com/r0ze_____)) — Game Design & Direction
- **neo** — AI Engineering & Development

## 📜 License

MIT
