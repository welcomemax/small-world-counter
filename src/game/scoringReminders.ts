import {
  isSpiritPower,
  powerById,
  raceById,
  type ScoringReminder,
} from './catalog'
import type { Combo, TurnAction } from './types'

export type ReminderContext = {
  action: TurnAction
  activeCombo: Combo | null
  declined: Combo[]
}

function remindersForCombo(
  combo: Combo,
  allowed: ScoringReminder['when'][],
): string[] {
  return [raceById(combo.race), powerById(combo.power)]
    .flatMap((entry) => entry.scoring ?? [])
    .filter((entry) => allowed.includes(entry.when))
    .map((entry) => entry.text)
}

export function scoringRemindersForTurn({
  action,
  activeCombo,
  declined,
}: ReminderContext): string[] {
  const current = activeCombo
    ? remindersForCombo(
        activeCombo,
        action === 'select'
          ? ['active', 'firstActive']
          : action === 'decline'
            ? ['decline']
            : ['active'],
      )
    : []
  const retainedDeclined =
    action === 'decline'
      ? declined.filter((combo) => isSpiritPower(combo.power))
      : declined
  const retained = retainedDeclined.flatMap((combo) =>
    remindersForCombo(combo, ['decline']),
  )
  return [...current, ...retained].filter(
    (text, index, all) => all.indexOf(text) === index,
  )
}
