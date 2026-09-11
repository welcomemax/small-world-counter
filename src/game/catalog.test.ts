import { describe, expect, test } from 'vitest'
import {
  POWERS,
  RACES,
  catalogFor,
  formatCombo,
  isSkyIslandsCombo,
  raceById,
} from './catalog'

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

const SKY_ISLANDS_RACES: Record<string, string> = {
  wendigos: 'Вендтиго',
  drakons: 'Драконы',
  scavengers: 'Падальщики',
  scarecrows: 'Пугала',
  escargots: 'Улитки',
  khans: 'Ханы',
  stormGiants: 'Штормовые великаны',
}

const SKY_ISLANDS_POWERS: Record<string, string> = {
  airborne: 'Воздушные',
  racketeering: 'Вымогатели',
  zeppelined: 'Дирижабельные',
  goldsmith: 'Золотоносные',
  exploring: 'Ищущие',
  gunner: 'Стрелковые',
  haggling: 'Торговые',
}

describe('official Russian tile names', () => {
  test('base races match the printed banners', () => {
    expect(
      Object.fromEntries(
        RACES.filter((r) => r.source === 'base').map((r) => [r.id, r.nameRu]),
      ),
    ).toEqual(TILE_RACES)
  })

  test('base powers match the printed badges', () => {
    expect(
      Object.fromEntries(
        POWERS.filter((p) => p.source === 'base').map((p) => [p.id, p.nameRu]),
      ),
    ).toEqual(TILE_POWERS)
  })

  test('Sky Islands races match the printed banners', () => {
    expect(
      Object.fromEntries(
        RACES.filter((r) => r.source === 'skyIslands').map((r) => [
          r.id,
          r.nameRu,
        ]),
      ),
    ).toEqual(SKY_ISLANDS_RACES)
  })

  test('Sky Islands powers match the printed badges', () => {
    expect(
      Object.fromEntries(
        POWERS.filter((p) => p.source === 'skyIslands').map((p) => [
          p.id,
          p.nameRu,
        ]),
      ),
    ).toEqual(SKY_ISLANDS_POWERS)
  })

  test('combos read as on the table: power then race', () => {
    expect(formatCombo('trolls', 'dragonMaster')).toContain(
      'Драконо-властные Тролли',
    )
  })
})

describe('catalogFor', () => {
  test('base-only games expose 14 races and 20 powers', () => {
    const catalog = catalogFor({ skyIslands: false })
    expect(catalog.races).toHaveLength(14)
    expect(catalog.powers).toHaveLength(20)
    expect(catalog.races.every((r) => r.source === 'base')).toBe(true)
    expect(catalog.powers.every((p) => p.source === 'base')).toBe(true)
  })

  test('Sky Islands games expose 21 races and 27 powers', () => {
    const catalog = catalogFor({ skyIslands: true })
    expect(catalog.races).toHaveLength(21)
    expect(catalog.powers).toHaveLength(27)
  })

  test('missing skyIslands flag defaults to base-only', () => {
    const catalog = catalogFor({})
    expect(catalog.races).toHaveLength(14)
    expect(catalog.powers).toHaveLength(20)
  })
})

describe('Escargots scoring metadata', () => {
  test('first-active reminder includes the approved power-coin clause', () => {
    const firstActive = raceById('escargots').scoring?.find(
      (entry) => entry.when === 'firstActive',
    )
    expect(firstActive?.text).toBe(
      'Улитки: регионы в этот ход не дают монет; со следующего хода — в начале хода, не в конце. Монеты силы — по-прежнему в конце хода.',
    )
  })
})

describe('isSkyIslandsCombo', () => {
  test('detects DLC race or power', () => {
    expect(
      isSkyIslandsCombo({ race: 'khans', power: 'flying' }),
    ).toBe(true)
    expect(
      isSkyIslandsCombo({ race: 'elves', power: 'goldsmith' }),
    ).toBe(true)
    expect(
      isSkyIslandsCombo({ race: 'khans', power: 'goldsmith' }),
    ).toBe(true)
  })

  test('returns false for base-only combos', () => {
    expect(
      isSkyIslandsCombo({ race: 'elves', power: 'flying' }),
    ).toBe(false)
  })
})
