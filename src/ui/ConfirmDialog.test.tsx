// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

const props = () => ({
  open: true,
  title: 'Начать новую партию?',
  description: 'Текущий прогресс будет удалён.',
  cancelLabel: 'Продолжить игру',
  confirmLabel: 'Начать заново',
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
})

afterEach(cleanup)

describe('ConfirmDialog', () => {
  test('focuses the safe action and handles Escape and confirmation', () => {
    const values = props()
    render(<ConfirmDialog {...values} />)

    expect(
      screen.getByRole('dialog', { name: 'Начать новую партию?' }),
    ).toBeTruthy()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Продолжить игру' }),
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(values.onCancel).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Начать заново' }))
    expect(values.onConfirm).toHaveBeenCalledOnce()
  })

  test('only a click on the backdrop cancels', () => {
    const values = props()
    const { container } = render(<ConfirmDialog {...values} />)
    const backdrop = container.querySelector('[data-dialog-backdrop]')
    const dialog = screen.getByRole('dialog')

    fireEvent.click(dialog)
    expect(values.onCancel).not.toHaveBeenCalled()

    fireEvent.click(backdrop!)
    expect(values.onCancel).toHaveBeenCalledOnce()
  })

  test('cycles focus through both actions', () => {
    render(<ConfirmDialog {...props()} />)
    const cancel = screen.getByRole('button', { name: 'Продолжить игру' })
    const confirm = screen.getByRole('button', { name: 'Начать заново' })

    cancel.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirm)

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(cancel)
  })
})
