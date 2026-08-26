import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { emptyMarket, setSlotCombo } from '../game/market'
import type { Combo } from '../game/types'
import { MarketColumn } from './MarketColumn'

const COLUMN: Combo[] = [
  { race: 'humans', power: 'merchant' },
  { race: 'orcs', power: 'hill' },
  { race: 'elves', power: 'forest' },
  { race: 'dwarves', power: 'mounted' },
  { race: 'trolls', power: 'fortified' },
  { race: 'giants', power: 'swamp' },
]

function filledMarket() {
  return COLUMN.reduce(
    (market, combo, index) => setSlotCombo(market, index, combo),
    emptyMarket(),
  )
}

describe('MarketColumn selection', () => {
  test('keeps the base row box so a picked row cannot resize its neighbours', () => {
    const html = renderToStaticMarkup(
      <MarketColumn
        market={filledMarket()}
        selectedIndex={2}
        onSelect={() => undefined}
      />,
    )

    expect(html.match(/class="_slot_/g)).toHaveLength(6)
    expect(html.match(/class="_slot_[^"]*_selected_/g)).toHaveLength(1)
  })

  test('announces the picked row and flags it for the pick animation', () => {
    const html = renderToStaticMarkup(
      <MarketColumn
        market={filledMarket()}
        selectedIndex={0}
        onSelect={() => undefined}
      />,
    )

    expect(html.match(/aria-pressed="false"/g)).toHaveLength(5)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html.match(/data-selected="true"/g)).toHaveLength(1)
  })

  test('omits pressed state when rows are not pickable', () => {
    const html = renderToStaticMarkup(<MarketColumn market={filledMarket()} />)

    expect(html).not.toContain('aria-pressed')
    expect(html).not.toContain('data-selected="true"')
  })
})
