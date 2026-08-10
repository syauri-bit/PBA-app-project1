"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { DEFAULT_THEME, type Theme } from "@/lib/pba/colors"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  logo: string | null
  setLogo: (logo: string | null) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [logo, setLogo] = useState<string | null>(null)
  return (
    <ThemeContext.Provider value={{ theme, setTheme, logo, setLogo }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
