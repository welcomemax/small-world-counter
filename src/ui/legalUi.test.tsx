// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { AppFooter } from './AppFooter'
import { RulesSheet } from './RulesSheet'
import { PUBLISHER_URL } from './legal'

afterEach(cleanup)

describe('App', () => {
  test('opens the in-app rules from setup and credits the publisher', () => {
    render(
      <GameProvider>
        <App />
      </GameProvider>,
    )

    const rulesButtons = screen.getAllByRole('button', { name: 'Правила' })
    expect(rulesButtons).toHaveLength(1)

    fireEvent.click(rulesButtons[0]!)
    expect(screen.getByRole('dialog', { name: 'Правила за столом' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Days of Wonder' }).getAttribute('href')).toBe(
      PUBLISHER_URL,
    )
  })
})

describe('AppFooter', () => {
  test('credits the publisher and opens the in-app rules', () => {
    const onOpenRules = vi.fn()
    render(<AppFooter onOpenRules={onOpenRules} />)

    const publisher = screen.getByRole('link', { name: /Days of Wonder/i })
    expect(publisher.getAttribute('href')).toBe(PUBLISHER_URL)
    expect(publisher.getAttribute('rel')).toContain('noreferrer')

    fireEvent.click(screen.getByRole('button', { name: 'Правила' }))
    expect(onOpenRules).toHaveBeenCalledOnce()
  })
})

describe('RulesSheet', () => {
  test('shows a companion summary and the official publisher link', () => {
    const onClose = vi.fn()
    render(<RulesSheet open onClose={onClose} />)

    expect(screen.getByRole('dialog', { name: 'Правила за столом' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Драфт — колонка из шести' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Дальше: расширение или упадок' }),
    ).toBeTruthy()

    const official = screen.getByRole('link', { name: /официальн/i })
    expect(official.getAttribute('href')).toBe(PUBLISHER_URL)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  test('renders nothing when closed', () => {
    render(<RulesSheet open={false} onClose={() => undefined} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
