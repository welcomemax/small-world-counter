import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { emptyMarket, setSlotCombo } from '../game/market'
import { DiscreteSlider } from './DiscreteSlider'
import { MarketColumn } from './MarketColumn'
import { NameCombobox } from './NameCombobox'
import { PlayerSetupCard } from './PlayerSetupCard'
import { ToggleSwitch } from './ToggleSwitch'

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
