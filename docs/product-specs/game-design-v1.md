# Genesis Protocol: Dawn of Civilizations
## Dojo Game Jam VIII Submission

### Concept
Players own AI agent civilizations that autonomously compete on-chain.
Each player sets their agent's strategy, and the agent executes actions every turn.
All state and logic lives fully on-chain using Dojo Engine on Starknet.

### Core Loop
1. Player spawns a civilization and sets strategy weights
2. Each turn (tick), agents autonomously:
   - Gather resources based on territory
   - Decide to trade, ally, or attack neighbors
   - Execute decisions on-chain
3. Player can adjust strategy between turns
4. After N turns, winner determined by total score (resources + territory)

### Resources (3 types)
- **Food** — sustains population, enables growth
- **Metal** — enables military and building
- **Knowledge** — unlocks better strategies and trade efficiency

### Strategy Settings (player configures)
- **Aggression** (0-100): likelihood to attack vs defend
- **Trade Focus** (0-100): prioritize trading with neighbors
- **Growth Focus** (0-100): invest in resource gathering vs military

### Agent Decision Logic (deterministic, on-chain)
Each turn the agent:
1. Calculates resource production from territory
2. Evaluates neighbors (their strength, resources)
3. Based on strategy weights, picks action:
   - GATHER: focus on resource production
   - TRADE: propose trade with neighbor (exchange surplus for deficit)
   - ATTACK: attempt to take territory from weakest neighbor
   - DEFEND: fortify against attacks
4. Resolves conflicts using simple deterministic formula (military strength + randomness from block hash)

### Models (Cairo/Dojo)
- **Civilization**: owner, name, food, metal, knowledge, territory_count, military_strength, strategy
- **Strategy**: aggression, trade_focus, growth_focus (u8 each, 0-100)
- **Territory**: position (x,y), owner_civ_id, resource_type
- **TradeProposal**: from_civ, to_civ, offer_type, offer_amount, request_type, request_amount
- **GameState**: turn_number, total_turns, game_phase (Setup/Running/Ended)

### Systems (Cairo/Dojo)
- **spawn_civilization**: create new civ with starting resources + territory
- **set_strategy**: player updates their agent's strategy weights
- **tick**: advance one turn — all agents execute simultaneously
- **resolve_trades**: match and execute trade proposals
- **resolve_conflicts**: calculate attack/defense outcomes
- **end_game**: determine winner after final turn

### Frontend (React + Torii)
- Grid map showing territories (colored by owner)
- Resource dashboard per civilization
- Strategy sliders (aggression/trade/growth)
- Turn log showing what each agent did
- Leaderboard

### Tech Stack
- **On-chain**: Dojo Engine (Cairo) on Starknet
- **Indexer**: Torii
- **Local devnet**: Katana
- **Frontend**: React + @dojoengine/sdk
- **No LLM needed**: all AI logic is deterministic on-chain
