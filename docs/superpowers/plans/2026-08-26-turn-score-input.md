# Turn Score Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace contradictory total-plus-breakdown entry with a required itemized score, an automatically derived total, touch-friendly controls, and contextual base-game scoring reminders.

**Architecture:** Put score arithmetic and validation in a pure game helper, and put structured scoring reminders in the catalog with a pure turn-context selector. A focused `TurnScoreInput` component owns presentation while `LiveScreen` selects the relevant combos and submits the derived `TurnScore`.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, Vitest, Testing Library.

## Global Constraints

- New UI turns always store `activeRegions`, `declineRegions`, `bonus`, and their derived `total`.
- Legacy `{ total }` scores remain readable and accepted.
- If any breakdown field is supplied, all three are required and must sum to `total`.
- Inputs and stored score values must be finite, non-negative integers.
- Draft payments/collections remain separate `comboCoins`.
- Reminders inform but never calculate or award bonuses.
- Do not simulate the physical board or copy the official rules PDF.
- Do not create a git commit unless the user explicitly asks.

---

### Task 1: Score arithmetic and game-layer validation

**Files:**
- Create: `src/game/score.ts`
- Create: `src/game/score.test.ts`
- Modify: `src/game/game.ts:1-21,185-210`

**Interfaces:**
- Produces: `ScoreBreakdown`
- Produces: `scoreTotal(breakdown: ScoreBreakdown): number`
- Produces: `toTurnScore(breakdown: ScoreBreakdown): TurnScore`
- Produces: `validateTurnScore(score: TurnScore): void`
- Consumed by: `applyTurn`, `TurnScoreInput`, `LiveScreen`

- [ ] **Step 1: Write failing score-helper tests**

```ts
// src/game/score.test.ts
import { describe, expect, test } from 'vitest'
import { scoreTotal, toTurnScore, validateTurnScore } from './score'

describe('turn score', () => {
  test('derives total from the complete breakdown', () => {
    const breakdown = { activeRegions: 5, declineRegions: 2, bonus: 3 }
    expect(scoreTotal(breakdown)).toBe(10)
    expect(toTurnScore(breakdown)).toEqual({ total: 10, ...breakdown })
  })

  test('accepts legacy total-only scores', () => {
    expect(() => validateTurnScore({ total: 7 })).not.toThrow()
  })

  test('rejects incomplete or contradictory itemized scores', () => {
    expect(() =>
      validateTurnScore({ total: 4, activeRegions: 3, bonus: 1 }),
    ).toThrow(/all score parts/i)
    expect(() =>
      validateTurnScore({
        total: 9,
        activeRegions: 3,
        declineRegions: 2,
        bonus: 1,
      }),
    ).toThrow(/total.*breakdown/i)
  })

  test.each([
    { total: -1 },
    { total: Number.NaN },
    { total: 1.5 },
  ])('rejects invalid coin values: $total', (score) => {
    expect(() => validateTurnScore(score)).toThrow(/non-negative integer/i)
  })
})
```

- [ ] **Step 2: Run the helper tests and verify RED**

Run: `npx vitest run src/game/score.test.ts`

Expected: FAIL because `./score` does not exist.

- [ ] **Step 3: Implement the score helper**

```ts
// src/game/score.ts
import type { TurnScore } from './types'

export type ScoreBreakdown = {
  activeRegions: number
  declineRegions: number
  bonus: number
}

const PARTS = ['activeRegions', 'declineRegions', 'bonus'] as const

function assertCoinValue(value: number): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error('Score values must be non-negative integers')
  }
}

export function scoreTotal(score: ScoreBreakdown): number {
  return score.activeRegions + score.declineRegions + score.bonus
}

export function toTurnScore(score: ScoreBreakdown): TurnScore {
  return { total: scoreTotal(score), ...score }
}

export function validateTurnScore(score: TurnScore): void {
  assertCoinValue(score.total)
  const supplied = PARTS.filter((part) => score[part] !== undefined)
  if (supplied.length === 0) return
  if (supplied.length !== PARTS.length) {
    throw new Error('All score parts are required for an itemized score')
  }
  const breakdown = {
    activeRegions: score.activeRegions!,
    declineRegions: score.declineRegions!,
    bonus: score.bonus!,
  }
  PARTS.forEach((part) => assertCoinValue(breakdown[part]))
  if (score.total !== scoreTotal(breakdown)) {
    throw new Error('Score total must equal its breakdown')
  }
}
```

- [ ] **Step 4: Enforce validation in `applyTurn`**

Import `validateTurnScore` in `src/game/game.ts` and call it before resolving or recording the turn:

```ts
export function applyTurn(game: Game, input: TurnInput): Game {
  if (isComplete(game)) {
    throw new Error('Game is already complete')
  }
  validateTurnScore(input.score)
  // existing turn resolution
}
```

- [ ] **Step 5: Run focused and game tests**

Run: `npx vitest run src/game/score.test.ts src/game/game.test.ts src/game/storage.test.ts`

Expected: PASS. Update the existing partial itemized fixture in `game.test.ts` to include `declineRegions: 0`.

### Task 2: Structured scoring reminders

**Files:**
- Modify: `src/game/catalog.ts:44-113`
- Create: `src/game/scoringReminders.ts`
- Create: `src/game/scoringReminders.test.ts`

**Interfaces:**
- Produces: `ScoringReminder = { text: string; when: 'active' | 'firstActive' | 'decline' }`
- Extends: `CatalogEntry.scoring?: ScoringReminder[]`
- Produces: `scoringRemindersForTurn(input: ReminderContext): string[]`
- Consumed by: `LiveScreen`

- [ ] **Step 1: Write failing reminder-selection tests**

```ts
// src/game/scoringReminders.test.ts
import { describe, expect, test } from 'vitest'
import { scoringRemindersForTurn } from './scoringReminders'

describe('scoring reminders', () => {
  test('uses the selected combo and includes one-time Wealthy income', () => {
    const reminders = scoringRemindersForTurn({
      action: 'select',
      activeCombo: { race: 'wizards', power: 'wealthy' },
      declined: [],
    })
    expect(reminders).toContain('Маги: +1 монета за каждый занятый магический регион.')
    expect(reminders).toContain('Богатые: +7 монет один раз, в конце первого хода.')
  })

  test('omits first-turn income while expanding', () => {
    const reminders = scoringRemindersForTurn({
      action: 'expand',
      activeCombo: { race: 'humans', power: 'wealthy' },
      declined: [],
    })
    expect(reminders).toContain('Люди: +1 монета за каждый занятый регион пашни.')
    expect(reminders.join(' ')).not.toContain('+7')
  })

  test('shows only decline-capable effects on a decline turn', () => {
    const reminders = scoringRemindersForTurn({
      action: 'decline',
      activeCombo: { race: 'dwarves', power: 'alchemist' },
      declined: [],
    })
    expect(reminders).toEqual([
      'Гномы: +1 монета за каждую занятую шахту, в том числе в упадке.',
    ])
  })

  test('includes scoring effects from retained declined races', () => {
    const reminders = scoringRemindersForTurn({
      action: 'expand',
      activeCombo: { race: 'ratmen', power: 'flying' },
      declined: [{ race: 'dwarves', power: 'spirit' }],
    })
    expect(reminders).toContain(
      'Гномы: +1 монета за каждую занятую шахту, в том числе в упадке.',
    )
  })
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npx vitest run src/game/scoringReminders.test.ts`

Expected: FAIL because the selector does not exist.

- [ ] **Step 3: Add catalog metadata**

Add to `catalog.ts`:

```ts
export type ScoringReminder = {
  text: string
  when: 'active' | 'firstActive' | 'decline'
}

export type CatalogEntry<Id extends string> = {
  // existing fields
  scoring?: ScoringReminder[]
}
```

Populate these entries:

```ts
// Races
dwarves: active + decline, '+1 ... шахту'
humans: active, '+1 ... регион пашни'
orcs: active, '+1 ... непустой регион, завоёванный в этот ход'
wizards: active, '+1 ... магический регион'

// Powers
alchemist: active, '+2 монеты в конце каждого хода'
forest: active, '+1 ... лесной регион'
fortified: active, '+1 ... крепость'
hill: active, '+1 ... холм'
merchant: active, '+1 ... занятый регион'
pillaging: active, '+1 ... непустой регион, завоёванный в этот ход'
swamp: active, '+1 ... болото'
wealthy: firstActive, '+7 монет один раз, в конце первого хода'
```

Use the exact Russian strings asserted in tests for Wizards, Wealthy, Humans, and Dwarves.

- [ ] **Step 4: Implement reminder selection**

```ts
// src/game/scoringReminders.ts
import { powerById, raceById, type ScoringReminder } from './catalog'
import type { Combo, TurnAction } from './types'

export type ReminderContext = {
  action: TurnAction
  activeCombo: Combo | null
  declined: Combo[]
}

function reminders(combo: Combo, allowed: ScoringReminder['when'][]): string[] {
  return [raceById(combo.race), powerById(combo.power)]
    .flatMap((entry) => entry.scoring ?? [])
    .filter((entry) => allowed.includes(entry.when))
    .map((entry) => entry.text)
}

export function scoringRemindersForTurn({
  action,
  activeCombo,
  declined,
}: ReminderContext): string[] {
  const current = activeCombo
    ? reminders(
        activeCombo,
        action === 'select'
          ? ['active', 'firstActive']
          : action === 'decline'
            ? ['decline']
            : ['active'],
      )
    : []
  return [
    ...current,
    ...declined.flatMap((combo) => reminders(combo, ['decline'])),
  ].filter((text, index, all) => all.indexOf(text) === index)
}
```

- [ ] **Step 5: Run catalog/reminder tests**

Run: `npx vitest run src/game/scoringReminders.test.ts`

Expected: PASS.

### Task 3: Itemized score input component

**Files:**
- Create: `src/ui/TurnScoreInput.tsx`
- Create: `src/ui/TurnScoreInput.module.css`
- Create: `src/ui/TurnScoreInput.test.tsx`
- Modify: `src/ui/DiscreteSlider.tsx:4-50`

**Interfaces:**
- Consumes: `ScoreBreakdown`, `scoreTotal`
- Produces: `TurnScoreInput({ action, value, reminders, onChange })`
- Extends: `DiscreteSlider` with optional `valueInputLabel` and exact numeric entry

- [ ] **Step 1: Write failing component tests**

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import type { ScoreBreakdown } from '../game/score'
import type { TurnAction } from '../game/types'
import { TurnScoreInput } from './TurnScoreInput'

afterEach(cleanup)

function Controlled({ action = 'expand' }: { action?: TurnAction }) {
  const [value, setValue] = useState<ScoreBreakdown>({
    activeRegions: 0,
    declineRegions: 0,
    bonus: 0,
  })
  return (
    <TurnScoreInput
      action={action}
      value={value}
      reminders={['Маги: +1 монета за каждый занятый магический регион.']}
      onChange={setValue}
    />
  )
}

describe('TurnScoreInput', () => {
  test('derives the total while editing all score parts', () => {
    render(<Controlled />)
    fireEvent.change(screen.getByLabelText('Точное число активных регионов'), {
      target: { value: '5' },
    })
    fireEvent.change(screen.getByLabelText('Точное число регионов в упадке'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить бонусы' }))
    expect(screen.getByText('Итого: 8 монет')).toBeTruthy()
  })

  test('adapts a decline turn and displays scoring reminders', () => {
    render(<Controlled action="decline" />)
    expect(screen.queryByLabelText(/активных регионов/i)).toBeNull()
    expect(screen.getByText(/считайте.*регионы в упадке/i)).toBeTruthy()
    expect(screen.getByText(/Маги: \+1 монета/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npx vitest run src/ui/TurnScoreInput.test.tsx`

Expected: FAIL because `TurnScoreInput` does not exist.

- [ ] **Step 3: Extend `DiscreteSlider` with exact entry**

Add optional `valueInputLabel?: string`. Change the outer wrapper from a `<label>` to a `<div>`, give the range input `aria-label={label}`, and render a separately labelled numeric input beside the displayed value:

```tsx
<input
  type="number"
  min={min}
  step={1}
  value={value}
  aria-label={valueInputLabel}
  onChange={(event) => onChange(parseNonNeg(event.target.value))}
/>
```

Keep the range maximum at `Math.max(max, value)`. Give the range and number inputs distinct CSS classes so existing slider styles do not target both.

- [ ] **Step 4: Implement `TurnScoreInput`**

The component must:

```tsx
export type TurnScoreInputProps = {
  action: TurnAction
  value: ScoreBreakdown
  reminders: string[]
  onChange: (value: ScoreBreakdown) => void
}
```

- Render active and decline `DiscreteSlider`s with `min={0}`, `max={20}`, marks `[0, 5, 10, 15, 20]`.
- Hide the active slider for `action === 'decline'`.
- Render bonus value with −/+ buttons and an exact non-negative numeric input.
- Render reminders in an accessible note adjacent to bonus entry.
- Render `Итого: ${scoreTotal(value)} монет` in an `output` element.
- Clamp every UI update to a non-negative integer.

- [ ] **Step 5: Style touch targets and total**

In `TurnScoreInput.module.css`:

- use a one-column grid below 720px and two columns above it;
- make −/+ buttons at least 44×44px;
- display the total in an accent-colored panel;
- keep reminders visually secondary but readable;
- preserve visible keyboard focus.

- [ ] **Step 6: Run focused UI tests**

Run: `npx vitest run src/ui/TurnScoreInput.test.tsx src/ui/SetupControls.test.tsx`

Expected: PASS, including the existing `DiscreteSlider` test.

### Task 4: Integrate itemized scoring into the live turn

**Files:**
- Modify: `src/ui/LiveScreen.tsx:1-75,151-258`
- Modify: `src/ui/LiveScreen.module.css:126-156`
- Create: `src/ui/LiveScreenScore.test.tsx`
- Modify: `src/ui/rulesCopy.ts:39-44`
- Modify: `src/analytics/charts.test.ts` or create it if absent

**Interfaces:**
- Consumes: `ScoreBreakdown`, `toTurnScore`, `scoringRemindersForTurn`, `TurnScoreInput`
- Produces: itemized `recordTurn` calls with a derived total

- [ ] **Step 1: Write a failing LiveScreen score integration test**

Use a hoisted `recordTurn` spy and mock `useGame` with a ready two-player game. Wrap `LiveScreen` in `OpenRulesProvider`.

The test must:

```tsx
fireEvent.change(screen.getByLabelText('Точное число активных регионов'), {
  target: { value: '4' },
})
fireEvent.change(screen.getByLabelText('Точное число регионов в упадке'), {
  target: { value: '1' },
})
fireEvent.click(screen.getByRole('button', { name: 'Увеличить бонусы' }))
fireEvent.click(screen.getByRole('button', { name: 'Записать ход' }))

expect(recordTurn).toHaveBeenCalledWith({
  action: 'expand',
  marketIndex: undefined,
  score: {
    total: 6,
    activeRegions: 4,
    declineRegions: 1,
    bonus: 1,
  },
})
expect(screen.getByText('Итого: 0 монет')).toBeTruthy()
```

Also test that selecting “Упадок” clears a previously entered active-region value.

- [ ] **Step 2: Run the integration test and verify RED**

Run: `npx vitest run src/ui/LiveScreenScore.test.tsx`

Expected: FAIL because `LiveScreen` still owns independent total/breakdown inputs.

- [ ] **Step 3: Replace local score state and markup**

In `LiveScreen.tsx`:

```ts
const emptyScore: ScoreBreakdown = {
  activeRegions: 0,
  declineRegions: 0,
  bonus: 0,
}

const scoringCombo =
  activeAction === 'select'
    ? game.market.slots[marketIndex]?.combo ?? null
    : player.activeCombo

const reminders = scoringRemindersForTurn({
  action: activeAction,
  activeCombo: scoringCombo,
  declined: player.declined,
})
```

Submit with `score: toTurnScore(score)`. Replace the current score card with:

```tsx
<TurnScoreInput
  action={activeAction}
  value={score}
  reminders={reminders}
  onChange={setScore}
/>
```

When choosing decline:

```ts
setAction('decline')
setScore((current) => ({ ...current, activeRegions: 0 }))
```

Delete obsolete `.card label`, `.card input`, and `.row` score-form styles only after confirming they have no other users in `LiveScreen`.

- [ ] **Step 4: Update explanatory copy**

Change `rulesCopy.ts` so it says the player enters active regions, decline regions, and bonuses; the app derives the turn total. Do not claim the app awards bonuses.

- [ ] **Step 5: Add analytics compatibility tests**

Test `scoreStackData` with:

```ts
// Legacy turn
{ total: 7 } // => other: 7

// New itemized turn
{ total: 7, activeRegions: 4, declineRegions: 1, bonus: 2 }
// => active: 4, decline: 1, bonus: 2, other: 0
```

- [ ] **Step 6: Run focused integration and analytics tests**

Run: `npx vitest run src/ui/LiveScreenScore.test.tsx src/analytics/charts.test.ts src/game/score.test.ts src/game/scoringReminders.test.ts`

Expected: PASS.

### Task 5: Full verification

**Files:**
- Review all files changed by Tasks 1–4

- [ ] **Step 1: Run the complete automated verification**

Run: `npm test && npm run lint && npm run build`

Expected: all tests pass, lint has no new errors, production build exits 0.

- [ ] **Step 2: Run React Doctor**

Run: `npx -y react-doctor@latest . --verbose --scope changed`

Expected: no new correctness or accessibility diagnostics from the score changes. Existing unrelated warnings may be documented.

- [ ] **Step 3: Verify in the browser**

On setup, start a game with a Wizards combo in the selected draft row. Confirm:

1. The score card has no editable total field.
2. Active/decline controls update the displayed total immediately.
3. The Wizards reminder appears beside Bonuses.
4. Selecting decline hides active regions and clears their contribution.
5. Submitting records the derived total and resets all parts.
6. Keyboard focus and mobile-width layout remain usable.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only requested score-input work plus the already-present uncommitted rules/footer work is listed.
