// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { emptyMarket, setSlotCoins, setSlotCombo } from '../game/market'
import { filterMarketForExpansions } from '../game/setupPreferences'
import {
  GameContext,
  GameProvider,
  type GameContextValue,
} from '../state/GameContext'
import { ComboPicker } from './ComboPicker'
import { DiscreteSlider } from './DiscreteSlider'
import { MarketColumn } from './MarketColumn'
import { NameCombobox } from './NameCombobox'
import { PlayerSetupCard } from './PlayerSetupCard'
import { SetupScreen } from './SetupScreen'
import { ToggleSwitch } from './ToggleSwitch'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

function renderSetup(startGame = vi.fn()) {
  const value: GameContextValue = {
    game: null,
    screen: 'setup',
    handover: null,
    startGame,
    recordTurn: vi.fn(),
    undoTurn: vi.fn(),
    setMarketCombo: vi.fn(),
    setMarketCoins: vi.fn(),
    toggleHidden: vi.fn(),
    goAnalytics: vi.fn(),
    goLive: vi.fn(),
    newGame: vi.fn(),
    dismissHandover: vi.fn(),
  }
  render(
    <GameContext.Provider value={value}>
      <SetupScreen />
    </GameContext.Provider>,
  )
  return startGame
}

describe('DiscreteSlider', () => {
  test('renders an accessible native range with its current value and marks', () => {
    const html = renderToStaticMarkup(
      <DiscreteSlider
        id="players"
        label="Игроков"
        value={3}
        min={2}
        max={5}
        marks={[2, 3, 4, 5]}
        onChange={() => undefined}
      />,
    )
    expect(html).toContain('type="range"')
    expect(html).toContain('min="2"')
    expect(html).toContain('max="5"')
    expect(html).toContain('value="3"')
    expect(html).toContain('>Игроков<')
    expect(html).toContain('>5<')
  })
})

describe('NameCombobox', () => {
  test('renders editable combobox semantics and suggestions', () => {
    const html = renderToStaticMarkup(
      <NameCombobox
        id="player-0"
        label="Игрок 1"
        value=""
        placeholder="Остроух"
        suggestions={['Анна', 'Борис']}
        onChange={() => undefined}
      />,
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('placeholder="Остроух"')
    expect(html).toContain('Игрок 1')
  })
})

describe('MarketColumn setup actions', () => {
  test('offers an accessible randomizer for every combo row', () => {
    const html = renderToStaticMarkup(
      <MarketColumn market={emptyMarket()} onRandomize={() => undefined} />,
    )
    expect(html.match(/Случайная связка для строки/g)).toHaveLength(6)
  })

  test('can limit randomizers to empty rows during a live game', () => {
    const market = setSlotCombo(emptyMarket(), 0, {
      race: 'humans',
      power: 'merchant',
    })
    const allRows = renderToStaticMarkup(
      <MarketColumn market={market} onRandomize={() => undefined} />,
    )
    const emptyRows = renderToStaticMarkup(
      <MarketColumn
        market={market}
        onRandomize={() => undefined}
        randomizeEmptyOnly
      />,
    )

    expect(allRows.match(/Случайная связка для строки/g)).toHaveLength(6)
    expect(emptyRows.match(/Случайная связка для строки/g)).toHaveLength(5)
    expect(emptyRows).not.toContain('Случайная связка для строки 1')
  })

  test('filters picker options to the enabled catalog but retains its current value', () => {
    const baseOnly = renderToStaticMarkup(
      <ComboPicker
        idPrefix="base"
        value={{ race: 'humans', power: 'merchant' }}
        expansions={{ skyIslands: false }}
        onChange={() => undefined}
      />,
    )
    const retainedDlc = renderToStaticMarkup(
      <ComboPicker
        idPrefix="retained"
        value={{ race: 'khans', power: 'goldsmith' }}
        expansions={{ skyIslands: false }}
        onChange={() => undefined}
      />,
    )

    expect(baseOnly).not.toContain('value="khans"')
    expect(baseOnly).not.toContain('value="goldsmith"')
    expect(retainedDlc).toContain('value="khans"')
    expect(retainedDlc).toContain('value="goldsmith"')
  })
})

describe('ToggleSwitch', () => {
  test('renders an accessible checked switch with supporting text', () => {
    const html = renderToStaticMarkup(
      <ToggleSwitch
        checked
        label="Скрытый счёт"
        description="Не показывать итоги до конца партии"
        onChange={() => undefined}
      />,
    )
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked=""')
    expect(html).toContain('Скрытый счёт')
    expect(html).toContain('Не показывать итоги до конца партии')
  })
})

describe('Sky Islands setup toggle', () => {
  test('renders accessible copy and restores the saved preference', () => {
    localStorage.setItem(
      'small-world-counter.setup.expansions.v1',
      JSON.stringify({ skyIslands: true }),
    )

    render(
      <GameProvider>
        <SetupScreen />
      </GameProvider>,
    )

    expect(
      (screen.getByRole('checkbox', {
        name: /Небесные острова/,
      }) as HTMLInputElement).checked,
    ).toBe(true)
    expect(screen.getByText('7 рас и 7 сил дополнения в драфте')).toBeTruthy()
    expect(screen.getByText('база + Небесные острова')).toBeTruthy()
  })

  test('removes a DLC setup row when switched off', () => {
    localStorage.setItem(
      'small-world-counter.setup.expansions.v1',
      JSON.stringify({ skyIslands: true }),
    )
    render(
      <GameProvider>
        <SetupScreen />
      </GameProvider>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Править связку' })[0]!)
    fireEvent.change(screen.getByLabelText('Сила'), {
      target: { value: 'goldsmith' },
    })
    expect(screen.getAllByText(/Золотоносные Амазонки/)).toHaveLength(2)

    fireEvent.click(screen.getByRole('checkbox', { name: /Небесные острова/ }))

    expect(screen.queryByText(/Золотоносные Амазонки/)).toBeNull()
    expect(screen.getAllByText('пусто — впишите связку')).toHaveLength(6)
    expect(localStorage.getItem('small-world-counter.setup.expansions.v1')).toBe(
      '{"skyIslands":false}',
    )
  })

  test('submits the enabled Sky Islands expansion in a valid setup', () => {
    const startGame = renderSetup()

    fireEvent.change(screen.getByLabelText('Имя игрока 1'), {
      target: { value: 'Анна' },
    })
    fireEvent.change(screen.getByLabelText('Имя игрока 2'), {
      target: { value: 'Борис' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /Небесные острова/ }))
    for (let index = 1; index <= 6; index += 1) {
      fireEvent.click(
        screen.getByRole('button', {
          name: `Случайная связка для строки ${index}`,
        }),
      )
    }

    fireEvent.click(screen.getByRole('button', { name: /Играть/ }))

    expect(startGame).toHaveBeenCalledWith(
      expect.objectContaining({
        expansions: { skyIslands: true },
      }),
    )
    expect(startGame).toHaveBeenCalledTimes(1)
  })

  test('keeps rapid randomizations in separate rows', () => {
    renderSetup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const randomizers = screen.getAllByRole('button', {
      name: /Случайная связка для строки/,
    })

    act(() => {
      randomizers[0]!.click()
      randomizers[1]!.click()
    })

    expect(screen.getByText('2 / 6')).toBeTruthy()
  })

  test('resets both combo and coins for every disabled DLC row', () => {
    let market = setSlotCombo(emptyMarket(), 0, {
      race: 'khans',
      power: 'goldsmith',
    })
    market = setSlotCoins(market, 0, 4)
    market = setSlotCombo(market, 1, {
      race: 'humans',
      power: 'merchant',
    })
    market = setSlotCoins(market, 1, 3)

    expect(
      filterMarketForExpansions(market, { skyIslands: false }).slots.slice(0, 2),
    ).toEqual([
      { combo: null, coins: 0 },
      { combo: { race: 'humans', power: 'merchant' }, coins: 3 },
    ])
  })
})

describe('PlayerSetupCard first-player controls', () => {
  test('uses compact accessible crown buttons without visible state text', () => {
    const html = renderToStaticMarkup(
      <PlayerSetupCard
        players={[{ name: 'Анна' }, { name: 'Борис' }]}
        suggestions={[[], []]}
        firstPlayerIndex={0}
        highlightedPlayer={0}
        winnerPulse={null}
        isRolling={false}
        onRoll={() => undefined}
        onChooseFirst={() => undefined}
        onNameChange={() => undefined}
      />,
    )

    expect(html).not.toContain('>выбрать<')
    expect(html).not.toContain('>первый<')
    expect(html).not.toContain('Бросить жребий')
    expect(html).toContain('title="Случайно выбрать первого игрока"')
    expect(html).toContain('aria-label="Первый игрок — Анна"')
    expect(html).toContain('aria-label="Выбрать первым: Борис"')
    expect(html).toContain('aria-pressed="true"')
    expect(html.match(/data-icon="crown"/g)).toHaveLength(2)
  })

  test('marks the dice as rolling while the roulette runs', () => {
    const html = renderToStaticMarkup(
      <PlayerSetupCard
        players={[{ name: 'Анна' }, { name: 'Борис' }]}
        suggestions={[[], []]}
        firstPlayerIndex={0}
        highlightedPlayer={1}
        winnerPulse={null}
        isRolling
        onRoll={() => undefined}
        onChooseFirst={() => undefined}
        onNameChange={() => undefined}
      />,
    )

    expect(html).toContain('data-rolling="true"')
  })
})
