"use client"

import { useEffect, useRef, useState } from "react"
import type { DerivedSet, MatchConfig, Side, Turn } from "@/lib/pba/types"
import { withAlpha } from "@/lib/pba/colors"
import { useTheme } from "./theme-context"

interface ScoreboardProps {
  config: MatchConfig
  derived: DerivedSet
  current: Turn | null
  onTimeout?: (side: Side) => void
  onSaveConfig?: (targetPoints: number, matchType: "points" | "sets") => void
}

function playerName(config: MatchConfig, side: Side, playerIndex: number): string {
  const team = side === "away" ? config.away : config.home
  return team.players[playerIndex] ?? team.players[0]
}

function playerShortName(config: MatchConfig, side: Side, playerIndex: number): string {
  const name = playerName(config, side, playerIndex)
  return name.length <= 2 ? name : name.slice(0, 2)
}

function TurnCell({
  config,
  side,
  turn,
  isCurrent,
  fg,
  accent,
}: {
  config: MatchConfig
  side: Side
  turn: Turn | null
  isCurrent: boolean
  fg: string
  accent: string
}) {
  const isDoubles = config.mode === "teamleague"
  if (!turn) {
    return <div className="min-h-[3.5rem] rounded-md border border-dashed opacity-30" style={{ borderColor: fg }} />
  }
  const highlight = isCurrent ? accent : fg
  return (
    <div
      className="min-h-[3.5rem] rounded-md px-2.5 py-2 transition-all"
      style={
        isCurrent
          ? {
              border: `2px solid ${highlight}`,
              backgroundColor: withAlpha(highlight, 0.12),
              fontWeight: 700,
            }
          : { border: `1px solid ${withAlpha(fg, 0.2)}` }
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-xs font-semibold opacity-80">
          {isDoubles
            ? `${playerShortName(config, side, turn.playerIndex)}#${turn.playerIndex + 1}`
            : playerName(config, side, turn.playerIndex)}
        </span>
        <span className="shrink-0 tabular-nums text-right text-[10px] opacity-50">
          총득점 {turn.runningTotal}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="tabular-nums text-2xl font-black leading-none">+{turn.points}</span>
        <span className="tabular-nums text-lg font-bold leading-none">{turn.runningTotal}</span>
      </div>
      {(turn.sequence.length > 0 || turn.markers.length > 0) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1" aria-label="이닝 득점 순서">
          {turn.sequence.map((v, i) => {
            const pIdx = turn.playerSequence[i] ?? turn.playerIndex
            return (
              <span
                key={`s${i}`}
                className="inline-flex min-w-[2rem] items-center justify-center rounded tabular-nums text-[11px] font-bold leading-none"
                style={{
                  border: `1px solid ${withAlpha(fg, 0.35)}`,
                  padding: "2px 4px",
                }}
              >
                {isDoubles && (
                  <span className="mr-0.5 opacity-70">{pIdx + 1}</span>
                )}
                {v}
              </span>
            )
          })}
          {turn.markers.map((m, i) => (
            <span
              key={`m${i}`}
              className="inline-flex items-center justify-center rounded text-[11px] font-bold leading-none"
              style={{
                border: `1px solid ${accent}`,
                color: accent,
                padding: "2px 4px",
              }}
              title="타임아웃"
            >
              {m === "T" ? "ⓣ" : m}
            </span>
          ))}
        </div>
      )}
      {turn.done && (
        <div className="mt-1 select-none text-center font-mono text-[10px] tracking-widest opacity-30">
          --------
        </div>
      )}
    </div>
  )
}

export function Scoreboard({ config, derived, current, onTimeout, onSaveConfig }: ScoreboardProps) {
  const { theme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [matchType, setMatchType] = useState<"points" | "sets">("points")
  const [targetPoints, setTargetPoints] = useState<number>(config.targetPoints || 15)

  const lastTurnInning = Math.max(
    derived.away.turns.reduce((m, t) => Math.max(m, t.inning), 0),
    derived.home.turns.reduce((m, t) => Math.max(m, t.inning), 0),
  )
  const maxInning = Math.max(derived.currentInning, lastTurnInning, 1)

  const getTurn = (side: Side, inning: number): Turn | null => {
    if (current && current.side === side && current.inning === inning) return current
    const found = derived[side].turns.find((t) => t.inning === inning)
    return found ?? null
  }

  const isCurrentCell = (side: Side, inning: number) =>
    !!current && current.side === side && current.inning === inning

  const innings = Array.from({ length: maxInning }, (_, i) => i + 1)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [maxInning, current?.side, current?.inning, derived.currentPoints])

  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig(targetPoints, matchType)
    }
  }

  return (
    <div ref={scrollRef} className="mx-auto w-full max-w-3xl space-y-4">
      {/* 1. 최상단 헤더 (방식 선택, 승리 점수, 저장 버튼) */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded font-bold">
            [메인]
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMatchType("points")}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                matchType === "points" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              점수제
            </button>
            <span className="text-slate-600">·</span>
            <button
              type="button"
              onClick={() => setMatchType("sets")}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                matchType === "sets" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              세트제
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">승리</span>
          <input
            type="number"
            value={targetPoints}
            onChange={(e) => setTargetPoints(Number(e.target.value))}
            className="w-12 bg-slate-800 border border-slate-700 text-center rounded text-sm font-bold text-white focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-400">점</span>
          <button
            type="button"
            onClick={handleSave}
            className="ml-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded border border-slate-700 transition-colors font-semibold"
          >
            [저장]
          </button>
        </div>
      </div>

      {/* 2. PBA 스타일 3단 메인 스코어보드 */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl text-slate-100 shadow-xl border border-slate-800">
        
        {/* 선공/레드 (홈) */}
        <div className="border-2 border-red-500/80 rounded-2xl p-3 bg-slate-900/90 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="font-bold text-lg text-red-400 truncate">
                {config.home.name || "선수 1"}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => onTimeout?.("home")}
              className="w-6 h-6 rounded-md bg-red-600 text-white font-bold text-xs flex items-center justify-center hover:bg-red-500 transition-colors shrink-0 shadow"
            >
              T
            </button>
          </div>

          <div className="text-center my-1 text-6xl font-black tracking-tight text-white">
            {derived.homeStats.points ?? 0}
          </div>

          <div className="flex justify-around items-center text-xs font-medium text-slate-400 border-t border-slate-800 pt-2">
            <span>{derived.homeStats.avg || "0.000"} <span className="text-[10px] text-slate-500">AVG</span></span>
            <span className="text-slate-700">/</span>
            <span>{derived.homeStats.highRun || 0} <span className="text-[10px] text-slate-500">HR</span></span>
          </div>
        </div>

        {/* 중앙 MATCH TIME & 이닝 */}
        <div className="bg-slate-900 rounded-2xl p-3 flex flex-col justify-between text-center border border-slate-800">
          <div>
            <div className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">MATCH TIME</div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
              00:00:00
            </div>
          </div>

          <div className="w-14 h-14 bg-white text-slate-950 rounded-full mx-auto flex items-center justify-center text-2xl font-black shadow-md border-2 border-slate-200">
            {derived.currentPoints || 0}
          </div>

          <div className="bg-slate-800/90 text-slate-200 rounded-lg py-1.5 font-bold text-sm border border-slate-700/50">
            {current?.inning || 1}이닝
          </div>
        </div>

        {/* 후공/옐로우 (어웨이) */}
        <div className="border-2 border-amber-500/80 rounded-2xl p-3 bg-slate-900/90 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-bold text-lg text-amber-400 truncate">
                {config.away.name || "선수 2"}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => onTimeout?.("away")}
              className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold text-xs flex items-center justify-center hover:bg-amber-500 transition-colors shrink-0 shadow"
            >
              T
            </button>
          </div>

          <div className="text-center my-1 text-6xl font-black tracking-tight text-white">
            {derived.awayStats.points ?? 0}
          </div>

          <div className="flex justify-around items-center text-xs font-medium text-slate-400 border-t border-slate-800 pt-2">
            <span>{derived.awayStats.avg || "0.000"} <span className="text-[10px] text-slate-500">AVG</span></span>
            <span className="text-slate-700">/</span>
            <span>{derived.awayStats.highRun || 0} <span className="text-[10px] text-slate-500">HR</span></span>
          </div>
        </div>

      </div>

      {/* 3. 하단 이닝별 득점 상세 히스토리 (기존 기능 복원) */}
      <div className="space-y-2 pt-2">
        {innings.map((inn) => (
          <div key={inn} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TurnCell
              config={config}
              side="home"
              turn={getTurn("home", inn)}
              isCurrent={isCurrentCell("home", inn)}
              fg={theme.fg}
              accent={theme.accent}
            />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: withAlpha(theme.fg, 0.1),
                color: theme.fg,
              }}
            >
              {inn}
            </div>
            <TurnCell
              config={config}
              side="away"
              turn={getTurn("away", inn)}
              isCurrent={isCurrentCell("away", inn)}
              fg={theme.fg}
              accent={theme.accent}
            />
          </div>
        ))}
      </div>
    </div>
  )
}