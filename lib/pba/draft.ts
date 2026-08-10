import type { GameAction, MatchConfig, Side } from "./types"

const DRAFT_KEY = "pba_active_match_draft"

export interface MatchDraft {
  config: MatchConfig
  completedSets: GameAction[][]
  actions: GameAction[]
  startedAt: number
  tieBreak: boolean
  tieBreakFirstBreak: Side | undefined
  savedAt: number
}

export function saveDraft(draft: MatchDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function loadDraft(): MatchDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MatchDraft
    if (!parsed.config || !Array.isArray(parsed.completedSets) || !Array.isArray(parsed.actions)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}
