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
] as const

export type RaceId = (typeof RACE_IDS)[number]
export type PowerId = (typeof POWER_IDS)[number]

export type ScoringReminder = {
  text: string
  when: 'active' | 'firstActive' | 'decline'
}

export type CatalogEntry<Id extends string> = {
  id: Id
  nameRu: string
  nameEn: string
  hint?: string
  spirit?: boolean
  scoresInDecline?: boolean
  scoring?: ScoringReminder[]
}

export const RACES: CatalogEntry<RaceId>[] = [
  { id: 'amazons', nameRu: 'Амазонки', nameEn: 'Amazons' },
  {
    id: 'dwarves',
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
  { id: 'elves', nameRu: 'Эльфы', nameEn: 'Elves' },
  {
    id: 'ghouls',
    nameRu: 'Упыри',
    nameEn: 'Ghouls',
    hint: 'В упадке остаются все жетоны и могут продолжать завоевания.',
  },
  { id: 'giants', nameRu: 'Великаны', nameEn: 'Giants' },
  { id: 'halflings', nameRu: 'Полурослики', nameEn: 'Halflings' },
  {
    id: 'humans',
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
    nameRu: 'Орки',
    nameEn: 'Orcs',
    scoring: [
      {
        text: 'Орки: +1 монета за каждый непустой регион, завоёванный в этот ход.',
        when: 'active',
      },
    ],
  },
  { id: 'ratmen', nameRu: 'Крысолюды', nameEn: 'Ratmen' },
  { id: 'skeletons', nameRu: 'Скелеты', nameEn: 'Skeletons' },
  { id: 'sorcerers', nameRu: 'Колдуны', nameEn: 'Sorcerers' },
  { id: 'tritons', nameRu: 'Тритоны', nameEn: 'Tritons' },
  { id: 'trolls', nameRu: 'Тролли', nameEn: 'Trolls' },
  {
    id: 'wizards',
    nameRu: 'Волшебники',
    nameEn: 'Wizards',
    scoring: [
      {
        text: 'Волшебники: +1 монета за каждый занятый магический регион.',
        when: 'active',
      },
    ],
  },
]

export const POWERS: CatalogEntry<PowerId>[] = [
  {
    id: 'alchemist',
    nameRu: 'Учёные',
    nameEn: 'Alchemist',
    scoring: [
      {
        text: 'Учёные: +2 монеты в конце каждого хода, пока раса активна.',
        when: 'active',
      },
    ],
  },
  { id: 'berserk', nameRu: 'Лютые', nameEn: 'Berserk' },
  { id: 'bivouacking', nameRu: 'Походные', nameEn: 'Bivouacking' },
  { id: 'commando', nameRu: 'Боевые', nameEn: 'Commando' },
  { id: 'diplomat', nameRu: 'Мирные', nameEn: 'Diplomat' },
  { id: 'dragonMaster', nameRu: 'Драконо-властные', nameEn: 'Dragon Master' },
  { id: 'flying', nameRu: 'Летучие', nameEn: 'Flying' },
  {
    id: 'forest',
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
    nameRu: 'Укрепленные',
    nameEn: 'Fortified',
    scoring: [
      {
        text: 'Укрепленные: +1 монета за каждую крепость, пока раса активна.',
        when: 'active',
      },
    ],
  },
  { id: 'heroic', nameRu: 'Героические', nameEn: 'Heroic' },
  {
    id: 'hill',
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
    nameRu: 'Скаредные',
    nameEn: 'Merchant',
    scoring: [
      {
        text: 'Скаредные: +1 монета за каждый занятый регион.',
        when: 'active',
      },
    ],
  },
  { id: 'mounted', nameRu: 'Верховые', nameEn: 'Mounted' },
  {
    id: 'pillaging',
    nameRu: 'Разбойные',
    nameEn: 'Pillaging',
    scoring: [
      {
        text: 'Разбойные: +1 монета за каждый непустой регион, завоёванный в этот ход.',
        when: 'active',
      },
    ],
  },
  { id: 'seafaring', nameRu: 'Водные', nameEn: 'Seafaring' },
  {
    id: 'spirit',
    nameRu: 'Призрачные',
    nameEn: 'Spirit',
    spirit: true,
    hint: 'Раса в упадке не занимает слот единственного упадка.',
  },
  {
    id: 'stout',
    nameRu: 'Стойкие',
    nameEn: 'Stout',
    hint: 'Можно уйти в упадок в конце хода после завоеваний.',
  },
  {
    id: 'swamp',
    nameRu: 'Болотные',
    nameEn: 'Swamp',
    scoring: [
      {
        text: 'Болотные: +1 монета за каждый занятый регион болота.',
        when: 'active',
      },
    ],
  },
  { id: 'underworld', nameRu: 'Подземные', nameEn: 'Underworld' },
  {
    id: 'wealthy',
    nameRu: 'Богатые',
    nameEn: 'Wealthy',
    scoring: [
      {
        text: 'Богатые: +7 монет один раз, в конце первого хода.',
        when: 'firstActive',
      },
    ],
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
