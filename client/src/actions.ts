// On-chain action execution from frontend via Cartridge Controller
import { connector } from './cartridge'

const ACTIONS_CONTRACT = import.meta.env.VITE_ACTIONS_CONTRACT || '0xf354bbf71b6e93a15229be99fccd8a4142d87b7ef741de5ae2a9b7661407a9'

async function getAccount() {
  const ctrl = connector.controller
  if (!ctrl) throw new Error('Controller not initialized')
  // account is a WalletAccount property, not a function
  const account = ctrl.account
  if (!account) throw new Error('Not connected')
  return account
}

export async function executeGather() {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'gather',
    calldata: [],
  }])
}

export async function executeAttack(targetCiv: number) {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'attack',
    calldata: [targetCiv.toString()],
  }])
}

export async function executeDefend() {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'defend',
    calldata: [],
  }])
}

export async function executeAdvanceTurn() {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'advance_turn',
    calldata: [],
  }])
}

export async function executeSetStrategy(promptHash: string) {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'set_strategy',
    calldata: [promptHash],
  }])
}

export async function executeCreateGame() {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'create_game',
    calldata: [],
  }])
}

export async function executeProposeTrade(toCiv: number, offerType: number, offerAmount: number, requestType: number, requestAmount: number) {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'propose_trade',
    calldata: [toCiv.toString(), offerType.toString(), offerAmount.toString(), requestType.toString(), requestAmount.toString()],
  }])
}

export async function executeAcceptTrade(tradeId: number) {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'accept_trade',
    calldata: [tradeId.toString()],
  }])
}

export async function executeSpawnCivilization() {
  const account = await getAccount()
  return account.execute([{
    contractAddress: ACTIONS_CONTRACT,
    entrypoint: 'spawn_civilization',
    calldata: [],
  }])
}
