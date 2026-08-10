"use client"

import { useCallback, useRef, useState } from "react"

/**
 * Returns handlers + a 0..1 progress value for a press-and-hold action.
 * The callback fires only after the user holds for `duration` ms, preventing
 * accidental taps on destructive controls (set / match end).
 */
export function useLongPress(callback: () => void, duration = 900) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const raf = useRef<number | null>(null)
  const start = useRef(0)
  const [progress, setProgress] = useState(0)

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    if (raf.current) cancelAnimationFrame(raf.current)
    timer.current = null
    raf.current = null
    setProgress(0)
  }, [])

  const begin = useCallback(() => {
    start.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start.current
      setProgress(Math.min(1, elapsed / duration))
      if (elapsed < duration) {
        raf.current = requestAnimationFrame(tick)
      }
    }
    raf.current = requestAnimationFrame(tick)
    timer.current = setTimeout(() => {
      callback()
      clear()
    }, duration)
  }, [callback, duration, clear])

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      begin()
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  }

  return { handlers, progress }
}
