// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { ChartTooltip } from './ChartTooltip'

afterEach(cleanup)

function lineEntry(name: string, value: number, gain: number) {
  return {
    name,
    value,
    color: '#c45c3a',
    dataKey: name,
    payload: { round: 3, gains: { [name]: gain } },
  }
}

describe('ChartTooltip', () => {
  test('shows what the round added next to the running total', () => {
    render(
      <ChartTooltip
        active
        label={3}
        payload={[lineEntry('Анна', 17, 5), lineEntry('Борис', 12, 0)]}
      />,
    )

    expect(screen.getByText('Ход 3')).toBeTruthy()
    expect(screen.getByText('17')).toBeTruthy()
    expect(screen.getByText('+5')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  test('spells out coins lost to the draft and the starting point', () => {
    render(
      <ChartTooltip active label={0} payload={[lineEntry('Анна', 3, -2)]} />,
    )

    expect(screen.getByText('Старт')).toBeTruthy()
    expect(screen.getByText('−2')).toBeTruthy()
  })

  test('keeps a plain breakdown when a row carries no per-round gain', () => {
    render(
      <ChartTooltip
        active
        label="Анна"
        payload={[
          { name: 'Активные', value: 14, color: '#4a9a68', dataKey: 'active' },
          { name: 'Бонусы', value: 0, color: '#c4923a', dataKey: 'bonus' },
        ]}
        skipZeros
      />,
    )

    expect(screen.getByText('Анна')).toBeTruthy()
    expect(screen.getByText('14')).toBeTruthy()
    expect(screen.queryByText('Бонусы')).toBeNull()
  })

  test('renders nothing while the chart is not hovered', () => {
    const { container } = render(
      <ChartTooltip payload={[lineEntry('Анна', 17, 5)]} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
