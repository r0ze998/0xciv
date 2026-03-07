# Genesis Protocol: Dawn of Civilizations v2 (FINAL)
## Dojo Game Jam VIII — Final Spec

### Core Fantasy
**Prompt Strategist** — Players craft natural language prompts to command AI agents.
The game IS prompt engineering. Same situation + different prompt = different outcome.

### Theme Alignment
Jam theme: "Stop fighting bots — design around them"
→ You don't fight the bot. You tell it HOW to fight.

### Win/Loss Conditions
- **Win**: Last civilization standing
- **Elimination** (any triggers instant death):
  - HP reaches 0
  - All territories lost
  - Food reaches 0

### Core Loop
1. Player spawns a civilization on the 5×5 grid
2. Player writes strategy prompt in natural language
   - e.g. "Prioritize knowledge. If attacked, retaliate with full force. Keep food above 50 at all costs."
   - e.g. "Attack the weakest neighbor every turn. Expand territory aggressively."
   - e.g. "Defend and trade only. Build knowledge for defense bonuses. Never attack first."
3. Player presses "Next Turn" button
4. Daydreams agent reads game state (via Torii) + player's prompt → decides action → executes on-chain
5. Player sees results (turn log)
6. Player can edit prompt anytime
7. Repeat until 1 civilization remains

### Prompt Mechanics
- Written once, runs every turn automatically
- Editable anytime between turns
- Opponent prompts are HIDDEN (information warfare)
- Prompt is sent to Daydreams as system instruction for the LLM

### Map
- 5×5 grid (25 territories)
- Each territory has a resource type (Food / Metal / Knowledge)
- Civilizations start in corners
- Max 4 players per game

### Resources
| Resource | Purpose | Death if 0? |
|----------|---------|-------------|
| Food | Sustains population, enables growth | YES — starvation |
| Metal | Military strength, building | No |
| Knowledge | Better trade rates, defense bonuses | No |

### On-chain Models (Cairo/Dojo)
- **Civilization**: civ_id, owner, hp, food, metal, knowledge, territory_count, military_strength, is_alive
- **Strategy**: civ_id, prompt_hash (actual prompt stored off-chain in Daydreams)
- **Territory**: (x, y), owner_civ_id, resource_type
- **TradeProposal**: trade_id, from_civ, to_civ, offer_type, offer_amount, request_type, request_amount, is_active
- **GameState**: game_id, turn_number, game_phase, civ_count, alive_count, next_trade_id

### On-chain Systems (Cairo/Dojo)
- **create_game**: initialize game with grid and territories
- **spawn_civilization**: create civ at corner with starting resources + HP
- **gather**: collect resources from owned territories
- **propose_trade**: offer trade to another civ
- **accept_trade**: accept a pending trade proposal
- **attack**: attempt to take territory (damages defender HP, may capture territory)
- **defend**: fortify (bonus to defense, reduces incoming HP damage)
- **advance_turn**: increment turn, check elimination conditions, check if only 1 alive
- **check_elimination**: if hp==0 OR food==0 OR territory_count==0 → is_alive = false

### Off-chain: Daydreams Agent
- Reads game state via Torii GraphQL
- Uses player's strategy prompt as system instruction
- LLM decides which on-chain action to call each turn
- Submits transaction to Katana/Starknet
- One Daydreams agent instance per civilization

### Frontend (React) — Priority: WORKING GAME FIRST
Must-have (Day 1-2):
- 5×5 grid map (colored by owner, resource icons)
- Strategy prompt text editor + submit button
- "Next Turn" button
- Turn log (text feed of actions/results)
- Resource dashboard (HP, food, metal, knowledge, territories)
- Game over screen (winner announcement)

Nice-to-have (Day 3, if time):
- Animations (territory capture, attacks)
- Leaderboard
- Dark sci-fi theme polish
- Sound effects

### Tech Stack
- **On-chain**: Dojo Engine (Cairo) on Starknet
- **Indexer**: Torii (GraphQL)
- **Local devnet**: Katana
- **Agent**: Daydreams framework
- **Frontend**: React + @dojoengine/sdk + Tailwind CSS
- **LLM**: Claude or local model for agent decisions

### Judging Criteria Alignment
1. **Novel Dojo use** → Daydreams (official AI agent framework) + Torii for real-time state reading
2. **Originality** → "Prompt as gameplay" is a new genre. No existing game does this.
3. **Visual/Game design** → Working game with clear UI. Polish if time allows.
4. **Fun** → The meta-game of crafting prompts and watching AI interpret them is inherently engaging.

### Development Priority (72 hours)
- Hours 0-24: Contracts compile + deploy on Katana + Torii running
- Hours 12-36: Daydreams agent connected, can read state + execute actions
- Hours 24-48: Frontend with map, prompt editor, turn button, turn log
- Hours 36-60: Integration testing, bug fixes, balance tuning
- Hours 60-72: Polish, README, demo prep, submission
