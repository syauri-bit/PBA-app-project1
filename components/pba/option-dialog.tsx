"use client"

import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { PALETTE, type Theme } from "@/lib/pba/colors"
import { useTheme } from "./theme-context"

function Swatch({
  hex,
  label,
  selected,
  onClick,
}: {
  hex: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1"
      aria-pressed={selected}
      aria-label={label}
    >
      <span
        className="block h-10 w-10 rounded-full border transition-transform"
        style={{
          backgroundColor: hex,
          borderColor: selected ? "currentColor" : "rgba(0,0,0,0.2)",
          boxShadow: selected ? "0 0 0 3px currentColor" : "none",
          transform: selected ? "scale(1.08)" : "scale(1)",
        }}
      />
      <span className="text-[11px] leading-none">{label}</span>
    </button>
  )
}

export function OptionDialog({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, logo, setLogo } = useTheme()
  const [draft, setDraft] = useState<Theme>(theme)
  const [draftLogo, setDraftLogo] = useState<string | null>(logo)
  const fileRef = useRef<HTMLInputElement>(null)

  const apply = () => {
    setTheme(draft)
    setLogo(draftLogo)
    onClose()
  }

  const onFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => setDraftLogo(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="옵션"
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl"
        style={{ backgroundColor: draft.bg, color: draft.fg }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">옵션 · 테마 설정</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mb-5">
          <p className="mb-2 text-sm font-semibold">배경색</p>
          <div className="grid grid-cols-6 gap-2">
            {PALETTE.map((c) => (
              <Swatch
                key={c.key}
                hex={c.hex}
                label={c.label}
                selected={draft.bg.toLowerCase() === c.hex.toLowerCase()}
                onClick={() => setDraft((d) => ({ ...d, bg: c.hex }))}
              />
            ))}
          </div>
        </section>

        <section className="mb-5">
          <p className="mb-2 text-sm font-semibold">폰트색</p>
          <div className="grid grid-cols-6 gap-2">
            {PALETTE.map((c) => (
              <Swatch
                key={c.key}
                hex={c.hex}
                label={c.label}
                selected={draft.fg.toLowerCase() === c.hex.toLowerCase()}
                onClick={() => setDraft((d) => ({ ...d, fg: c.hex }))}
              />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <p className="mb-2 text-sm font-semibold">로고 이미지</p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
              style={{ borderColor: "currentColor" }}
            >
              {draftLogo ? (
                <img src={draftLogo} alt="로고 미리보기" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] opacity-50">없음</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold"
                style={{ borderColor: "currentColor" }}
              >
                <Upload className="h-4 w-4" />
                업로드
              </button>
              {draftLogo && (
                <button
                  type="button"
                  onClick={() => setDraftLogo(null)}
                  className="text-xs font-semibold opacity-70"
                >
                  제거
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onFile(f)
                e.target.value = ""
              }}
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <div
            className="flex-1 rounded-lg border px-3 py-2 text-center text-sm"
            style={{ borderColor: "currentColor" }}
          >
            미리보기
          </div>
          <button
            type="button"
            onClick={apply}
            className="rounded-lg px-6 py-2 text-sm font-bold shadow-md"
            style={{ backgroundColor: draft.fg, color: draft.bg }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  )
}
