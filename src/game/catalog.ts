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

export type CatalogEntry<Id extends string> = {
  id: Id
  nameRu: string
  nameEn: string
  hint?: string
  spirit?: boolean
  scoresInDecline?: boolean
}

export const RACES: CatalogEntry<RaceId>[] = [
  { id: 'amazons', nameRu: 'Амазонки', nameEn: 'Amazons' },
  {
    id: 'dwarves',
    nameRu: 'Гномы',
    nameEn: 'Dwarves',
    scoresInDecline: true,
    hint: 'Бонус за шахты сохраняется в упадке.',
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
  { id: 'humans', nameRu: 'Люди', nameEn: 'Humans' },
  { id: 'orcs', nameRu: 'Орки', nameEn: 'Orcs' },
  { id: 'ratmen', nameRu: 'Крысолюди', nameEn: 'Ratmen' },
  { id: 'skeletons', nameRu: 'Скелеты', nameEn: 'Skeletons' },
  { id: 'sorcerers', nameRu: 'Чародеи', nameEn: 'Sorcerers' },
  { id: 'tritons', nameRu: 'Тритоны', nameEn: 'Tritons' },
  { id: 'trolls', nameRu: 'Тролли', nameEn: 'Trolls' },
  { id: 'wizards', nameRu: 'Маги', nameEn: 'Wizards' },
]

export const POWERS: CatalogEntry<PowerId>[] = [
  { id: 'alchemist', nameRu: 'Алхимик', nameEn: 'Alchemist' },
  { id: 'berserk', nameRu: 'Берсерк', nameEn: 'Berserk' },
  { id: 'bivouacking', nameRu: 'Бивуак', nameEn: 'Bivouacking' },
  { id: 'commando', nameRu: 'Коммандос', nameEn: 'Commando' },
  { id: 'diplomat', nameRu: 'Дипломат', nameEn: 'Diplomat' },
  { id: 'dragonMaster', nameRu: 'Повелитель драконов', nameEn: 'Dragon Master' },
  { id: 'flying', nameRu: 'Летающие', nameEn: 'Flying' },
  { id: 'forest', nameRu: 'Лесные', nameEn: 'Forest' },
  { id: 'fortified', nameRu: 'Укреплённые', nameEn: 'Fortified' },
  { id: 'heroic', nameRu: 'Героические', nameEn: 'Heroic' },
  { id: 'hill', nameRu: 'Холмовые', nameEn: 'Hill' },
  { id: 'merchant', nameRu: 'Торговцы', nameEn: 'Merchant' },
  { id: 'mounted', nameRu: 'Конные', nameEn: 'Mounted' },
  { id: 'pillaging', nameRu: 'Грабители', nameEn: 'Pillaging' },
  { id: 'seafaring', nameRu: 'Мореходы', nameEn: 'Seafaring' },
  {
    id: 'spirit',
    nameRu: 'Духи',
    nameEn: 'Spirit',
    spirit: true,
    hint: 'Раса в упадке не занимает слот единственного упадка.',
  },
  {
    id: 'stout',
    nameRu: 'Крепкие',
    nameEn: 'Stout',
    hint: 'Можно уйти в упадок в конце хода после завоеваний.',
  },
  { id: 'swamp', nameRu: 'Болотные', nameEn: 'Swamp' },
  { id: 'underworld', nameRu: 'Подземные', nameEn: 'Underworld' },
  { id: 'wealthy', nameRu: 'Богатые', nameEn: 'Wealthy' },
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
