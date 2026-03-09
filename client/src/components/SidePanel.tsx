import { ActionBar } from './ActionBar'
import { ResourcePanel } from './ResourcePanel'
import { TerritoryChart } from './TerritoryChart'
import { MiniMap } from './MiniMap'
import { ActivityFeed } from './ActivityFeed'
import { PowerRanking } from './PowerRanking'
import { DiplomacyPanel } from './DiplomacyPanel'
import { TurnTimeline } from './TurnTimeline'
import type { TurnSnapshot } from './TurnTimeline'
import { ReplayControls } from './ReplayControls'
import { TurnLog } from './TurnLog'
import type { Civilization, Territory, LogEntry } from '../types/game'

interface Props {
  civs: Civilization[]
  grid: Territory[][]
  logs: LogEntry[]
  turn: number
  selectedCiv: number
  dataSource: 'loading' | 'torii' | 'mock'
  walletConnected: boolean
  history: TurnSnapshot[]
  // replay
  winner: Civilization | null
  isReplaying: boolean
  replayIndex: number | null
  totalFrames: number
  onStartReplay: () => void
  onStopReplay: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (i: number) => void
  // callbacks
  onLog: (msg: string, type: 'action' | 'combat' | 'elimination' | 'trade' | 'system') => void
}

export function SidePanel({
  civs, grid, logs, turn, selectedCiv, dataSource,
  walletConnected, history, winner, isReplaying,
  replayIndex, totalFrames, onStartReplay, onStopReplay,
  onNext, onPrev, onSeek, onLog,
}: Props) {
  return (
    <div className="lg:w-1/2 space-y-4">
      <ActionBar connected={walletConnected} civs={civs} selectedCiv={selectedCiv}
        dataSource={dataSource} onLog={onLog} />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {civs.map(c => <ResourcePanel key={c.id} civ={c} />)}
      </div>
      <TerritoryChart grid={grid} civs={civs} />
      <div className="grid grid-cols-2 gap-2">
        <MiniMap grid={grid} civs={civs} />
        <ActivityFeed logs={logs} />
      </div>
      <PowerRanking civs={civs} />
      <DiplomacyPanel civs={civs} />
      <TurnTimeline history={history} civs={civs} currentTurn={turn} />
      {(winner || isReplaying) && (
        <ReplayControls isReplaying={isReplaying} replayIndex={replayIndex}
          totalFrames={totalFrames} onStart={onStartReplay} onStop={onStopReplay}
          onNext={onNext} onPrev={onPrev} onSeek={onSeek} />
      )}
      <div>
        <h3 className="text-gray-500 text-sm mb-2 font-bold">TURN LOG</h3>
        <TurnLog logs={logs} />
      </div>
    </div>
  )
}
