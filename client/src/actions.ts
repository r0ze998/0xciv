// On-chain action execution from frontend via Cartridge Controller
import { connector } from './cartridge'

const ACTIONS_CONTRACT = import.meta.env.VITE_ACTIONS_CONTRACT || '0x0'

export async function executeGather() {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'gather',
    calldata: [],
  })
}

export async function executeAttack(targetCiv: number) {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'attack',
    calldata: [targetCiv.toString()],
  })
}

export async function executeDefend() {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'defend',
    calldata: [],
  })
}

export async function executeAdvanceTurn() {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'advance_turn',
    calldata: [],
  })
}

export async function executeSetStrategy(promptHash: string) {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'set_strategy',
    calldata: [promptHash],
  })
}

export async function executeCreateGame() {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'create_game',
    calldata: [],
  })
}

export async function executeSpawnCivilization() {
  const account = await connector.controller.account()
  if (!account) throw new Error('Not connected')
  return account.execute({
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'spawn_civilization',
    calldata: [],
  })
}
