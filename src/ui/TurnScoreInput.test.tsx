// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import type { ScoreBreakdown } from '../game/score'
import type { TurnAction } from '../game/types'
import { TurnScoreInput } from './TurnScoreInput'

afterEach(cleanup)

function Controlled({ action = 'expand' }: { action?: TurnAction }) {
  const [value, setValue] = useState<ScoreBreakdown>({
    activeRegions: 0,
    declineRegions: 0,
    bonus: 0,
  })
  return (
    <TurnScoreInput
      action={action}
      value={value}
      reminders={[
        'Маги: +1 монета за каждый занятый магический регион.',
      ]}
      onChange={setValue}
    />
  )
}

describe('TurnScoreInput', () => {
  test('derives the total while editing all score parts', () => {
    render(<Controlled />)
    fireEvent.change(
      screen.getByLabelText('Точное число активных регионов'),
      { target: { value: '5' } },
    )
    fireEvent.change(
      screen.getByLabelText('Точное число регионов в упадке'),
      { target: { value: '2' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить бонусы' }))
    expect(screen.getByText('Итого: 8 монет')).toBeTruthy()
  })

  test('adapts a decline turn and displays scoring reminders', () => {
    render(<Controlled action="decline" />)
    expect(
      screen.queryByLabelText('Точное число активных регионов'),
    ).toBeNull()
    expect(screen.getByText(/считайте.*регионы в упадке/i)).toBeTruthy()
    expect(screen.getByText(/Маги: \+1 монета/)).toBeTruthy()
  })
})
