import {
  isSpiritPower,
  powerById,
  raceById,
  type Expansions,
  type ScoringReminder,
} from './catalog'
import type { Combo, PlayerState, TurnAction } from './types'

export type ReminderContext = {
  action: TurnAction
  activeCombo: Combo | null
  declined: Combo[]
  expansions: Expansions
  player: PlayerState
  rivals: PlayerState[]
}

function remindersForCombo(
  combo: Combo,
  raceAllowed: ScoringReminder['when'][],
  powerAllowed: ScoringReminder['when'][],
  expansions: Expansions,
): string[] {
  const texts: string[] = []
  for (const { entry, allowed } of [
    { entry: raceById(combo.race), allowed: raceAllowed },
    { entry: powerById(combo.power), allowed: powerAllowed },
  ]) {
    if (entry.source === 'skyIslands' && !expansions.skyIslands) continue
    for (const reminder of entry.scoring ?? []) {
      if (allowed.includes(reminder.when)) texts.push(reminder.text)
    }
  }
  return texts
}

export function scoringRemindersForTurn({
  action,
  activeCombo,
  declined,
  expansions,
  player,
  rivals,
}: ReminderContext): string[] {
  const activeAllowed: ScoringReminder['when'][] =
    action === 'select'
      ? ['active', 'firstActive']
      : action === 'decline'
        ? ['decline']
        : ['active']
  const raceAllowed =
    action === 'select' && activeCombo?.race === 'escargots'
      ? (['firstActive'] satisfies ScoringReminder['when'][])
      : activeAllowed
  const current = activeCombo
    ? remindersForCombo(
        activeCombo,
        raceAllowed,
        activeAllowed,
        expansions,
      )
    : []
  const retainedDeclined =
    action === 'decline'
      ? declined.filter((combo) => isSpiritPower(combo.power))
      : declined
  const retained = retainedDeclined.flatMap((combo) =>
    remindersForCombo(combo, ['decline'], ['decline'], expansions),
  )
  const expansionReminders = expansions.skyIslands
    ? [
        ...(activeCombo?.power === 'racketeering' && action === 'decline'
          ? [
              'Вымогатели: следующая связка бесплатна, с какой бы строки её ни взяли.',
            ]
          : []),
        ...(action === 'select' &&
        player.awaitingSelect &&
        player.declined.some((combo) => combo.power === 'racketeering')
          ? [
              'Вымогатели: следующая связка бесплатна, с какой бы строки её ни взяли.',
            ]
          : []),
        ...((action === 'select' || action === 'expand')
          ? rivals.flatMap((rival) =>
              rival.activeCombo?.race === 'scarecrows'
                ? [
                    `Пугала (${rival.name}): +1 из банка за каждый завоёванный регион с активными Пугалами.`,
                  ]
                : [],
            )
          : []),
        ...(action === 'select'
          ? rivals.flatMap((rival) =>
              rival.activeCombo?.power === 'racketeering'
                ? [
                    `Вымогатели (${rival.name}): игрок с Вымогателями получает из банка столько монет, сколько строк вы пропускаете.`,
                  ]
                : [],
            )
          : []),
        'Небесные острова: +1 за каждый остров, целиком занятый одной вашей расой (активной или в упадке). Озеро занимать не обязательно.',
      ]
    : []
  return [...current, ...retained, ...expansionReminders].filter(
    (text, index, all) => all.indexOf(text) === index,
  )
}
