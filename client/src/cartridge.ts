// Cartridge Controller integration
import { ControllerConnector } from '@cartridge/connector'

// Contract address from deployment
const ACTIONS_CONTRACT = import.meta.env.VITE_ACTIONS_CONTRACT || '0x0'

// Policies define which contract calls the controller can make
const policies = [
  { target: ACTIONS_CONTRACT, method: 'create_game' },
  { target: ACTIONS_CONTRACT, method: 'spawn_civilization' },
  { target: ACTIONS_CONTRACT, method: 'set_strategy' },
  { target: ACTIONS_CONTRACT, method: 'gather' },
  { target: ACTIONS_CONTRACT, method: 'propose_trade' },
  { target: ACTIONS_CONTRACT, method: 'accept_trade' },
  { target: ACTIONS_CONTRACT, method: 'attack' },
  { target: ACTIONS_CONTRACT, method: 'defend' },
  { target: ACTIONS_CONTRACT, method: 'advance_turn' },
  { target: ACTIONS_CONTRACT, method: 'check_elimination' },
]

export const connector = new ControllerConnector({ policies })

export async function connectWallet() {
  try {
    const account = await connector.connect()
    if (!account) throw new Error('No account returned')
    return account
  } catch (err) {
    console.error('Wallet connection failed:', err)
    throw err
  }
}

export async function disconnectWallet() {
  await connector.disconnect()
}
