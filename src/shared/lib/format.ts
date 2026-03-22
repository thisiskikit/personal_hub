export const formatWon = (value: string) => `₩${value}`

export const toPercent = (current: number, max: number) =>
  `${Math.min((current / max) * 100, 100).toFixed(0)}%`
