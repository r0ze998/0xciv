# 0xCIV — Frontend Client

React + TypeScript + Vite frontend for the 0xCIV prompt strategy game.

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** (build tool)
- **Tailwind CSS 4** (styling)
- **@dojoengine/sdk** (on-chain state via Torii)
- **@cartridge/controller** (wallet connection)
- **Web Audio API** (procedural BGM + SFX)

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Build

```bash
npm run build    # tsc + vite build → dist/
npm run preview  # preview production build
```

## Project Structure

```
src/
├── App.tsx              # Main game orchestrator
├── main.tsx             # Entry point
├── App.css / index.css  # Animations & global styles
├── components/          # UI components (35+)
│   ├── GridMap.tsx       # 5×5 territory grid
│   ├── PromptPanel.tsx   # Strategy prompt editor
│   ├── GameHeader.tsx    # Top bar (turn, wallet, audio)
│   ├── SidePanel.tsx     # Right panel (stats, logs, replay)
│   ├── MobileNav.tsx     # Bottom tab bar (mobile)
│   ├── LobbyScreen.tsx   # Pre-game lobby + name packs
│   ├── GameOverOverlay   # Victory screen + share card
│   ├── TurnBanner.tsx    # Turn announcement + war cries
│   ├── EventToast.tsx    # Animated event notifications
│   ├── IntroSequence.tsx # Cinematic game start
│   └── ...              # ResourcePanel, TechTree, DiplomacyPanel, etc.
├── hooks/               # Custom React hooks
│   ├── useGameState.ts  # Core game logic + state
│   ├── useSound.ts      # SFX via Web Audio API
│   ├── useBGM.ts        # Procedural chiptune music
│   ├── useReplay.ts     # Game replay system
│   └── useTurnEffects.ts # Turn-based visual effects
├── lib/                 # Utilities
│   ├── constants.ts     # Colors, presets, resource icons
│   ├── game-utils.ts    # Game logic helpers
│   ├── victory.ts       # Victory condition checking
│   └── war-cries.ts     # Random war cry generator
├── types/game.ts        # TypeScript type definitions
├── actions.ts           # On-chain action builders
├── cartridge.ts         # Wallet connection
├── torii.ts             # Torii SDK setup
└── sfx.ts               # Sound effect definitions
```

## Data Modes

- **Torii (on-chain)**: Connects to Torii indexer for real-time on-chain state
- **Mock**: Runs with simulated game state when Torii is unavailable

## Key Features

- Multiple victory conditions (Domination / Research / Economic)
- Weighted keyword AI prompt analysis
- Replay system with scrub controls
- Procedural chiptune BGM
- Mobile-first responsive design
- Animated transitions (toast enter/exit, slide-up nav, victory entrance)
