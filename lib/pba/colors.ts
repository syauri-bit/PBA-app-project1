export interface PaletteColor {
  key: string
  label: string
  hex: string
}

export const PALETTE: PaletteColor[] = [
  { key: "red", label: "빨강", hex: "#E53935" },
  { key: "orange", label: "주황", hex: "#FB8C00" },
  { key: "yellow", label: "노랑", hex: "#FDD835" },
  { key: "lightgreen", label: "연두", hex: "#7CB342" },
  { key: "green", label: "초록", hex: "#2E7D32" },
  { key: "sky", label: "하늘", hex: "#4FC3F7" },
  { key: "blue", label: "파랑", hex: "#1E88E5" },
  { key: "navy", label: "남색", hex: "#1A237E" },
  { key: "purple", label: "보라", hex: "#8E24AA" },
  { key: "white", label: "흰색", hex: "#FFFFFF" },
  { key: "black", label: "검은색", hex: "#212121" },
]

export interface Theme {
  bg: string
  fg: string
}

export const DEFAULT_THEME: Theme = {
  bg: "#FFFFFF",
  fg: "#212121",
}

export function findColor(hex: string): PaletteColor | undefined {
  return PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase())
}

/** Returns a translucent version of a hex color for subtle surfaces. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = Number.parseInt(clean.substring(0, 2), 16)
  const g = Number.parseInt(clean.substring(2, 4), 16)
  const b = Number.parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
