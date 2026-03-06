#!/bin/bash
# Setup script: create game + spawn 4 civilizations using Katana pre-funded accounts
# Usage: ./scripts/setup_game.sh

set -e

RPC_URL="${RPC_URL:-http://localhost:5050}"
WORLD="0x026d5777eccca1861a23303ee0ba48c0e8349e849d0377a21c3801ef1d0f8cef"
CONTRACT="dojo_starter-actions"

# Katana pre-funded accounts (auto-detected or defaults)
ACCOUNTS=(
  "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec,0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"
  "0x13d9ee239f33fea4f8785b9e3870ade909e20a9599ae7cd62c1c292b73af1b7,0x1c9053c053edf324aec366a34c6901b1095b07af69495bffec7d7fe21effb1b"
  "0x17cc6ca902ed4e8baa8463a7009ff18cc294fa85a94b4ce6ac30a9ebd6057c7,0x14d6672dcb4b77ca36a887e9a11cd9d637d5012468175829e9c6e770c61642"
  "0x2af9427c5a277474c079a1283c880ee8a6f0f8fbf73ce969c08d88befec1bba,0x1800000000300000180000000000030000000000003006001800006600"
)

echo "=== 0xCIV Game Setup ==="
echo "RPC: $RPC_URL"
echo ""

# Step 1: Create game (using first account)
IFS=',' read -r ADDR PRIVKEY <<< "${ACCOUNTS[0]}"
echo "[1/5] Creating game..."
sozo execute "$CONTRACT" create_game \
  --world "$WORLD" \
  --rpc-url "$RPC_URL" \
  --account-address "$ADDR" \
  --private-key "$PRIVKEY" \
  --wait 2>&1 || echo "  (game may already exist, continuing...)"
echo ""

# Step 2: Spawn 4 civilizations (one per account)
for i in 0 1 2 3; do
  IFS=',' read -r ADDR PRIVKEY <<< "${ACCOUNTS[$i]}"
  echo "[$(($i+2))/5] Spawning civilization $((i+1)) (account: ${ADDR:0:10}...)..."
  sozo execute "$CONTRACT" spawn_civilization \
    --world "$WORLD" \
    --rpc-url "$RPC_URL" \
    --account-address "$ADDR" \
    --private-key "$PRIVKEY" \
    --wait 2>&1 || echo "  (may already be spawned, continuing...)"
  echo ""
done

echo "=== Setup Complete ==="
echo "4 civilizations spawned. Game should be Running (auto-starts at 2+ players)."
echo "Check Torii at http://localhost:8080/graphql"
