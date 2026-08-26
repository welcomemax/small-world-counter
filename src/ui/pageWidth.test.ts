import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

/** Every screen shares one content zone, so pages cannot drift apart in width. */
const CONTAINERS = [
  { name: 'setup form', file: 'SetupScreen.module.css', selector: 'form' },
  { name: 'live layout', file: 'LiveScreen.module.css', selector: 'layout' },
  { name: 'analytics page', file: 'AnalyticsScreen.module.css', selector: 'page' },
  { name: 'footer', file: 'AppFooter.module.css', selector: 'footer' },
]

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

describe('page content zone', () => {
  test('is declared once as shared variables', () => {
    const root = read('../index.css')
    expect(root).toMatch(/--page-max:/)
    expect(root).toMatch(/--page-pad:/)
    expect(read('../App.css')).toMatch(/width:\s*min\(var\(--page-max\)/)
  })

  test.each(CONTAINERS)('$name pads with the shared gutter', ({ file, selector }) => {
    expect(ruleBody(file, selector)).toMatch(/padding:[^;]*var\(--page-pad\)/)
  })

  test.each(CONTAINERS)('$name sets no width of its own', ({ file, selector }) => {
    const body = ruleBody(file, selector)
    expect(body).not.toMatch(/(^|[^-])width:/)
    expect(body).not.toMatch(/margin:\s*0 auto/)
  })
})
