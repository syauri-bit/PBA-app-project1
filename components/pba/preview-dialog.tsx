"use client"

import { useMemo } from "react"
import { Download, X } from "lucide-react"
import type { GameAction, MatchConfig } from "@/lib/pba/types"
import { buildMatchHtml, downloadMatchHtml, type MatchMeta } from "@/lib/pba/export"
import { useTheme } from "./theme-context"

interface PreviewDialogProps {
  config: MatchConfig
  setActions: GameAction[][]
  meta?: MatchMeta
  onClose: () => void
}

export function PreviewDialog({ config, setActions, meta, onClose }: PreviewDialogProps) {
  const { theme } = useTheme()
  const html = useMemo(
    () => buildMatchHtml(config, setActions, meta),
    [config, setActions, meta],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
      role="dialog"
      aria-modal="true"
      aria-label="기록지 미리보기"
    >
      <div
        className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: theme.bg, color: theme.fg }}
      >
        <header className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "currentColor" }}>
          <h2 className="text-base font-bold">기록지 미리보기</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadMatchHtml(config, setActions, meta)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold"
              style={{ borderColor: "currentColor" }}
            >
              <Download className="h-4 w-4" />
              다운로드
            </button>
            <button type="button" onClick={onClose} aria-label="닫기" className="opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
        <iframe
          title="기록지 미리보기"
          srcDoc={html}
          className="flex-1 border-0 bg-white"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  )
}
