export const RACE_IDS = [
  'amazons',
  'dwarves',
  'elves',
  'ghouls',
  'giants',
  'halflings',
  'humans',
  'orcs',
  'ratmen',
  'skeletons',
  'sorcerers',
  'tritons',
  'trolls',
  'wizards',
  'wendigos',
  'drakons',
  'scavengers',
  'scarecrows',
  'escargots',
  'khans',
  'stormGiants',
] as const

export const POWER_IDS = [
  'alchemist',
  'berserk',
  'bivouacking',
  'commando',
  'diplomat',
  'dragonMaster',
  'flying',
  'forest',
  'fortified',
  'heroic',
  'hill',
  'merchant',
  'mounted',
  'pillaging',
  'seafaring',
  'spirit',
  'stout',
  'swamp',
  'underworld',
  'wealthy',
  'airborne',
  'racketeering',
  'zeppelined',
  'goldsmith',
  'exploring',
  'gunner',
  'haggling',
] as const

export type RaceId = (typeof RACE_IDS)[number]
export type PowerId = (typeof POWER_IDS)[number]

export type ExpansionId = 'skyIslands'

export type Expansions = {
  skyIslands: boolean
}

export const DEFAULT_EXPANSIONS: Expansions = {
  skyIslands: false,
}

export type ScoringReminder = {
  text: string
  when: 'active' | 'firstActive' | 'decline'
}

export type CatalogSource = 'base' | 'skyIslands'

export type CatalogEntry<Id extends string> = {
  id: Id
  source: CatalogSource
  nameRu: string
  nameEn: string
  hint?: string
  spirit?: boolean
  scoresInDecline?: boolean
  scoring?: ScoringReminder[]
}

export const RACES: CatalogEntry<RaceId>[] = [
  { id: 'amazons', source: 'base', nameRu: 'Амазонки', nameEn: 'Amazons' },
  {
    id: 'dwarves',
    source: 'base',
    nameRu: 'Дварфы',
    nameEn: 'Dwarves',
    scoresInDecline: true,
    hint: 'Бонус за шахты сохраняется в упадке.',
    scoring: [
      {
        text: 'Дварфы: +1 монета за каждую занятую шахту, в том числе в упадке.',
        when: 'active',
      },
      {
        text: 'Дварфы: +1 монета за каждую занятую шахту, в том числе в упадке.',
        when: 'decline',
      },
    ],
  },
  { id: 'elves', source: 'base', nameRu: 'Эльфы', nameEn: 'Elves' },
  {
    id: 'ghouls',
    source: 'base',
    nameRu: 'Упыри',
    nameEn: 'Ghouls',
    hint: 'В упадке остаются все жетоны и могут продолжать завоевания.',
  },
  { id: 'giants', source: 'base', nameRu: 'Великаны', nameEn: 'Giants' },
  { id: 'halflings', source: 'base', nameRu: 'Полурослики', nameEn: 'Halflings' },
  {
    id: 'humans',
    source: 'base',
    nameRu: 'Люди',
    nameEn: 'Humans',
    scoring: [
      {
        text: 'Люди: +1 монета за каждый занятый регион пашни.',
        when: 'active',
      },
    ],
  },
  {
    id: 'orcs',
    source: 'base',
    nameRu: 'Орки',
    nameEn: 'Orcs',
    scoring: [
      {
        text: 'Орки: +1 монета за каждый непустой регион, завоёванный в этот ход.',
        when: 'active',
      },
    ],
  },
  { id: 'ratmen', source: 'base', nameRu: 'Крысолюды', nameEn: 'Ratmen' },
  { id: 'skeletons', source: 'base', nameRu: 'Скелеты', nameEn: 'Skeletons' },
  { id: 'sorcerers', source: 'base', nameRu: 'Колдуны', nameEn: 'Sorcerers' },
  { id: 'tritons', source: 'base', nameRu: 'Тритоны', nameEn: 'Tritons' },
  { id: 'trolls', source: 'base', nameRu: 'Тролли', nameEn: 'Trolls' },
  {
    id: 'wizards',
    source: 'base',
    nameRu: 'Волшебники',
    nameEn: 'Wizards',
    scoring: [
      {
        text: 'Волшебники: +1 монета за каждый занятый магический регион.',
        when: 'active',
      },
    ],
  },
  {
    id: 'wendigos',
    source: 'skyIslands',
    nameRu: 'Вендтиго',
    nameEn: 'Wendigos',
    hint: 'Соседние регионы сжигаются при завоеваниях Вендтиго.',
  },
  {
    id: 'drakons',
    source: 'skyIslands',
    nameRu: 'Драконы',
    nameEn: 'Drakons',
    hint: 'Драконы защищают регионы и уничтожают атакующих.',
  },
  {
    id: 'scavengers',
    source: 'skyIslands',
    nameRu: 'Падальщики',
    nameEn: 'Scavengers',
    hint: 'Неизрасходованные жетоны упадка остаются как защита.',
    scoring: [
      {
        text: 'Падальщики: хозяин жетонов упадка всё равно получает монету за регион, который заняли Падальщики; если это ваши же жетоны — регион может дать две монеты.',
        when: 'active',
      },
    ],
  },
  {
    id: 'scarecrows',
    source: 'skyIslands',
    nameRu: 'Пугала',
    nameEn: 'Scarecrows',
  },
  {
    id: 'escargots',
    source: 'skyIslands',
    nameRu: 'Улитки',
    nameEn: 'Escargots',
    scoring: [
      {
        text: 'Улитки: регионы в этот ход не дают монет; со следующего хода — в начале хода, не в конце.',
        when: 'firstActive',
      },
      {
        text: 'Улитки: монеты за регионы Улиток уже в начале хода (не в конце).',
        when: 'active',
      },
      {
        text: 'Улитки: регионы уже посчитаны в начале хода; в упадке регионы считаются ещё раз как обычно.',
        when: 'decline',
      },
    ],
  },
  {
    id: 'khans',
    source: 'skyIslands',
    nameRu: 'Ханы',
    nameEn: 'Khans',
    scoring: [
      {
        text: 'Ханы: +1 за холм или пашню, −1 за любой другой регион (не ниже 0).',
        when: 'active',
      },
    ],
  },
  {
    id: 'stormGiants',
    source: 'skyIslands',
    nameRu: 'Штормовые великаны',
    nameEn: 'Storm Giants',
    hint: 'Молнии бьют соседей; первое завоевание может быть в небе.',
  },
]

export const POWERS: CatalogEntry<PowerId>[] = [
  {
    id: 'alchemist',
    source: 'base',
    nameRu: 'Учёные',
    nameEn: 'Alchemist',
    scoring: [
      {
        text: 'Учёные: +2 монеты в конце каждого хода, пока раса активна.',
        when: 'active',
      },
    ],
  },
  { id: 'berserk', source: 'base', nameRu: 'Лютые', nameEn: 'Berserk' },
  { id: 'bivouacking', source: 'base', nameRu: 'Походные', nameEn: 'Bivouacking' },
  { id: 'commando', source: 'base', nameRu: 'Боевые', nameEn: 'Commando' },
  { id: 'diplomat', source: 'base', nameRu: 'Мирные', nameEn: 'Diplomat' },
  { id: 'dragonMaster', source: 'base', nameRu: 'Драконо-властные', nameEn: 'Dragon Master' },
  { id: 'flying', source: 'base', nameRu: 'Летучие', nameEn: 'Flying' },
  {
    id: 'forest',
    source: 'base',
    nameRu: 'Лесные',
    nameEn: 'Forest',
    scoring: [
      {
        text: 'Лесные: +1 монета за каждый занятый лесной регион.',
        when: 'active',
      },
    ],
  },
  {
    id: 'fortified',
    source: 'base',
    nameRu: 'Укрепленные',
    nameEn: 'Fortified',
    scoring: [
      {
        text: 'Укрепленные: +1 монета за каждую крепость, пока раса активна.',
        when: 'active',
      },
    ],
  },
  { id: 'heroic', source: 'base', nameRu: 'Героические', nameEn: 'Heroic' },
  {
    id: 'hill',
    source: 'base',
    nameRu: 'Холмовые',
    nameEn: 'Hill',
    scoring: [
      {
        text: 'Холмовые: +1 монета за каждый занятый холм.',
        when: 'active',
      },
    ],
  },
  {
    id: 'merchant',
    source: 'base',
    nameRu: 'Скаредные',
    nameEn: 'Merchant',
    scoring: [
      {
        text: 'Скаредные: +1 монета за каждый занятый регион.',
        when: 'active',
      },
    ],
  },
  { id: 'mounted', source: 'base', nameRu: 'Верховые', nameEn: 'Mounted' },
  {
    id: 'pillaging',
    source: 'base',
    nameRu: 'Разбойные',
    nameEn: 'Pillaging',
    scoring: [
      {
        text: 'Разбойные: +1 монета за каждый непустой регион, завоёванный в этот ход.',
        when: 'active',
      },
    ],
  },
  { id: 'seafaring', source: 'base', nameRu: 'Водные', nameEn: 'Seafaring' },
  {
    id: 'spirit',
    source: 'base',
    nameRu: 'Призрачные',
    nameEn: 'Spirit',
    spirit: true,
    hint: 'Раса в упадке не занимает слот единственного упадка.',
  },
  {
    id: 'stout',
    source: 'base',
    nameRu: 'Стойкие',
    nameEn: 'Stout',
    hint: 'Можно уйти в упадок в конце хода после завоеваний.',
  },
  {
    id: 'swamp',
    source: 'base',
    nameRu: 'Болотные',
    nameEn: 'Swamp',
    scoring: [
      {
        text: 'Болотные: +1 монета за каждый занятый регион болота.',
        when: 'active',
      },
    ],
  },
  { id: 'underworld', source: 'base', nameRu: 'Подземные', nameEn: 'Underworld' },
  {
    id: 'wealthy',
    source: 'base',
    nameRu: 'Богатые',
    nameEn: 'Wealthy',
    scoring: [
      {
        text: 'Богатые: +7 монет один раз, в конце первого хода.',
        when: 'firstActive',
      },
    ],
  },
  {
    id: 'airborne',
    source: 'skyIslands',
    nameRu: 'Воздушные',
    nameEn: 'Airborne',
    hint: 'В первый ход завоевания дешевле.',
  },
  {
    id: 'racketeering',
    source: 'skyIslands',
    nameRu: 'Вымогатели',
    nameEn: 'Racketeering',
  },
  {
    id: 'zeppelined',
    source: 'skyIslands',
    nameRu: 'Дирижабельные',
    nameEn: 'Zeppelined',
    hint: 'Дирижабли могут разбиться при завоеваниях.',
  },
  {
    id: 'goldsmith',
    source: 'skyIslands',
    nameRu: 'Золотоносные',
    nameEn: 'Goldsmith',
    scoring: [
      {
        text: 'Золотоносные: +2 за шахту, −1 за любой другой регион (не ниже 0).',
        when: 'active',
      },
    ],
  },
  {
    id: 'exploring',
    source: 'skyIslands',
    nameRu: 'Ищущие',
    nameEn: 'Exploring',
    scoring: [
      {
        text: 'Ищущие: бонус = меньшее из числа регионов на земле и на небесных островах.',
        when: 'active',
      },
    ],
  },
  {
    id: 'gunner',
    source: 'skyIslands',
    nameRu: 'Стрелковые',
    nameEn: 'Gunner',
    hint: 'Пушки стреляют по соседним регионам.',
  },
  {
    id: 'haggling',
    source: 'skyIslands',
    nameRu: 'Торговые',
    nameEn: 'Haggling',
    hint: 'Можно заключать торговые пакты.',
  },
]

export function raceById(id: RaceId): CatalogEntry<RaceId> {
  return RACES.find((r) => r.id === id)!
}

export function powerById(id: PowerId): CatalogEntry<PowerId> {
  return POWERS.find((p) => p.id === id)!
}

export function formatCombo(race: RaceId, power: PowerId): string {
  const r = raceById(race)
  const p = powerById(power)
  return `${p.nameRu} ${r.nameRu} (${p.nameEn} ${r.nameEn})`
}

export function isSpiritPower(id: PowerId): boolean {
  return id === 'spirit'
}

function isSourceEnabled(
  source: CatalogSource,
  expansions: Partial<Expansions>,
): boolean {
  if (source === 'base') return true
  return expansions.skyIslands ?? false
}

export function catalogFor(expansions: Partial<Expansions> = DEFAULT_EXPANSIONS): {
  races: CatalogEntry<RaceId>[]
  powers: CatalogEntry<PowerId>[]
} {
  return {
    races: RACES.filter((entry) => isSourceEnabled(entry.source, expansions)),
    powers: POWERS.filter((entry) => isSourceEnabled(entry.source, expansions)),
  }
}

export function isSkyIslandsCombo(combo: {
  race: RaceId
  power: PowerId
}): boolean {
  return (
    raceById(combo.race).source === 'skyIslands' ||
    powerById(combo.power).source === 'skyIslands'
  )
}
