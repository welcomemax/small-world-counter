export function parseNonNeg(raw: string): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}
