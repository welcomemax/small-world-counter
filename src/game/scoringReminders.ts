import {
  isSpiritPower,
  powerById,
  raceById,
  type Expansions,
  type ScoringReminder,
} from './catalog'
import type { Combo, PlayerState, TurnAction } from './types'

const RACKETEERING_REMINDER =
  'Вымогатели: следующая связка бесплатна, с какой бы строки её ни взяли.'
const ISLAND_CONTROL_REMINDER =
  'Небесные острова: +1 за каждый остров, целиком занятый одной вашей расой (активной или в упадке). Озеро занимать не обязательно.'

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

function ownExpansionReminders(
  action: TurnAction,
  activeCombo: Combo | null,
  player: PlayerState,
): string[] {
  if (action === 'decline' && activeCombo?.power === 'racketeering') {
    return [RACKETEERING_REMINDER]
  }
  if (
    action === 'select' &&
    player.awaitingSelect &&
    // game.nextDeclined appends the newest declined combo last.
    player.declined.at(-1)?.power === 'racketeering'
  ) {
    return [RACKETEERING_REMINDER]
  }
  return []
}

function rivalExpansionReminders(
  action: TurnAction,
  rivals: PlayerState[],
): string[] {
  const reminders: string[] = []
  if (action === 'select' || action === 'expand') {
    for (const rival of rivals) {
      if (rival.activeCombo?.race === 'scarecrows') {
        reminders.push(
          `Пугала (${rival.name}): +1 из банка за каждый завоёванный регион с активными Пугалами.`,
        )
      }
    }
  }
  if (action === 'select') {
    for (const rival of rivals) {
      if (rival.activeCombo?.power === 'racketeering') {
        reminders.push(
          `Вымогатели (${rival.name}): игрок с Вымогателями получает из банка столько монет, сколько строк вы пропускаете.`,
        )
      }
    }
  }
  return reminders
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
  // Escargots' special timing ends after their decline turn, unlike Dwarves'
  // ongoing in-decline scoring.
  const retained = retainedDeclined.flatMap((combo) =>
    combo.race === 'escargots'
      ? []
      : remindersForCombo(combo, ['decline'], ['decline'], expansions),
  )
  const expansionReminders = expansions.skyIslands
    ? [
        ...ownExpansionReminders(action, activeCombo, player),
        ...rivalExpansionReminders(action, rivals),
        ISLAND_CONTROL_REMINDER,
      ]
    : []
  return [...current, ...retained, ...expansionReminders].filter(
    (text, index, all) => all.indexOf(text) === index,
  )
}
