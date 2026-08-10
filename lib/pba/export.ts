import { deriveSet, firstBreakForSet, formatAverage } from "./game"
import type { DerivedSet, GameAction, MatchConfig, Side } from "./types"
import { MODE_LABELS } from "./types"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function playerName(config: MatchConfig, side: Side, idx: number): string {
  const team = side === "away" ? config.away : config.home
  return team.players[idx] ?? team.players[0]
}

function setTableHtml(config: MatchConfig, derived: DerivedSet): string {
  const lastInning = Math.max(
    derived.away.turns.reduce((m, t) => Math.max(m, t.inning), 0),
    derived.home.turns.reduce((m, t) => Math.max(m, t.inning), 0),
    1,
  )
  const rows: string[] = []
  for (let i = 1; i <= lastInning; i++) {
    const a = derived.away.turns.find((t) => t.inning === i)
    const h = derived.home.turns.find((t) => t.inning === i)
    const cell = (side: Side, t?: (typeof derived.away.turns)[number]) =>
      t
        ? `<div class="name">${esc(playerName(config, side, t.playerIndex))}${config.mode === "doubles" ? ` #${t.playerIndex + 1}` : ""}</div>
           <div class="line"><span class="pts">+${t.points}</span><span class="tot">${t.runningTotal}</span></div>
           ${t.sequence.length ? `<div class="seq">${t.sequence.map((v, i) => `<span>${config.mode === "doubles" ? `<i>${(t.playerSequence[i] ?? t.playerIndex) + 1}</i>` : ""}${v}</span>`).join("")}${t.markers.map((m) => `<span class="marker">${m === "T" ? "ⓣ" : m}</span>`).join("")}</div>` : ""}`
        : "&nbsp;"
    rows.push(
      `<tr><td class="away">${cell("away", a)}</td><td class="inn">${i}</td><td class="home">${cell("home", h)}</td></tr>`,
    )
  }
  return `<table class="sheet">
    <thead><tr><th>${esc(config.away.name)}</th><th>이닝</th><th>${esc(config.home.name)}</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>`
}

function statsHtml(config: MatchConfig, derived: DerivedSet): string {
  const line = (side: Side) => {
    const d = derived[side]
    const team = side === "away" ? config.away : config.home
    return `<div class="stat">
      <b>${esc(team.name)}</b>
      <span>총점 ${d.total}</span>
      <span>이닝 ${d.innings}</span>
      <span>AVG ${formatAverage(d.average)}</span>
      <span>HR ${d.highRun}</span>
      <span>타임아웃 ${d.timeoutsUsed}/${config.timeouts}</span>
    </div>`
  }
  return `<div class="stats">${line("away")}${line("home")}</div>`
}

function playerStatsHtml(config: MatchConfig, derived: DerivedSet): string {
  const line = (side: Side) => {
    const team = side === "away" ? config.away : config.home
    const d = derived[side]
    const byPlayer = team.players.map((name, idx) => {
      const pts = d.turns
        .filter((t) => t.playerIndex === idx)
        .reduce((sum, t) => sum + t.points, 0)
      return `<span>${esc(name)}: ${pts}점</span>`
    })
    return `<div class="pstat"><b>${esc(team.name)}</b>${byPlayer.join("")}</div>`
  }
  return `<div class="pstats">${line("away")}${line("home")}</div>`
}

export interface MatchMeta {
  startedAt: number
  endedAt: number
}

/** Builds a standalone HTML document string for the full match record. */
export function buildMatchHtml(
  config: MatchConfig,
  setActions: GameAction[][],
  meta?: MatchMeta,
): string {
  const derivedSets = setActions.map((a, i) =>
    deriveSet(a, config, firstBreakForSet(config, i)),
  )
  const setsHtml = derivedSets
    .map((d, i) => {
      const heading =
        setActions.length > 1
          ? `<h3>${i + 1}세트${d.winner ? ` · 승자 ${esc(d.winner === "away" ? config.away.name : config.home.name)}` : ""}</h3>`
          : ""
      return `<section class="setblock">${heading}${statsHtml(config, d)}${setTableHtml(config, d)}${playerStatsHtml(config, d)}</section>`
    })
    .join("")

  const now = new Date().toLocaleString("ko-KR")
  const duration =
    meta && meta.endedAt > meta.startedAt
      ? formatDuration(meta.endedAt - meta.startedAt)
      : ""

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PBA 경기 기록지</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #212121; background: #fff; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
  .meta span { margin-right: 12px; }
  .setblock { margin-bottom: 28px; }
  h3 { font-size: 16px; margin: 0 0 8px; }
  .stats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
  .stat { border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 13px; }
  .stat b { display: block; margin-bottom: 4px; }
  .stat span { margin-right: 10px; }
  .pstats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
  .pstat { border: 1px solid #eee; border-radius: 8px; padding: 8px 12px; font-size: 12px; }
  .pstat b { display: block; margin-bottom: 4px; }
  .pstat span { margin-right: 10px; }
  table.sheet { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.sheet th, table.sheet td { border: 1px solid #e0e0e0; padding: 6px 8px; vertical-align: top; }
  table.sheet th { background: #f5f5f5; }
  .inn { width: 44px; text-align: center; color: #888; font-weight: 700; }
  .name { font-size: 11px; color: #666; }
  .line { display: flex; justify-content: space-between; }
  .pts { font-weight: 800; font-size: 16px; }
  .tot { font-weight: 700; }
  .seq { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
  .seq span { border: 1px solid #ccc; border-radius: 3px; padding: 1px 4px; font-size: 11px; font-weight: 700; min-width: 16px; text-align: center; }
  .seq .marker { border-color: #E53935; color: #E53935; }
  footer { margin-top: 24px; text-align: center; color: #999; font-size: 12px; }
</style></head>
<body>
  <h1>PBA 경기 기록지</h1>
  <div class="meta">
    <span>${esc(MODE_LABELS[config.mode])}</span>
    <span>${config.method === "point" ? "점수제" : "세트제"}</span>
    <span>승리점수 ${config.winningScore}</span>
    ${config.method === "set" ? `<span>승리세트 ${config.winningSets}</span>` : ""}
    <span>초구 ${esc(config.firstBreak === "away" ? config.away.name : config.home.name)}</span>
    <span>타임아웃 ${config.timeouts}회</span>
    ${duration ? `<span>소요시간 ${esc(duration)}</span>` : ""}
    <br/>
    ${config.referee ? `<span>심판 ${esc(config.referee)}</span>` : ""}
    ${config.recorder ? `<span>기록원 ${esc(config.recorder)}</span>` : ""}
    <span>출력 ${esc(now)}</span>
    ${config.memo ? `<br/><span>메모: ${esc(config.memo)}</span>` : ""}
  </div>
  ${setsHtml}
  <footer>Made by Jmean</footer>
</body></html>`
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}시간`)
  parts.push(`${m}분`)
  parts.push(`${s}초`)
  return parts.join(" ")
}

/** Triggers a browser download of the match record as an .html file. */
export function downloadMatchHtml(
  config: MatchConfig,
  setActions: GameAction[][],
  meta?: MatchMeta,
) {
  const html = buildMatchHtml(config, setActions, meta)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")
  a.href = url
  a.download = `PBA_기록지_${stamp}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
