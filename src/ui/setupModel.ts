import type { ComboMarket } from '../game/market'

function normalizedName(name: string): string {
  return name.trim().toLocaleLowerCase('ru')
}

export function setupIssue(names: string[], market: ComboMarket): string | null {
  const normalized = names.map(normalizedName)
  if (normalized.some((name) => !name)) return 'Введите имена всех игроков'
  if (new Set(normalized).size !== normalized.length) {
    return 'Имена игроков не должны повторяться'
  }

  const combos = market.slots.map((slot) => slot.combo)
  if (combos.some((combo) => !combo)) return 'Заполните все шесть связок'

  const races = combos.map((combo) => combo!.race)
  const powers = combos.map((combo) => combo!.power)
  if (
    new Set(races).size !== races.length ||
    new Set(powers).size !== powers.length
  ) {
    return 'Расы и силы в колонке не должны повторяться'
  }
  return null
}
