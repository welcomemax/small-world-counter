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
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить: Бонусы' }))
    expect(screen.getByText('Итого: 8 монет')).toBeTruthy()
  })

  test('follows the order players count in: decline, active race, bonuses', () => {
    render(<Controlled />)
    const decline = screen.getByLabelText('Точное число регионов в упадке')
    const active = screen.getByLabelText('Точное число активных регионов')
    const bonus = screen.getByLabelText('Точное число бонусных монет')

    expect(
      decline.compareDocumentPosition(active) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      active.compareDocumentPosition(bonus) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  test('gives bonuses the same slider and side buttons as the region rows', () => {
    render(<Controlled />)
    const bonus = screen.getByLabelText('Бонусы')
    expect(bonus.getAttribute('type')).toBe('range')
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить: Бонусы' }))
    expect(screen.getByText('Итого: 1 монет')).toBeTruthy()
  })

  test('steps a slider with the buttons on either side of the track', () => {
    render(<Controlled />)
    const up = screen.getByRole('button', { name: 'Увеличить: Регионы в упадке' })
    const down = screen.getByRole('button', {
      name: 'Уменьшить: Регионы в упадке',
    })

    expect(down.hasAttribute('disabled')).toBe(true)
    fireEvent.click(up)
    fireEvent.click(up)
    fireEvent.click(down)

    expect(
      screen.getByLabelText<HTMLInputElement>('Точное число регионов в упадке')
        .value,
    ).toBe('1')
    expect(screen.getByText('Итого: 1 монет')).toBeTruthy()
  })

  test('uses plain text fields so browsers add no spinners', () => {
    render(<Controlled />)
    for (const label of [
      'Точное число регионов в упадке',
      'Точное число активных регионов',
      'Точное число бонусных монет',
    ]) {
      const input = screen.getByLabelText(label)
      expect(input.getAttribute('type')).toBe('text')
      expect(input.getAttribute('inputmode')).toBe('numeric')
    }
  })

  test('keeps only the digits typed into a text field', () => {
    render(<Controlled />)
    fireEvent.change(screen.getByLabelText('Точное число активных регионов'), {
      target: { value: '7 регионов' },
    })
    expect(screen.getByText('Итого: 7 монет')).toBeTruthy()
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
