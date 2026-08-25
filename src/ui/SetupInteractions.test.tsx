// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import { NameCombobox } from './NameCombobox'

function ControlledCombobox() {
  const [value, setValue] = useState('')
  return (
    <NameCombobox
      id="player"
      label="Игрок"
      value={value}
      placeholder="Имя"
      suggestions={['Анна', 'Борис']}
      onChange={setValue}
    />
  )
}

afterEach(cleanup)

describe('NameCombobox selection', () => {
  test('keeps the popup outside the input label click target', () => {
    render(<ControlledCombobox />)
    fireEvent.focus(screen.getByRole('combobox'))

    expect(screen.getByRole('listbox').closest('label')).toBeNull()
  })

  test('closes after selecting an option with a pointer', () => {
    render(<ControlledCombobox />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Анна' }))
    fireEvent.click(screen.getByRole('option', { name: 'Анна' }))

    expect((input as HTMLInputElement).value).toBe('Анна')
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  test('closes after selecting the active option with Enter', () => {
    render(<ControlledCombobox />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect((input as HTMLInputElement).value).toBe('Анна')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
