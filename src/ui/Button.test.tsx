// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { Button } from './Button'

afterEach(cleanup)

describe('Button', () => {
  test('defaults to a secondary action', () => {
    render(<Button>К ходам</Button>)
    expect(screen.getByRole('button', { name: 'К ходам' }).className).toMatch(
      /secondary/,
    )
  })

  test('marks a primary submit distinctly from a selected toggle', () => {
    render(
      <>
        <Button variant="primary">Записать ход</Button>
        <Button variant="selected">Упадок</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Записать ход' }).className).toMatch(
      /primary/,
    )
    expect(screen.getByRole('button', { name: 'Упадок' }).className).toMatch(/selected/)
  })
})
