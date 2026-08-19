"use client"

import { useState } from "react"
import type { GameAction, GameMode, MatchConfig, Side } from "@/lib/pba/types"
import type { MatchMeta } from "@/lib/pba/export"
import { ThemeProvider, useTheme } from "@/components/pba/theme-context"
import { MainScreen } from "@/components/pba/main-screen"
import { SetupScreen } from "@/components/pba/setup-screen"
import { ScoringScreen } from "@/components/pba/scoring-screen"
import { ResultScreen } from "@/components/pba/result-screen"
import { Footer } from "@/components/pba/footer"
import { clearDraft, loadDraft, saveDraft, type MatchDraft } from "@/lib/pba/draft"

type Screen = "main" | "setup" | "scoring" | "result"

function App() {
  const { theme } = useTheme()
  const [screen, setScreen] = useState<Screen>("main")
  const [mode, setMode] = useState<GameMode>("single")
  const [config, setConfig] = useState<MatchConfig | null>(null)
  const [result, setResult] = useState<GameAction[][]>([])
  const [meta, setMeta] = useState<MatchMeta | undefined>()
  const [editing, setEditing] = useState(false)
  const [tieBreak, setTieBreak] = useState(false)
  const [tieBreakFirstBreak, setTieBreakFirstBreak] = useState<Side | undefined>(undefined)
  const [forcedWinner, setForcedWinner] = useState<Side | null>(null)
  const [draft, setDraft] = useState<MatchDraft | null>(() => loadDraft())
  const [resumeData, setResumeData] = useState<MatchDraft | null>(null)

  const startScoring = (c: MatchConfig, d?: MatchDraft) => {
    setEditing(false)
    setConfig(c)
    setForcedWinner(null)
    if (d) {
      setResumeData(d)
      setTieBreak(d.tieBreak)
      setTieBreakFirstBreak(d.tieBreakFirstBreak)
    } else {
      setResumeData(null)
      setTieBreak(false)
      setTieBreakFirstBreak(undefined)
    }
    setScreen("scoring")
  }

  const handleResume = () => {
    if (!draft) return
    startScoring(draft.config, draft)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setDraft(null)
  }

  return (
    <div
      className="flex h-svh flex-col transition-colors"
      style={{ backgroundColor: theme.bg, color: theme.fg }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {screen === "main" && (
          <MainScreen
            draft={draft}
            onResume={handleResume}
            onDiscardDraft={handleDiscardDraft}
            onSelect={(m) => {
              setMode(m)
              setScreen("setup")
            }}
          />
        )}
        {screen === "setup" && (
          <SetupScreen
            mode={mode}
            onBack={() => setScreen("main")}
            onStart={(c) => startScoring(c)}
          />
        )}
        {screen === "scoring" && config && (
          <ScoringScreen
            config={config}
            initialSets={editing ? result : undefined}
            resumeData={resumeData}
            tieBreak={tieBreak}
            tieBreakFirstBreak={tieBreakFirstBreak}
            onDraftChange={(d) => {
              saveDraft(d)
            }}
            onClearDraft={() => {
              clearDraft()
              setDraft(null)
            }}
            onExit={() => {
              setEditing(false)
              setResumeData(null)
              setTieBreak(false)
              setTieBreakFirstBreak(undefined)
              setScreen("main")
            }}
            onFinish={(setActions, m) => {
              setEditing(false)
              setResult(setActions)
              setMeta(m)
              setTieBreak(false)
              setTieBreakFirstBreak(undefined)
              setForcedWinner(null)
              clearDraft()
              setDraft(null)
              setResumeData(null)
              setScreen("result")
            }}
          />
        )}
        {screen === "result" && config && (
          <ResultScreen
            config={config}
            setActions={result}
            meta={meta}
            forcedWinner={forcedWinner}
            onEdit={() => {
              setEditing(true)
              setTieBreak(false)
              setTieBreakFirstBreak(undefined)
              setForcedWinner(null)
              setScreen("scoring")
            }}
            onHome={() => {
              setConfig(null)
              setResult([])
              setMeta(undefined)
              setTieBreak(false)
              setTieBreakFirstBreak(undefined)
              setForcedWinner(null)
              setScreen("main")
            }}
            onTieBreak={(firstBreak) => {
              setTieBreak(true)
              setTieBreakFirstBreak(firstBreak)
              setScreen("scoring")
            }}
            onForceWinner={(side) => {
              setForcedWinner(side)
            }}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
