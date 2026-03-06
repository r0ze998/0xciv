# 0xCIV Agent — AI Civilization Decision Engine

Reads game state from Torii (Dojo indexer), uses Claude to decide actions based on player's strategy prompt.

## Setup

```bash
cd agent
npm install
```

## Environment Variables

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export TORII_URL="http://localhost:8080/graphql"  # default
export GAME_ID=1
export CIV_ID=0
export PLAYER_PROMPT="Prioritize food. Attack the weakest. Never trade."
```

## Run

```bash
npx ts-node src/index.ts
```

## How It Works

1. Reads game state from Torii GraphQL (civilizations, territories, trades)
2. Sends game state + player's strategy prompt to Claude
3. Claude decides one action: gather / attack / defend / propose_trade / accept_trade
4. Outputs the action as JSON (to be executed on-chain via Dojo SDK)

## Architecture

```
Player Prompt → Agent → Torii (read state) → Claude (decide) → Dojo (execute)
```
