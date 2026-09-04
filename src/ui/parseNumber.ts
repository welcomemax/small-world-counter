/** Text fields have no spinners, so anything but digits is dropped. */
export function parseDigits(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  return digits === '' ? 0 : Number(digits)
}

export function parseNonNeg(raw: string): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}
