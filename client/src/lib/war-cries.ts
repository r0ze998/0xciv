const ATTACK_CRIES = [
  'FOR GLORY!', 'CHARGE!', 'NO MERCY!', 'TAKE THEM DOWN!',
  'THE WEAK SHALL PERISH!', 'DOMINION OR DEATH!', 'ATTACK!',
  'RISE AND CONQUER!', 'CRUSH THEM!', 'WAR!',
]

const DEFEND_CRIES = [
  'HOLD THE LINE!', 'STAND FIRM!', 'NOT TODAY!', 'SHIELDS UP!',
  'WE DO NOT FALL!', 'ENDURE!', 'FORTIFY!', 'PROTECT THE HOMELAND!',
]

const GATHER_CRIES = [
  'BUILD!', 'PROSPERITY!', 'HARVEST!', 'GROW STRONGER!',
  'WEALTH!', 'PREPARE!', 'STOCKPILE!',
]

const TRADE_CRIES = [
  'COMMERCE!', 'MUTUAL GAIN!', 'DEAL!', 'PARTNERSHIP!',
  'EXCHANGE!', 'DIPLOMACY!',
]

const ELIMINATION_CRIES = [
  'ANNIHILATED!', 'DESTROYED!', 'FALLEN!', 'EXTINCT!',
  'ERASED FROM HISTORY!', 'GONE!',
]

export function getWarCry(type: string): string {
  const pool = type === 'combat' ? ATTACK_CRIES
    : type === 'defend' ? DEFEND_CRIES
    : type === 'gather' ? GATHER_CRIES
    : type === 'trade' ? TRADE_CRIES
    : type === 'elimination' ? ELIMINATION_CRIES
    : ATTACK_CRIES
  return pool[Math.floor(Math.random() * pool.length)]
}
