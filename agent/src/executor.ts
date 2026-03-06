// On-chain transaction executor using starknet.js
import { Account, RpcProvider, Signer, CallData, num, type AccountOptions } from 'starknet'
import { AgentAction, ResourceType } from './types'

const RPC_URL = process.env.RPC_URL || 'http://localhost:5050'
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xf354bbf71b6e93a15229be99fccd8a4142d87b7ef741de5ae2a9b7661407a9'

// Katana pre-funded accounts (address, privateKey) — indexed by CIV_ID (1-4)
const KATANA_ACCOUNTS: Record<number, { address: string; privateKey: string }> = {
  1: {
    address: '0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec',
    privateKey: '0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912',
  },
  2: {
    address: '0x13d9ee239f33fea4f8785b9e3870ade909e20a9599ae7cd62c1c292b73af1b7',
    privateKey: '0x1c9053c053edf324aec366a34c6901b1095b07af69495bffec7d7fe21effb1b',
  },
  3: {
    address: '0x17cc6ca902ed4e8baa8463a7009ff18cc294fa85a94b4ce6ac30a9ebd6057c7',
    privateKey: '0x14d6672dcb4b77ca36a887e9a11cd9d637d5012468175829e9c6e770c61642',
  },
  4: {
    address: '0x2af9427c5a277474c079a1283c880ee8a6f0f8fbf73ce969c08d88befec1bba',
    privateKey: '0x1800000000300000180000000000030000000000003006001800006600',
  },
}

function resourceTypeToFelt(rt: ResourceType): string {
  switch (rt) {
    case 'food': return '0'
    case 'metal': return '1'
    case 'knowledge': return '2'
    default: return '0'
  }
}

export function getAccount(civId: number): Account {
  const acct = KATANA_ACCOUNTS[civId]
  if (!acct) throw new Error(`No account for civ ${civId}`)

  // Use env overrides if provided
  const address = process.env.ACCOUNT_ADDRESS || acct.address
  const privateKey = process.env.PRIVATE_KEY || acct.privateKey

  const provider = new RpcProvider({ nodeUrl: RPC_URL })
  const signer = new Signer(privateKey)
  return new Account({ provider, address, signer })
}

export async function executeAction(civId: number, action: AgentAction): Promise<string> {
  const account = getAccount(civId)
  let calldata: string[]
  let entrypoint: string

  switch (action.action) {
    case 'gather':
      entrypoint = 'gather'
      calldata = []
      break

    case 'defend':
      entrypoint = 'defend'
      calldata = []
      break

    case 'attack':
      if (action.target_civ === undefined) throw new Error('attack requires target_civ')
      entrypoint = 'attack'
      calldata = CallData.compile({ target_civ: action.target_civ })
      break

    case 'propose_trade':
      if (!action.target_civ || !action.offer_type || !action.request_type)
        throw new Error('propose_trade requires target_civ, offer/request type+amount')
      entrypoint = 'propose_trade'
      calldata = CallData.compile({
        to_civ: action.target_civ,
        offer_type: resourceTypeToFelt(action.offer_type),
        offer_amount: num.toHex(action.offer_amount || 0),
        request_type: resourceTypeToFelt(action.request_type),
        request_amount: num.toHex(action.request_amount || 0),
      })
      break

    case 'accept_trade':
      if (action.trade_id === undefined) throw new Error('accept_trade requires trade_id')
      entrypoint = 'accept_trade'
      calldata = CallData.compile({ trade_id: action.trade_id })
      break

    default:
      throw new Error(`Unknown action: ${action.action}`)
  }

  console.log(`Executing ${entrypoint} on-chain...`)

  const MAX_RETRIES = 3
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await account.execute({
        contractAddress: CONTRACT_ADDRESS,
        entrypoint,
        calldata,
      })
      console.log(`TX hash: ${result.transaction_hash}`)
      return result.transaction_hash
    } catch (err: any) {
      console.error(`TX attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`)
      if (attempt === MAX_RETRIES) throw err
      await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
  throw new Error('Unreachable')
}
