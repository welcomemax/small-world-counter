import { describe, expect, test } from 'vitest'
import { scoringRemindersForTurn } from './scoringReminders'

describe('scoring reminders', () => {
  test('uses the selected combo and includes one-time Wealthy income', () => {
    const reminders = scoringRemindersForTurn({
      action: 'select',
      activeCombo: { race: 'wizards', power: 'wealthy' },
      declined: [],
    })
    expect(reminders).toContain(
      'Волшебники: +1 монета за каждый занятый магический регион.',
    )
    expect(reminders).toContain(
      'Богатые: +7 монет один раз, в конце первого хода.',
    )
  })

  test('omits first-turn income while expanding', () => {
    const reminders = scoringRemindersForTurn({
      action: 'expand',
      activeCombo: { race: 'humans', power: 'wealthy' },
      declined: [],
    })
    expect(reminders).toContain(
      'Люди: +1 монета за каждый занятый регион пашни.',
    )
    expect(reminders.join(' ')).not.toContain('+7')
  })

  test('shows only decline-capable effects on a decline turn', () => {
    const reminders = scoringRemindersForTurn({
      action: 'decline',
      activeCombo: { race: 'dwarves', power: 'alchemist' },
      declined: [],
    })
    expect(reminders).toEqual([
      'Дварфы: +1 монета за каждую занятую шахту, в том числе в упадке.',
    ])
  })

  test('includes scoring effects from retained declined races', () => {
    const reminders = scoringRemindersForTurn({
      action: 'expand',
      activeCombo: { race: 'ratmen', power: 'flying' },
      declined: [{ race: 'dwarves', power: 'spirit' }],
    })
    expect(reminders).toContain(
      'Дварфы: +1 монета за каждую занятую шахту, в том числе в упадке.',
    )
  })

  test('drops an old ordinary decline reminder when a new race declines', () => {
    const reminders = scoringRemindersForTurn({
      action: 'decline',
      activeCombo: { race: 'humans', power: 'alchemist' },
      declined: [{ race: 'dwarves', power: 'flying' }],
    })
    expect(reminders).toEqual([])
  })
})
