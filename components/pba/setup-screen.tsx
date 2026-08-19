"use client"

import { useState } from "react"
import type { GameMode, MatchConfig, Side } from "@/lib/pba/types"
import { useTheme } from "@/components/pba/theme-context"

interface SetupScreenProps {
  mode: GameMode
  onStart: (config: MatchConfig) => void
  onBack: () => void
}

export function SetupScreen({ mode, onStart, onBack }: SetupScreenProps) {
  const { theme } = useTheme()

  // 경기 방식 (점수제 / 세트제)
  const [matchType, setMatchType] = useState<"points" | "sets">("sets")

  // 세트제 설정 State
  const [targetSets, setTargetSets] = useState<number>(3)
  const [setPoints, setSetPoints] = useState<number>(15)
  const [lastSetPoints, setLastSetPoints] = useState<number>(11)

  // 점수제 설정 State
  const [targetPoints, setTargetPoints] = useState<number>(15)

  // 공통 설정 State
  const [timeoutsPerPlayer, setTimeoutsPerPlayer] = useState<number>(1)
  const [firstBreak, setFirstBreak] = useState<Side>("away") // away: 선수 1, home: 선수 2
  const [awayBallColor, setAwayBallColor] = useState<"white" | "yellow">("white")

  // 선수명 State
  const [awayPlayerName, setAwayPlayerName] = useState<string>("")
  const [homePlayerName, setHomePlayerName] = useState<string>("")

  // 심판 정보 State (주심, 부심, 기록심)
  const [mainReferee, setMainReferee] = useState<string>("")
  const [assistantReferee, setAssistantReferee] = useState<string>("")
  const [recordReferee, setRecordReferee] = useState<string>("")

  // 경기원 정보 State (경기원 1, 경기원 2)
  const [official1, setOfficial1] = useState<string>("")
  const [official2, setOfficial2] = useState<string>("")

  // 기타 정보
  const [memo, setMemo] = useState<string>("")

  // 표시용 선수 이름 (미입력 시 기본값)
  const p1Name = awayPlayerName.trim() || "선수 1"
  const p2Name = homePlayerName.trim() || "선수 2"

  const handleStart = () => {
    const config = {
      mode,
      matchType,
      targetPoints: matchType === "points" ? targetPoints : setPoints,
      targetSets: matchType === "sets" ? targetSets : 1,
      setPoints,
      lastSetPoints,
      firstBreak,
      timeoutsPerPlayer,
      awayTeamName: awayPlayerName,
      homeTeamName: homePlayerName,
      awayPlayers: [awayPlayerName],
      homePlayers: [homePlayerName],
      awayBallColor,
      homeBallColor: awayBallColor === "white" ? "yellow" : "white",
      // 심판 및 경기원 정보 (추후 연결용 데이터 확장)
      refereeName: mainReferee, 
      mainReferee,
      assistantReferee,
      recordReferee,
      official1,
      official2,
      memo,
    } as unknown as MatchConfig

    onStart(config)
  }

  return (
    <div className={`w-full max-w-md mx-auto p-4 space-y-4 min-h-[85vh] flex flex-col justify-between ${theme.bg || ''} ${theme.text || ''}`}>
      <div className="space-y-4">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}
          >
            뒤로
          </button>
          <h1 className="font-bold text-base">1부투어 (개인전)</h1>
          <button
            type="button"
            onClick={handleStart}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}
          >
            경기시작
          </button>
        </div>

        {/* 1. 방식 선택 (점수제 / 세트제) */}
        <div className={`p-3.5 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
          <div className="text-xs opacity-70 mb-2 font-medium">방식</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMatchType("points")}
              className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                matchType === "points"
                  ? `${theme.inputBg || 'bg-slate-700'} text-white font-black border-slate-500`
                  : `opacity-60 ${theme.border || 'border-slate-700'}`
              }`}
            >
              점수제
            </button>
            <button
              type="button"
              onClick={() => setMatchType("sets")}
              className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                matchType === "sets"
                  ? `${theme.inputBg || 'bg-slate-700'} text-white font-black border-slate-500`
                  : `opacity-60 ${theme.border || 'border-slate-700'}`
              }`}
            >
              세트제
            </button>
          </div>
        </div>

        {/* 2. 동적 입력란 (세트제 vs 점수제) */}
        {matchType === "sets" ? (
          <div className="grid grid-cols-4 gap-2">
            <div className={`p-2 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
              <div className="text-[10px] opacity-70 mb-1 text-center font-medium">승리 세트</div>
              <input
                type="number"
                value={targetSets}
                onChange={(e) => setTargetSets(Number(e.target.value))}
                className={`w-full p-1 text-center font-bold rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
              />
            </div>
            <div className={`p-2 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
              <div className="text-[10px] opacity-70 mb-1 text-center font-medium">세트 점수</div>
              <input
                type="number"
                value={setPoints}
                onChange={(e) => setSetPoints(Number(e.target.value))}
                className={`w-full p-1 text-center font-bold rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
              />
            </div>
            <div className={`p-2 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
              <div className="text-[10px] opacity-70 mb-1 text-center font-medium">막세트 점수</div>
              <input
                type="number"
                value={lastSetPoints}
                onChange={(e) => setLastSetPoints(Number(e.target.value))}
                className={`w-full p-1 text-center font-bold rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
              />
            </div>
            <div className={`p-2 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
              <div className="text-[10px] opacity-70 mb-1 text-center font-medium">타임아웃</div>
              <input
                type="number"
                min={1}
                max={5}
                value={timeoutsPerPlayer}
                onChange={(e) => setTimeoutsPerPlayer(Number(e.target.value))}
                className={`w-full p-1 text-center font-bold rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2.5 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
              <div className="text-[11px] opacity-70 mb-1 text-center font-medium">승점</div>
              <input
                type="number"
                value={targetPoints}
                onChange={(e) => setTargetPoints(Number(e.target.value))}
                className={`w-full p-1.5 text-center font-bold rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
              />
            </div>
            <div className={`p-2.5 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
              <div className="text-[11px] opacity-70 mb-1 text-center font-medium">타임아웃</div>
              <input
                type="number"
                min={1}
                max={4}
                value={timeoutsPerPlayer}
                onChange={(e) => setTimeoutsPerPlayer(Number(e.target.value))}
                className={`w-full p-1.5 text-center font-bold rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
              />
            </div>
          </div>
        )}

        {/* 3. 초구 (선공) 및 흰공 선택 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 초구 (선공) */}
          <div className={`p-3 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
            <div className="text-xs opacity-70 mb-1.5 font-medium">초구 (선공)</div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setFirstBreak("away")}
                className={`py-1.5 rounded-md text-xs font-bold border truncate px-1 ${
                  firstBreak === "away"
                    ? `${theme.inputBg || 'bg-slate-700'} text-white border-slate-500`
                    : `opacity-50 ${theme.border || 'border-slate-700'}`
                }`}
              >
                {p1Name}
              </button>
              <button
                type="button"
                onClick={() => setFirstBreak("home")}
                className={`py-1.5 rounded-md text-xs font-bold border truncate px-1 ${
                  firstBreak === "home"
                    ? `${theme.inputBg || 'bg-slate-700'} text-white border-slate-500`
                    : `opacity-50 ${theme.border || 'border-slate-700'}`
                }`}
              >
                {p2Name}
              </button>
            </div>
          </div>

          {/* 흰공 선택 (선수 선택) */}
          <div className={`p-3 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
            <div className="text-xs opacity-70 mb-1.5 font-medium">흰공 선택</div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setAwayBallColor("white")}
                className={`py-1.5 rounded-md text-xs font-bold border truncate px-1 ${
                  awayBallColor === "white"
                    ? `${theme.inputBg || 'bg-slate-700'} text-white border-slate-500`
                    : `opacity-50 ${theme.border || 'border-slate-700'}`
                }`}
              >
                {p1Name}
              </button>
              <button
                type="button"
                onClick={() => setAwayBallColor("yellow")}
                className={`py-1.5 rounded-md text-xs font-bold border truncate px-1 ${
                  awayBallColor === "yellow"
                    ? `${theme.inputBg || 'bg-slate-700'} text-white border-slate-500`
                    : `opacity-50 ${theme.border || 'border-slate-700'}`
                }`}
              >
                {p2Name}
              </button>
            </div>
          </div>
        </div>

        {/* 4. 선수 1 / 선수 2 이름 입력 (공 색상 배지 포함) */}
        <div className="grid grid-cols-2 gap-2">
          {/* 선수 1 */}
          <div className={`p-3 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-xs">선수 1</span>
              <div className="flex items-center gap-1">
                {/* 공 색상 디자인 배지 */}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    awayBallColor === "white"
                      ? "bg-slate-100 text-slate-900 border border-slate-300"
                      : "bg-amber-400 text-slate-950 font-black"
                  }`}
                >
                  {awayBallColor === "white" ? "흰공" : "노란공"}
                </span>
                <span className="text-[10px] opacity-70 font-semibold">
                  {firstBreak === "away" ? "초구" : "상대"}
                </span>
              </div>
            </div>
            <input
              type="text"
              value={awayPlayerName}
              onChange={(e) => setAwayPlayerName(e.target.value)}
              placeholder="선수명"
              className={`w-full p-2 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
            />
          </div>

          {/* 선수 2 */}
          <div className={`p-3 rounded-xl border ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-xs">선수 2</span>
              <div className="flex items-center gap-1">
                {/* 공 색상 디자인 배지 */}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    awayBallColor === "yellow"
                      ? "bg-slate-100 text-slate-900 border border-slate-300"
                      : "bg-amber-400 text-slate-950 font-black"
                  }`}
                >
                  {awayBallColor === "yellow" ? "흰공" : "노란공"}
                </span>
                <span className="text-[10px] opacity-70 font-semibold">
                  {firstBreak === "home" ? "초구" : "상대"}
                </span>
              </div>
            </div>
            <input
              type="text"
              value={homePlayerName}
              onChange={(e) => setHomePlayerName(e.target.value)}
              placeholder="선수명"
              className={`w-full p-2 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
            />
          </div>
        </div>

        {/* 5. 심판명 (주심/부심/기록심) & 경기원명 & 메모 */}
        <div className={`p-3.5 rounded-xl border space-y-3 ${theme.cardBg || ''} ${theme.border || 'border-slate-700'}`}>
          {/* 심판명 (3분할) */}
          <div>
            <div className="text-xs opacity-70 mb-1.5 font-medium">심판 정보</div>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <div className="text-[10px] opacity-60 mb-0.5">주심</div>
                <input
                  type="text"
                  value={mainReferee}
                  onChange={(e) => setMainReferee(e.target.value)}
                  placeholder="주심명"
                  className={`w-full p-1.5 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
                />
              </div>
              <div>
                <div className="text-[10px] opacity-60 mb-0.5">부심</div>
                <input
                  type="text"
                  value={assistantReferee}
                  onChange={(e) => setAssistantReferee(e.target.value)}
                  placeholder="부심명"
                  className={`w-full p-1.5 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
                />
              </div>
              <div>
                <div className="text-[10px] opacity-60 mb-0.5">기록심</div>
                <input
                  type="text"
                  value={recordReferee}
                  onChange={(e) => setRecordReferee(e.target.value)}
                  placeholder="기록심명"
                  className={`w-full p-1.5 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
                />
              </div>
            </div>
          </div>

          {/* 경기원명 (2분할) */}
          <div>
            <div className="text-xs opacity-70 mb-1.5 font-medium">경기원 정보</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  value={official1}
                  onChange={(e) => setOfficial1(e.target.value)}
                  placeholder="경기원 1"
                  className={`w-full p-2 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={official2}
                  onChange={(e) => setOfficial2(e.target.value)}
                  placeholder="경기원 2"
                  className={`w-full p-2 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
                />
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <div className="text-xs opacity-70 mb-1 font-medium">메모</div>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className={`w-full p-2 rounded-lg border text-xs ${theme.inputBg || ''} ${theme.border || 'border-slate-700'}`}
            />
          </div>
        </div>
      </div>

      {/* 하단 푸터 */}
      <div className="text-center text-xs opacity-40 pt-4 font-sans">
        Made by Jmean
      </div>
    </div>
  )
}