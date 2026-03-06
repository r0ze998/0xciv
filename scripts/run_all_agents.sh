#!/bin/bash
# Run 4 AI agents simultaneously with different strategies
# Usage: ANTHROPIC_API_KEY=sk-... bash scripts/run_all_agents.sh

AGENT_DIR="$(dirname "$0")/../agent"

STRATEGIES=(
  "Focus on economy. Gather every turn. Only defend if attacked. Trade surplus metal for food."
  "Aggressive expansion. Attack the weakest neighbor. Prioritize metal for military."
  "Diplomatic trader. Propose trades every turn. Build knowledge. Never attack first."
  "Balanced survivor. Gather when safe, defend when threatened. Keep food above 50."
)

echo "🤖 Starting 4 AI agents for 0xCIV..."
echo ""

for i in 1 2 3 4; do
  idx=$((i - 1))
  echo "Civ #$i: ${STRATEGIES[$idx]}"
  (cd "$AGENT_DIR" && \
    GAME_ID=1 CIV_ID=$i \
    PLAYER_PROMPT="${STRATEGIES[$idx]}" \
    TURN_DELAY_MS=3000 \
    MAX_TURNS=20 \
    npx ts-node src/loop.ts 2>&1 | sed "s/^/[Civ$i] /") &
done

echo ""
echo "All agents started. Press Ctrl+C to stop."
wait
