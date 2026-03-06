# 0xCIV — Claude Code Task List

## Project
AI civilization strategy game for Dojo Game Jam VIII. Players write natural language prompts to command AI agents.

## Architecture
- `src/` — Cairo/Dojo contracts (DONE, build+test pass)
- `client/` — React+Vite+Tailwind frontend (DONE, mock data)
- `agent/` — AI agent with Torii GraphQL + Claude LLM (DONE, standalone)

## Running Services
- Katana devnet: http://localhost:5050
- Torii indexer: http://localhost:8080
- Vite dev: http://localhost:5173
- World: 0x026d5777eccca1861a23303ee0ba48c0e8349e849d0377a21c3801ef1d0f8cef

## Task Queue (do these IN ORDER, don't skip)

### Task 1: Connect Frontend to Torii
- Install @dojoengine/sdk in client/
- Replace mock data in App.tsx with real Torii GraphQL queries
- Game state, civilizations, territories should come from on-chain data
- Keep mock simulation as fallback if Torii connection fails

### Task 2: Create Game Script
- Write a script that calls create_game and spawn_civilization for 4 players
- Use sozo execute or a TypeScript script with starknet.js
- Test that Torii picks up the events

### Task 3: Agent On-chain Execution
- Connect agent/src/index.ts to actually execute transactions on Katana
- Install starknet.js in agent/
- After LLM decides action, call the corresponding contract function
- Use one of Katana's pre-funded accounts

### Task 4: Integration Test
- Run full loop: create game → spawn civs → agent reads state → agent decides → agent executes → frontend shows update
- Fix any bugs found

### Task 5: Polish
- Add error handling throughout
- Improve UI feedback (loading states, error messages)
- Update README with final setup instructions
- Git commit and push after each task

## Rules
- After EACH task completion, run: openclaw system event --text "Done: [task name]" --mode now
- Git commit and push after each task
- If a task is blocked, skip to the next and come back
- If something fails after 3 attempts, document the issue and move on
- Read GAME_DESIGN_v2.md for full game spec
