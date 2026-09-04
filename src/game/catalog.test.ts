import { describe, expect, test } from 'vitest'
import { POWERS, RACES, formatCombo } from './catalog'

/** Names printed on the Hobby World / Days of Wonder Russian tiles. */
const TILE_RACES: Record<string, string> = {
  amazons: 'Амазонки',
  dwarves: 'Дварфы',
  elves: 'Эльфы',
  ghouls: 'Упыри',
  giants: 'Великаны',
  halflings: 'Полурослики',
  humans: 'Люди',
  orcs: 'Орки',
  ratmen: 'Крысолюды',
  skeletons: 'Скелеты',
  sorcerers: 'Колдуны',
  tritons: 'Тритоны',
  trolls: 'Тролли',
  wizards: 'Волшебники',
}

const TILE_POWERS: Record<string, string> = {
  alchemist: 'Учёные',
  berserk: 'Лютые',
  bivouacking: 'Походные',
  commando: 'Боевые',
  diplomat: 'Мирные',
  dragonMaster: 'Драконо-властные',
  flying: 'Летучие',
  forest: 'Лесные',
  fortified: 'Укрепленные',
  heroic: 'Героические',
  hill: 'Холмовые',
  merchant: 'Скаредные',
  mounted: 'Верховые',
  pillaging: 'Разбойные',
  seafaring: 'Водные',
  spirit: 'Призрачные',
  stout: 'Стойкие',
  swamp: 'Болотные',
  underworld: 'Подземные',
  wealthy: 'Богатые',
}

describe('official Russian tile names', () => {
  test('races match the printed banners', () => {
    expect(Object.fromEntries(RACES.map((r) => [r.id, r.nameRu]))).toEqual(
      TILE_RACES,
    )
  })

  test('powers match the printed badges', () => {
    expect(Object.fromEntries(POWERS.map((p) => [p.id, p.nameRu]))).toEqual(
      TILE_POWERS,
    )
  })

  test('combos read as on the table: power then race', () => {
    expect(formatCombo('trolls', 'dragonMaster')).toContain(
      'Драконо-властные Тролли',
    )
  })
})
