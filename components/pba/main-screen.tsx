"use client"

import { useState } from "react"
import { Settings, User, Users, UserSquare2, RotateCcw, Sparkles } from "lucide-react"
import type { GameMode } from "@/lib/pba/types"
import { MODE_LABELS } from "@/lib/pba/types"
import type { MatchDraft } from "@/lib/pba/draft"
import { useTheme } from "./theme-context"
import { OptionDialog } from "./option-dialog"

const MODE_META: { mode: GameMode; icon: typeof User; desc: string }[] = [
  { mode: "single", icon: User},
  { mode: "doubles", icon: Users},
]

interface MainScreenProps {
  onSelect: (mode: GameMode) => void
  draft: MatchDraft | null
  onResume: () => void
  onDiscardDraft: () => void
}

export function MainScreen({ onSelect, draft, onResume, onDiscardDraft }: MainScreenProps) {
  const { theme, logo } = useTheme()
  const [showOptions, setShowOptions] = useState(false)

  const draftSummary = draft
    ? `${draft.config.away.name} vs ${draft.config.home.name} · ${draft.completedSets.length + 1}세트 진행 중`
    : ""

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-5 pt-5">
        <span className="text-sm font-semibold opacity-70">PBA</span>
        <button
          type="button"
          onClick={() => setShowOptions(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm"
          style={{ borderColor: "currentColor" }}
        >
          <Settings className="h-4 w-4" />
          옵션
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        {logo && (
          <img
            src={logo}
            alt="로고"
            className="mb-4 max-h-24 max-w-[60%] object-contain"
          />
        )}
        <h1 className="mb-1 text-3xl font-black tracking-tight text-balance">PBA 경기 기록지</h1>
        <p className="mb-8 text-sm opacity-70">경기 모드를 선택하세요</p>

        {draft && (
          <div
            className="mb-5 flex w-full max-w-md flex-col gap-2 rounded-2xl border-2 p-4"
            style={{ borderColor: theme.fg, backgroundColor: theme.fg, color: theme.bg }}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <RotateCcw className="h-4 w-4" />
              진행 중인 경기가 있습니다
            </div>
            <p className="text-xs opacity-80">{draftSummary}</p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={onResume}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-sm font-bold shadow-md active:translate-y-px"
                style={{ borderColor: theme.bg, backgroundColor: theme.bg, color: theme.fg }}
              >
                <Sparkles className="h-4 w-4" />
                이어서 진행
              </button>
              <button
                type="button"
                onClick={onDiscardDraft}
                className="flex-1 rounded-xl border-2 py-2.5 text-sm font-bold opacity-80 active:translate-y-px"
                style={{ borderColor: theme.bg, color: theme.bg }}
              >
                새 경기 시작
              </button>
            </div>
          </div>
        )}

        <div className="flex w-full max-w-md flex-col gap-3">
          {MODE_META.map(({ mode, icon: Icon, desc }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSelect(mode)}
              className="flex items-center gap-4 rounded-2xl border px-5 py-4 text-left shadow-sm transition-transform active:scale-[0.98]"
              style={{
                borderColor: "currentColor",
                backgroundColor: theme.fg,
                color: theme.bg,
              }}
            >
              <Icon className="h-7 w-7 shrink-0" />
              <span className="flex flex-col">
                <span className="text-lg font-bold leading-tight">{MODE_LABELS[mode]}</span>
                <span className="text-xs opacity-80">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </main>

      {showOptions && <OptionDialog onClose={() => setShowOptions(false)} />}
    </div>
  )
}
