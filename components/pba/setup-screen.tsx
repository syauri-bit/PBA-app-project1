"use client"

import { useState } from "react"
import { ChevronLeft, Play } from "lucide-react"
import type { GameMode, MatchConfig, Method, Side } from "@/lib/pba/types"
import { MODE_LABELS, playersPerTeam } from "@/lib/pba/types"
import { useTheme } from "./theme-context"

interface SetupScreenProps {
  mode: GameMode
  onBack: () => void
  onStart: (config: MatchConfig) => void
}

function BallIcon({ color, ring }: { color: string; ring?: boolean }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full align-middle"
      style={{
        backgroundColor: color,
        border: ring ? "2px solid currentColor" : "1px solid rgba(0,0,0,0.25)",
      }}
      aria-hidden
    />
  )
}

export function SetupScreen({ mode, onBack, onStart }: SetupScreenProps) {
  const { theme } = useTheme()
  const ppt = playersPerTeam(mode)

  const [method, setMethod] = useState<Method>("point")
  const [winningScore, setWinningScore] = useState("15")
  const [winningSets, setWinningSets] = useState("3")
  const [firstBreak, setFirstBreak] = useState<Side>("away")
  const [timeouts, setTimeouts] = useState("3")
  const [referee, setReferee] = useState("")
  const [recorder, setRecorder] = useState("")
  const [memo, setMemo] = useState("")
  const [awayName, setAwayName] = useState("어웨이팀")
  const [homeName, setHomeName] = useState("홈팀")
  const [awayPlayers, setAwayPlayers] = useState<string[]>(["", ""])
  const [homePlayers, setHomePlayers] = useState<string[]>(["", ""])

  const inputStyle = {
    backgroundColor: "transparent",
    borderColor: "currentColor",
    color: theme.fg,
  }

  const start = () => {
    const score = Math.max(1, Number.parseInt(winningScore, 10) || 1)
    const sets = Math.max(1, Number.parseInt(winningSets, 10) || 1)
    const to = Math.min(5, Math.max(1, Number.parseInt(timeouts, 10) || 1))
    const config: MatchConfig = {
      mode,
      method,
      winningScore: score,
      winningSets: sets,
      firstBreak,
      timeouts: to,
      referee: referee.trim(),
      recorder: recorder.trim(),
      memo: memo.trim(),
      away: {
        name: awayName.trim() || "어웨이팀",
        players: awayPlayers.slice(0, ppt).map((p, i) => p.trim() || `선수${i + 1}`),
      },
      home: {
        name: homeName.trim() || "홈팀",
        players: homePlayers.slice(0, ppt).map((p, i) => p.trim() || `선수${i + 1}`),
      },
    }
    onStart(config)
  }

  const TeamColumn = ({
    side,
    name,
    setName,
    players,
    setPlayers,
  }: {
    side: Side
    name: string
    setName: (v: string) => void
    players: string[]
    setPlayers: (v: string[]) => void
  }) => {
    const isFirst = firstBreak === side
    return (
      <div
        className="flex flex-col gap-2 rounded-xl border p-3"
        style={{ borderColor: "currentColor" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase opacity-60">
            {side === "away" ? "어웨이 (왼쪽)" : "홈 (오른쪽)"}
          </span>
          {isFirst && (
            <span className="flex items-center gap-1 text-[11px] font-semibold">
              초구 <BallIcon color="#FFFFFF" ring />
            </span>
          )}
          {!isFirst && (
            <span className="flex items-center gap-1 text-[11px] font-semibold opacity-70">
              상대 <BallIcon color="#FDD835" />
            </span>
          )}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="팀명"
          className="w-full rounded-md border px-2 py-1.5 text-sm font-semibold outline-none"
          style={inputStyle}
        />
        {Array.from({ length: ppt }).map((_, i) => (
          <input
            key={i}
            value={players[i] ?? ""}
            onChange={(e) => {
              const next = [...players]
              next[i] = e.target.value
              setPlayers(next)
            }}
            placeholder={ppt > 1 ? `선수 ${i + 1}` : "선수명"}
            className="w-full rounded-md border px-2 py-1.5 text-sm outline-none"
            style={inputStyle}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 shadow-sm"
        style={{ backgroundColor: theme.bg }}
      >
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" />
          뒤로
        </button>
        <span className="truncate text-sm font-bold opacity-80">{MODE_LABELS[mode]}</span>
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold shadow-md active:scale-95"
          style={{ backgroundColor: theme.fg, color: theme.bg }}
        >
          <Play className="h-4 w-4" />
          경기시작
        </button>
      </header>

      <main className="flex-1 px-4 py-3">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {/* Method + winning score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">방식</label>
              <div className="flex overflow-hidden rounded-md border" style={{ borderColor: "currentColor" }}>
                {(["point", "set"] as Method[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className="flex-1 px-2 py-1.5 text-sm font-semibold"
                    style={
                      method === m
                        ? { backgroundColor: theme.fg, color: theme.bg }
                        : { backgroundColor: "transparent" }
                    }
                  >
                    {m === "point" ? "점수제" : "세트제"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">승리 점수</label>
              <input
                inputMode="numeric"
                value={winningScore}
                onChange={(e) => setWinningScore(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full rounded-md border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {method === "set" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold opacity-60">승리 세트 수</label>
                <input
                  inputMode="numeric"
                  value={winningSets}
                  onChange={(e) => setWinningSets(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full rounded-md border px-2 py-1.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* First break + timeouts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">초구 (선공)</label>
              <div className="flex overflow-hidden rounded-md border" style={{ borderColor: "currentColor" }}>
                {(["away", "home"] as Side[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFirstBreak(s)}
                    className="flex-1 px-2 py-1.5 text-sm font-semibold"
                    style={
                      firstBreak === s
                        ? { backgroundColor: theme.fg, color: theme.bg }
                        : { backgroundColor: "transparent" }
                    }
                  >
                    {s === "away" ? "어웨이" : "홈"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">타임아웃 (1~5)</label>
              <input
                inputMode="numeric"
                value={timeouts}
                onChange={(e) => setTimeouts(e.target.value.replace(/[^0-9]/g, "").slice(0, 1))}
                className="w-full rounded-md border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Away / Home two columns */}
          <div className="grid grid-cols-2 gap-3">
            <TeamColumn
              side="away"
              name={awayName}
              setName={setAwayName}
              players={awayPlayers}
              setPlayers={setAwayPlayers}
            />
            <TeamColumn
              side="home"
              name={homeName}
              setName={setHomeName}
              players={homePlayers}
              setPlayers={setHomePlayers}
            />
          </div>

          {/* Officials + memo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">심판명</label>
              <input
                value={referee}
                onChange={(e) => setReferee(e.target.value)}
                className="w-full rounded-md border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">기록원명</label>
              <input
                value={recorder}
                onChange={(e) => setRecorder(e.target.value)}
                className="w-full rounded-md border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold opacity-60">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border px-2 py-1.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
