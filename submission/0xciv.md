# 0xCIV

### Project Summary
0xCIV is a **prompt strategy game** where players write natural language instructions to command AI agent civilizations on a 5×5 grid map. Each civilization is controlled by an AI (Claude) that interprets the player's strategy prompt and decides actions: gather resources, attack enemies, defend, or trade. Last civilization standing wins. The game explores a new genre — "Prompt Strategist" — where your weapon is language, not clicks.

Theme fit: Instead of fighting bots, players **design around them** — writing prompts that shape AI behavior. The bots ARE the game.

### Source Code
https://github.com/r0ze998/0xciv

### Live Demo
> Not yet deployed to Slot/Sepolia.

### Gameplay Screenshot
![0xCIV](../assets/demo-screenshot.png)

### How to Play
1. Start local devnet: `katana --dev --dev.no-fee`
2. Deploy contracts: `sozo migrate`
3. Start indexer: `torii --world <ADDRESS>`
4. Start frontend: `cd client && npm run dev`
5. Write a strategy prompt (e.g., "Gather resources. Attack weakest. Keep food above 50.")
6. Run AI agent: `cd agent && npm run start`
7. Watch your civilization execute your strategy on-chain!

### Twitter
@r0ze_____

### Team Members
- r0ze — Game Design & Direction
- neo (AI) — Engineering & Development
