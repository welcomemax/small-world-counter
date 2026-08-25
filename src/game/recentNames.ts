const KEY = 'small-world-counter.recent-names.v1'
const MAX_NAMES = 12

export const FUNNY_NAMES = [
  'Остроух',
  'Повелитель кубиков',
  'Гном на минималках',
  'Главный тролль',
  'Барон упадка',
  'Захватчик болот',
] as const

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase('ru')
}

function uniqueNewest(names: string[]): string[] {
  const result: string[] = []
  for (const raw of names) {
    const name = raw.trim()
    if (!name) continue
    const key = normalized(name)
    const previous = result.findIndex((entry) => normalized(entry) === key)
    if (previous >= 0) result.splice(previous, 1)
    result.unshift(name)
  }
  return result.slice(0, MAX_NAMES)
}

export function loadRecentNames(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value)
      ? uniqueNewest(value.filter((entry): entry is string => typeof entry === 'string').reverse())
      : []
  } catch {
    return []
  }
}

export function saveRecentNames(names: string[]): void {
  try {
    const recent = loadRecentNames()
    localStorage.setItem(KEY, JSON.stringify(uniqueNewest([...recent.reverse(), ...names])))
  } catch {
    // Storage can be unavailable in private browsing; setup must still work.
  }
}

export function nameSuggestions(
  recent: string[],
  selected: string[],
  currentIndex: number,
): string[] {
  const source = recent.length > 0 ? recent : [...FUNNY_NAMES]
  const blocked = new Set(
    selected
      .filter((_, index) => index !== currentIndex)
      .map(normalized)
      .filter(Boolean),
  )
  return source.filter((name) => !blocked.has(normalized(name)))
}
