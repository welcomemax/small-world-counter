import { describe, expect, test } from 'vitest'
import type { Expansions } from './catalog'
import { scoringRemindersForTurn } from './scoringReminders'
import type { Combo, PlayerState, TurnAction } from './types'

const BASE: Expansions = { skyIslands: false }
const SKY_ISLANDS: Expansions = { skyIslands: true }

function player(
  overrides: Partial<PlayerState> = {},
): PlayerState {
  return {
    id: 'p0',
    name: 'Анна',
    activeCombo: null,
    declined: [],
    awaitingSelect: false,
    ...overrides,
  }
}

function reminders({
  action,
  activeCombo,
  declined = [],
  expansions = SKY_ISLANDS,
  actor = player({ activeCombo, declined }),
  rivals = [],
}: {
  action: TurnAction
  activeCombo: Combo | null
  declined?: Combo[]
  expansions?: Expansions
  actor?: PlayerState
  rivals?: PlayerState[]
}) {
  return scoringRemindersForTurn({
    action,
    activeCombo,
    declined,
    expansions,
    player: actor,
    rivals,
  })
}

describe('scoring reminders', () => {
  test('uses the selected combo and includes one-time Wealthy income', () => {
    const result = reminders({
      action: 'select',
      activeCombo: { race: 'wizards', power: 'wealthy' },
      expansions: BASE,
    })
    expect(result).toContain(
      'Волшебники: +1 монета за каждый занятый магический регион.',
    )
    expect(result).toContain(
      'Богатые: +7 монет один раз, в конце первого хода.',
    )
  })

  test('omits first-turn income while expanding', () => {
    const result = reminders({
      action: 'expand',
      activeCombo: { race: 'humans', power: 'wealthy' },
      expansions: BASE,
    })
    expect(result).toContain(
      'Люди: +1 монета за каждый занятый регион пашни.',
    )
    expect(result.join(' ')).not.toContain('+7')
  })

  test('shows only decline-capable effects on a decline turn', () => {
    const result = reminders({
      action: 'decline',
      activeCombo: { race: 'dwarves', power: 'alchemist' },
      expansions: BASE,
    })
    expect(result).toEqual([
      'Дварфы: +1 монета за каждую занятую шахту, в том числе в упадке.',
    ])
  })

  test('includes scoring effects from retained declined races', () => {
    const result = reminders({
      action: 'expand',
      activeCombo: { race: 'ratmen', power: 'flying' },
      declined: [{ race: 'dwarves', power: 'spirit' }],
      expansions: BASE,
    })
    expect(result).toContain(
      'Дварфы: +1 монета за каждую занятую шахту, в том числе в упадке.',
    )
  })

  test('drops an old ordinary decline reminder when a new race declines', () => {
    const result = reminders({
      action: 'decline',
      activeCombo: { race: 'humans', power: 'alchemist' },
      declined: [{ race: 'dwarves', power: 'flying' }],
      expansions: BASE,
    })
    expect(result).toEqual([])
  })
})

describe('Sky Islands own-combo reminders', () => {
  test('shows only Escargots first-turn copy on select', () => {
    const result = reminders({
      action: 'select',
      activeCombo: { race: 'escargots', power: 'merchant' },
    })

    expect(result).toContain(
      'Улитки: регионы в этот ход не дают монет; со следующего хода — в начале хода, не в конце. Монеты силы — по-прежнему в конце хода.',
    )
    expect(result).not.toContain(
      'Улитки: монеты за регионы Улиток уже в начале хода (не в конце).',
    )
  })

  test.each([
    [
      'expand',
      'Улитки: монеты за регионы Улиток уже в начале хода (не в конце).',
    ],
    [
      'decline',
      'Улитки: регионы уже посчитаны в начале хода; в упадке регионы считаются ещё раз как обычно.',
    ],
  ] as const)('shows Escargots %s copy', (action, text) => {
    expect(
      reminders({
        action,
        activeCombo: { race: 'escargots', power: 'flying' },
      }),
    ).toContain(text)
  })

  test.each([
    [
      { race: 'khans', power: 'flying' } as Combo,
      'Ханы: +1 за холм или пашню, −1 за любой другой регион (не ниже 0).',
    ],
    [
      { race: 'humans', power: 'goldsmith' } as Combo,
      'Золотоносные: +2 за шахту, −1 за любой другой регион (не ниже 0).',
    ],
    [
      { race: 'humans', power: 'exploring' } as Combo,
      'Ищущие: бонус = меньшее из числа регионов на земле и на небесных островах.',
    ],
  ])('shows active scoring for $activeCombo', (activeCombo, text) => {
    expect(reminders({ action: 'expand', activeCombo })).toContain(text)
  })

  test('shows Scavengers only while active', () => {
    const combo: Combo = { race: 'scavengers', power: 'flying' }

    expect(reminders({ action: 'expand', activeCombo: combo }).join(' ')).toContain(
      'хозяин жетонов упадка',
    )
    expect(reminders({ action: 'decline', activeCombo: combo }).join(' ')).not.toContain(
      'хозяин жетонов упадка',
    )
  })

  test('shows own Racketeering on decline and the following select only', () => {
    const racketeers: Combo = { race: 'humans', power: 'racketeering' }
    const text =
      'Вымогатели: следующая связка бесплатна, с какой бы строки её ни взяли.'

    expect(
      reminders({ action: 'decline', activeCombo: racketeers }),
    ).toContain(text)
    expect(
      reminders({
        action: 'select',
        activeCombo: { race: 'orcs', power: 'flying' },
        declined: [racketeers],
        actor: player({
          activeCombo: null,
          declined: [racketeers],
          awaitingSelect: true,
        }),
      }),
    ).toContain(text)
    expect(
      reminders({
        action: 'expand',
        activeCombo: { race: 'orcs', power: 'flying' },
        declined: [racketeers],
        actor: player({
          activeCombo: { race: 'orcs', power: 'flying' },
          declined: [racketeers],
        }),
      }),
    ).not.toContain(text)
  })

  test.each(['select', 'expand', 'decline'] as const)(
    'shows the island-control reminder on %s',
    (action) => {
      expect(
        reminders({
          action,
          activeCombo: { race: 'humans', power: 'flying' },
        }),
      ).toContain(
        'Небесные острова: +1 за каждый остров, целиком занятый одной вашей расой (активной или в упадке). Озеро занимать не обязательно.',
      )
    },
  )
})

describe('Sky Islands rival reminders', () => {
  const scarecrowOwner = player({
    id: 'p1',
    name: 'Борис',
    activeCombo: { race: 'scarecrows', power: 'flying' },
  })
  const racketeeringOwner = player({
    id: 'p2',
    name: 'Вера',
    activeCombo: { race: 'elves', power: 'racketeering' },
  })

  test.each(['select', 'expand'] as const)(
    'warns about active rival Scarecrows on %s',
    (action) => {
      expect(
        reminders({
          action,
          activeCombo: { race: 'humans', power: 'merchant' },
          rivals: [scarecrowOwner],
        }).join(' '),
      ).toContain('Борис')
      expect(
        reminders({
          action,
          activeCombo: { race: 'humans', power: 'merchant' },
          rivals: [scarecrowOwner],
        }).join(' '),
      ).toContain('Пугалами')
    },
  )

  test('does not warn about rival Scarecrows on decline or in decline', () => {
    const declinedScarecrows = player({
      id: 'p1',
      name: 'Борис',
      declined: [{ race: 'scarecrows', power: 'flying' }],
    })

    expect(
      reminders({
        action: 'decline',
        activeCombo: { race: 'humans', power: 'merchant' },
        rivals: [scarecrowOwner, declinedScarecrows],
      }).join(' '),
    ).not.toContain('Пугалами')
  })

  test('warns about active rival Racketeering only on select', () => {
    const onSelect = reminders({
      action: 'select',
      activeCombo: { race: 'humans', power: 'merchant' },
      rivals: [racketeeringOwner],
    }).join(' ')
    const onExpand = reminders({
      action: 'expand',
      activeCombo: { race: 'humans', power: 'merchant' },
      rivals: [racketeeringOwner],
    }).join(' ')

    expect(onSelect).toContain('Вера')
    expect(onSelect).toContain('Вымогателями')
    expect(onExpand).not.toContain('Вымогателями')
  })

  test('omits all Sky Islands reminders in a base game', () => {
    const result = reminders({
      action: 'select',
      activeCombo: { race: 'escargots', power: 'goldsmith' },
      expansions: BASE,
      rivals: [scarecrowOwner, racketeeringOwner],
    }).join(' ')

    expect(result).not.toContain('Улитки')
    expect(result).not.toContain('Золотоносные')
    expect(result).not.toContain('Небесные острова')
    expect(result).not.toContain('Пугалами')
    expect(result).not.toContain('Вымогателями')
  })
})
