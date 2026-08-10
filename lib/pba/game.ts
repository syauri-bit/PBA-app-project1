import type {
  DerivedSet,
  GameAction,
  MatchConfig,
  Side,
  SideDerived,
  Turn,
} from "./types"
import { playersPerTeam } from "./types"

function emptySide(): SideDerived {
  return {
    turns: [],
    total: 0,
    innings: 0,
    highRun: 0,
    average: 0,
    timeoutsUsed: 0,
  }
}

/**
 * Replays the action list for a single set and returns fully derived state.
 * The first-break side is provided explicitly so set-method matches can
 * alternate the breaker between sets while preserving the original ball
 * color assignment for the whole match.
 */
export function deriveSet(
  actions: GameAction[],
  config: MatchConfig,
  firstBreak: Side = config.firstBreak,
  tieBreak: boolean = false,
): DerivedSet {
  const ppt = playersPerTeam(config.mode)
  const scotch = config.mode === "doubles"
  const second: Side = firstBreak === "away" ? "home" : "away"

  const away = emptySide()
  const home = emptySide()
  const sideData: Record<Side, SideDerived> = { away, home }
  const turnCount: Record<Side, number> = { away: 0, home: 0 }

  let currentSide: Side = firstBreak
  let currentInning = 1
  let currentPoints = 0
  let currentSequence: number[] = []
  let currentMarkers: string[] = []
  let currentPlayerSequence: number[] = []
  let winner: Side | null = null

  // Scotch: each side tracks which player is up next. After every attempt
  // (success or failure) the pointer advances to the partner. So when a
  // player fails, the next inning for that side starts with the partner.
  const scotchNext: Record<Side, number> = { away: 0, home: 0 }
  let turnStartPlayer = 0

  const playerIndexFor = (side: Side) => {
    if (scotch) return scotchNext[side]
    return turnCount[side] % ppt
  }

  for (const action of actions) {
    if (winner) break
    if (action.type === "point") {
      const sd = sideData[currentSide]
      const playerIdx = scotch ? scotchNext[currentSide] : turnCount[currentSide] % ppt
      if (currentSequence.length === 0 && currentPlayerSequence.length === 0) {
        turnStartPlayer = playerIdx
      }
      if (tieBreak) {
        currentPoints += action.value
        currentSequence.push(action.value)
        currentPlayerSequence.push(playerIdx)
        sd.total += action.value
      } else {
        const remaining = config.winningScore - sd.total
        const add = Math.max(0, Math.min(action.value, remaining))
        if (add > 0) {
          currentPoints += add
          currentSequence.push(add)
          currentPlayerSequence.push(playerIdx)
          sd.total += add
        }
      }
      if (scotch) {
        scotchNext[currentSide] = (scotchNext[currentSide] + 1) % ppt
      }
      if (!tieBreak && sd.total >= config.winningScore) {
        commitTurn(
          sd,
          currentSide,
          currentInning,
          turnStartPlayer,
          currentPoints,
          currentSequence,
          currentPlayerSequence,
          currentMarkers,
          turnCount,
        )
        currentPoints = 0
        currentSequence = []
        currentPlayerSequence = []
        currentMarkers = []
        winner = currentSide
      }
    } else if (action.type === "timeout") {
      const sd = sideData[action.side]
      if (sd.timeoutsUsed < config.timeouts) {
        sd.timeoutsUsed += 1
        currentMarkers.push("T")
      }
    } else {
      // endturn: the failing player's partner is next for this side
      if (scotch) {
        if (currentSequence.length === 0) {
          turnStartPlayer = scotchNext[currentSide]
        }
        scotchNext[currentSide] = (scotchNext[currentSide] + 1) % ppt
      }
      const sd = sideData[currentSide]
      const startPlayer = scotch ? turnStartPlayer : turnCount[currentSide] % ppt
      commitTurn(
        sd,
        currentSide,
        currentInning,
        startPlayer,
        currentPoints,
        currentSequence,
        currentPlayerSequence,
        currentMarkers,
        turnCount,
      )
      currentPoints = 0
      currentSequence = []
      currentPlayerSequence = []
      currentMarkers = []
      if (currentSide === firstBreak) {
        currentSide = second
      } else {
        currentSide = firstBreak
        currentInning += 1
        if (tieBreak) {
          if (away.total > home.total) winner = "away"
          else if (home.total > away.total) winner = "home"
        }
      }
    }
  }

  finalizeStats(away)
  finalizeStats(home)

  return {
    away,
    home,
    currentSide,
    currentInning,
    currentPlayerIndex: winner ? 0 : playerIndexFor(currentSide),
    currentPoints,
    currentSequence,
    currentPlayerSequence,
    currentMarkers,
    winner,
    firstBreak,
    tieBreak,
  }
}

function commitTurn(
  sd: SideDerived,
  side: Side,
  inning: number,
  playerIndex: number,
  points: number,
  sequence: number[],
  playerSequence: number[],
  markers: string[],
  turnCount: Record<Side, number>,
): void {
  const turn: Turn = {
    side,
    inning,
    playerIndex,
    points,
    sequence: [...sequence],
    playerSequence: [...playerSequence],
    markers: [...markers],
    runningTotal: sd.total,
    done: true,
  }
  sd.turns.push(turn)
  sd.innings += 1
  turnCount[side] += 1
}

function finalizeStats(sd: SideDerived) {
  sd.highRun = sd.turns.reduce((max, t) => Math.max(max, t.points), 0)
  sd.average = sd.innings > 0 ? sd.total / sd.innings : 0
}

/** Build the in-progress turn (not yet committed) for display / highlight. */
export function currentTurn(derived: DerivedSet): Turn | null {
  if (derived.winner) return null
  const sd = derived[derived.currentSide]
  return {
    side: derived.currentSide,
    inning: derived.currentInning,
    playerIndex: derived.currentPlayerIndex,
    points: derived.currentPoints,
    sequence: derived.currentSequence,
    playerSequence: derived.currentPlayerSequence,
    markers: derived.currentMarkers,
    runningTotal: sd.total,
    done: false,
  }
}

export function formatAverage(avg: number): string {
  return avg.toFixed(3)
}

/**
 * Returns the first-break side for a given set index in a set-method match.
 * The breaker alternates each set, starting from the configured first break.
 */
export function firstBreakForSet(config: MatchConfig, setIndex: number): Side {
  if (setIndex % 2 === 0) return config.firstBreak
  return config.firstBreak === "away" ? "home" : "away"
}

/** Counts set wins for each side from a list of completed set action lists. */
export function countSetWins(
  completedSets: GameAction[][],
  config: MatchConfig,
): { away: number; home: number } {
  let away = 0
  let home = 0
  completedSets.forEach((actions, i) => {
    const d = deriveSet(actions, config, firstBreakForSet(config, i))
    if (d.winner === "away") away++
    else if (d.winner === "home") home++
  })
  return { away, home }
}

/**
 * Determines whether a set-method match is finished (one side reached
 * winningSets) or tied at the end of regulation and needs a tie-break.
 */
export function matchOutcome(
  completedSets: GameAction[][],
  config: MatchConfig,
): { winner: Side | null; tieBreak: boolean } {
  if (config.method === "point") {
    return { winner: null, tieBreak: false }
  }
  const wins = countSetWins(completedSets, config)
  if (wins.away >= config.winningSets) return { winner: "away", tieBreak: false }
  if (wins.home >= config.winningSets) return { winner: "home", tieBreak: false }
  if (completedSets.length >= config.winningSets * 2 - 1 && wins.away === wins.home) {
    return { winner: null, tieBreak: true }
  }
  return { winner: null, tieBreak: false }
}

/**
 * Compares high runs across all sets to determine a tie-break winner
 * for point-method matches that ended in a draw.
 */
export function compareHighRuns(
  setActions: GameAction[][],
  config: MatchConfig,
): Side | null {
  const highRuns: Record<Side, number[]> = { away: [], home: [] }
  setActions.forEach((actions, i) => {
    const d = deriveSet(actions, config, firstBreakForSet(config, i))
    highRuns.away.push(d.away.highRun)
    highRuns.home.push(d.home.highRun)
  })
  const awaySorted = [...highRuns.away].sort((a, b) => b - a)
  const homeSorted = [...highRuns.home].sort((a, b) => b - a)
  const len = Math.max(awaySorted.length, homeSorted.length)
  for (let i = 0; i < len; i++) {
    const a = awaySorted[i] ?? 0
    const h = homeSorted[i] ?? 0
    if (a > h) return "away"
    if (h > a) return "home"
  }
  return null
}
