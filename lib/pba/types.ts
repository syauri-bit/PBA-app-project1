export type GameMode = "single" | "doubles" | "teamIndividual"

export type Method = "point" | "set"

export type Side = "away" | "home"

export interface TeamConfig {
  name: string
  players: string[]
}

export interface MatchConfig {
  mode: GameMode
  method: Method
  winningScore: number
  /** For set-method: number of sets needed to win the match. */
  winningSets: number
  firstBreak: Side
  /** Per-side timeout allowance (1..5). */
  timeouts: number
  referee: string
  recorder: string
  memo: string
  away: TeamConfig
  home: TeamConfig
  awayBallColor?: "white" | "yellow"
  homeBallColor?: "white" | "yellow"
}

/** An append-only action used to reconstruct the full game deterministically. */
export type GameAction =
  | { type: "point"; value: 1 | 2 }
  | { type: "endturn" }
  | { type: "timeout"; side: Side }

/** A single completed (or in-progress) turn on the record sheet. */
export interface Turn {
  side: Side
  inning: number
  playerIndex: number
  points: number
  /** Each score registered this turn, in the order it happened (e.g. [1, 1, 2]). */
  sequence: number[]
  /** Player index for each scoring attempt (same length as `sequence`). */
  playerSequence: number[]
  /** Markers interleaved with scoring: "T" for a timeout used this turn. */
  markers: string[]
  runningTotal: number
  done: boolean
}

export interface SideDerived {
  turns: Turn[]
  total: number
  innings: number
  highRun: number
  average: number
  timeoutsUsed: number
}

export interface DerivedSet {
  away: SideDerived
  home: SideDerived
  currentSide: Side
  currentInning: number
  currentPlayerIndex: number
  currentPoints: number
  currentSequence: number[]
  currentPlayerSequence: number[]
  currentMarkers: string[]
  winner: Side | null
  /** Which side had the first break for this set. */
  firstBreak: Side
  /** True when this set is a tie-break set (decided by first inning lead). */
  tieBreak: boolean
}

export interface CompletedSet {
  derived: DerivedSet
  winner: Side | null
}

export interface GameState {
  config: MatchConfig
  completedSets: GameAction[][]
  actions: GameAction[]
  finished: boolean
}

export const MODE_LABELS: Record<GameMode, string> = {
  single: "1부투어 (개인전)",
  doubles: "팀리그 (복식)",
  teamIndividual: "팀리그 (개인)",
}

/** Team league accent colors: away = red, home = blue. */
export const TEAM_COLORS: Record<Side, string> = {
  away: "#E53935",
  home: "#1E88E5",
}

export function playersPerTeam(mode: GameMode): number {
  return mode === "doubles" ? 2 : 1
}
