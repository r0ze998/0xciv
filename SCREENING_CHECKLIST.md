# 0xCIV Screening Checklist (Game Jam VIII)

## Required
- [x] Uses Dojo Engine (Cairo contracts, sozo build/test, Katana, Torii)
- [x] Dojo models with proper annotations (#[dojo::model], #[dojo::event])
- [x] Dojo systems (IActionsDispatcher, world storage)
- [x] sozo build passes
- [x] sozo test passes (3 tests)
- [x] Frontend uses @dojoengine/sdk
- [x] Cartridge Controller integration (@cartridge/controller + @cartridge/connector)
- [ ] Deployed to Slot OR Sepolia (needs r0ze auth: `slot auth login`)
- [x] Source code on GitHub: github.com/r0ze998/0xciv

## Theme: "Stop fighting bots — design around them"
- [x] Core mechanic: AI agents ARE the game — players write prompts that control AI civilizations
- [x] Agent-first design: bots execute all game actions
- [x] Theme fit explained in README and submission template

## Quality
- [x] README with setup instructions
- [x] Architecture diagram
- [x] How to Play section
- [x] Production build passing
- [x] .env.example files

## Blocking
- [ ] **Slot deployment** — requires `slot auth login` (interactive browser auth)
  - Once authed: `slot deployments create 0xciv katana`
  - Then: `sozo migrate --profile slot`
  - Then: `slot deployments create 0xciv torii --world <addr>`
