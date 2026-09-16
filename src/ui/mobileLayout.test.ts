import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

function ruleBody(file: string, selector: string): string {
  const match = read(`./${file}`).match(
    new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`),
  )
  if (!match) throw new Error(`No .${selector} rule in ${file}`)
  return match[1]!
}

/** A phone is one column wide, so a single wide child must not widen the page. */
const PAGE_GRIDS = [
  { name: 'setup form', file: 'SetupScreen.module.css', selector: 'form' },
  { name: 'live layout', file: 'LiveScreen.module.css', selector: 'layout' },
]

describe('page grids on a phone', () => {
  test.each(PAGE_GRIDS)('$name caps its column at zero', ({ file, selector }) => {
    expect(ruleBody(file, selector)).toMatch(
      /grid-template-columns:\s*minmax\(\s*0\s*,/,
    )
  })
})

describe('draft ahead of the score fields', () => {
  const css = read('./LiveScreen.module.css')

  test('flattens the two columns into the page grid on a phone', () => {
    expect(css).toMatch(
      /@media \(max-width: 859px\)[\s\S]*\.main,\s*\n\s*\.sidebar \{\s*\n\s*display: contents;/,
    )
  })

  test('orders the draft above the turn entry when a pick is pending', () => {
    const order = (selector: string) => {
      const match = css.match(
        new RegExp(`\\.draftFirst \\.${selector} \\{\\s*order:\\s*(\\d+)`),
      )
      if (!match) throw new Error(`No .draftFirst .${selector} order`)
      return Number(match[1])
    }
    expect(order('draft')).toBeLessThan(order('turn'))
  })
})

describe('sliders and page scrolling', () => {
  test('a range keeps vertical pans for the page', () => {
    expect(ruleBody('DiscreteSlider.module.css', 'range')).toMatch(
      /touch-action:\s*pan-y/,
    )
  })
})
