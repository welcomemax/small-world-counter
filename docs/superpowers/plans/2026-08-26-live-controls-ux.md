# Live Controls UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make live-game controls safer and consistent with setup, add unique draft randomization, and refine setup combobox and first-player controls.

**Architecture:** Keep game mutations in `GameContext`, place deterministic draft replacement logic in the existing pool domain module, and extract reusable UI primitives for the switch and confirmation dialog. Interaction tests use Testing Library with jsdom; domain tests remain environment-independent Vitest tests.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, Vitest 4, Testing Library, jsdom.

## Global Constraints

- Do not add runtime dependencies.
- Preserve saved-game compatibility.
- Random draft replacements must exclude every other draft combo and every combo previously selected in the game.
- All controls require keyboard behavior, visible focus, and accurate ARIA state.
- Animations must respect `prefers-reduced-motion`.
- Do not create git commits unless the user explicitly asks.

---

### Task 1: Shared hidden-score switch

**Files:**
- Create: `src/ui/ToggleSwitch.tsx`
- Create: `src/ui/ToggleSwitch.module.css`
- Modify: `src/ui/SetupScreen.tsx`
- Modify: `src/ui/SetupScreen.module.css`
- Modify: `src/ui/LiveScreen.tsx`
- Modify: `src/ui/LiveScreen.module.css`
- Modify: `src/ui/SetupControls.test.tsx`

**Interfaces:**
- Produces: `ToggleSwitch({ checked, onChange, label, description?, disabled? })`
- Consumes: native checkbox change events and existing `scoreHidden` state.

- [ ] **Step 1: Add a failing shared-control test**

Extend `src/ui/SetupControls.test.tsx`:

```tsx
import { ToggleSwitch } from './ToggleSwitch'

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
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/ui/SetupControls.test.tsx`

Expected: FAIL because `./ToggleSwitch` does not exist.

- [ ] **Step 3: Implement the shared switch**

Create a controlled component whose label wraps a visually hidden native checkbox, track, label, and optional description. Move `.switch`, `.switchTrack`, checked/focus selectors, and reduced-motion rules from `SetupScreen.module.css` into `ToggleSwitch.module.css`.

- [ ] **Step 4: Replace both screen-specific controls**

In `SetupScreen.tsx`:

```tsx
<ToggleSwitch
  checked={scoreHidden}
  label="Скрытый счёт"
  description="Не показывать итоги до конца партии"
  disabled={isRolling}
  onChange={setScoreHidden}
/>
```

In `LiveScreen.tsx`:

```tsx
<ToggleSwitch
  checked={game.scoreHidden}
  label="Скрытый счёт"
  description="Не показывать итоги до конца партии"
  onChange={toggleHidden}
/>
```

Remove `.check` and the old setup switch CSS.

- [ ] **Step 5: Verify GREEN**

Run: `npx vitest run src/ui/SetupControls.test.tsx && npx tsc -b`

Expected: all focused tests pass and TypeScript exits 0.

### Task 2: Safe new-game confirmation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/ui/ConfirmDialog.tsx`
- Create: `src/ui/ConfirmDialog.module.css`
- Create: `src/ui/ConfirmDialog.test.tsx`
- Modify: `src/ui/LiveScreen.tsx`

**Interfaces:**
- Produces: `ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel })`
- `LiveScreen` owns `confirmingNewGame: boolean`; only `onConfirm` calls `newGame()`.

- [ ] **Step 1: Add component-test dependencies**

Run: `npm install --save-dev @testing-library/react jsdom`

Expected: `package.json` and lockfile contain current compatible versions; production dependencies are unchanged.

- [ ] **Step 2: Write failing interaction tests**

Create `src/ui/ConfirmDialog.test.tsx` with `// @vitest-environment jsdom`. Render an open dialog and verify:

```tsx
expect(screen.getByRole('dialog', { name: 'Начать новую партию?' })).toBeTruthy()
expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Продолжить игру' }))

fireEvent.keyDown(document, { key: 'Escape' })
expect(onCancel).toHaveBeenCalledOnce()

fireEvent.click(screen.getByRole('button', { name: 'Начать заново' }))
expect(onConfirm).toHaveBeenCalledOnce()
```

Add separate tests proving backdrop click cancels, panel click does not, and Tab/Shift+Tab cycle between the two dialog actions.

- [ ] **Step 3: Verify RED**

Run: `npx vitest run src/ui/ConfirmDialog.test.tsx`

Expected: FAIL because `ConfirmDialog` does not exist.

- [ ] **Step 4: Implement the modal**

Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`. On open, remember `document.activeElement`, focus the safe cancel button, listen for Escape and Tab, and restore focus on cleanup. The backdrop handles cancellation only when `event.target === event.currentTarget`.

- [ ] **Step 5: Integrate with the live header**

Replace direct `onClick={newGame}` with `onClick={() => setConfirmingNewGame(true)}`. Render the dialog with:

```tsx
title="Начать новую партию?"
description="Текущий прогресс будет удалён без возможности восстановления."
cancelLabel="Продолжить игру"
confirmLabel="Начать заново"
```

Confirm closes the dialog and calls `newGame`; cancel only closes it.

- [ ] **Step 6: Verify GREEN**

Run: `npx vitest run src/ui/ConfirmDialog.test.tsx && npx tsc -b`

Expected: all modal tests pass and TypeScript exits 0.

### Task 3: Live draft randomization

**Files:**
- Modify: `src/game/pool.ts`
- Modify: `src/game/pool.test.ts`
- Modify: `src/ui/LiveScreen.tsx`

**Interfaces:**
- Produces: `randomReplacementCombo(market: ComboMarket, usedCombos: Combo[], index: number, rng?: () => number): Combo | null`
- Consumes: `randomFreeCombo`, `takenIds`, and `MarketColumn.onRandomize`.

- [ ] **Step 1: Write failing domain tests**

Create the standard six-row fixture (`humans/merchant`, `orcs/flying`,
`elves/forest`, `dwarves/hill`, `trolls/fortified`, `giants/mounted`) and pass
`amazons/alchemist` as a historical combo. Replacing row index `2` with RNG
`0` must return:

```ts
expect(randomReplacementCombo(market, usedCombos, 2, () => 0)).toEqual({
  race: 'elves',
  power: 'berserk',
})
```

The expected combo must exclude all rows except index `2` and all `usedCombos`. Add invalid-index and exhausted-pool cases expecting `null`.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/game/pool.test.ts`

Expected: FAIL because `randomReplacementCombo` is not exported.

- [ ] **Step 3: Implement deterministic replacement**

Validate the slot index, collect combos from all other slots plus `usedCombos`, call `takenIds`, then delegate to `randomFreeCombo`. Do not mutate the market.

- [ ] **Step 4: Verify domain GREEN**

Run: `npx vitest run src/game/pool.test.ts`

Expected: all pool tests pass.

- [ ] **Step 5: Wire the live Draft**

In `LiveScreen`:

- rename the heading to `Драфт`;
- add `randomizedIndex` state;
- calculate a replacement with `randomReplacementCombo(game.market, usedCombos, index)`;
- call `setMarketCombo(index, combo)` only for a non-null result;
- pass `onRandomize` and `randomizedIndex` to `MarketColumn`;
- clear/replay the existing dealt animation with a zero-delay timer and clean it up on unmount.

- [ ] **Step 6: Verify integration**

Run: `npx vitest run src/game/pool.test.ts src/ui/SetupControls.test.tsx && npx tsc -b`

Expected: focused tests and typecheck pass.

### Task 4: Closing combobox and compact crown control

**Files:**
- Modify: `src/ui/NameCombobox.tsx`
- Modify: `src/ui/NameCombobox.module.css`
- Modify: `src/ui/PlayerSetupCard.tsx`
- Modify: `src/ui/SetupScreen.module.css`
- Create: `src/ui/SetupInteractions.test.tsx`
- Modify: `src/ui/SetupControls.test.tsx`

**Interfaces:**
- `NameCombobox` keeps its public props unchanged.
- `PlayerSetupCard` keeps `onChooseFirst(index)` and exposes state through `aria-pressed`.

- [ ] **Step 1: Write a failing combobox interaction test**

In a jsdom test, render a controlled wrapper, focus the input, click “Анна”, and assert:

```tsx
expect(input.getAttribute('aria-expanded')).toBe('false')
expect(screen.queryByRole('listbox')).toBeNull()
expect(input).toHaveValue('Анна')
```

Repeat selection via ArrowDown + Enter.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/ui/SetupInteractions.test.tsx`

Expected: the pointer case reproduces the popup reopening caused by the enclosing label.

- [ ] **Step 3: Fix combobox structure**

Render a `.field` container with a separate `<label htmlFor={id}>` and sibling `.inputWrap`. Keep option mouse-down prevention so the input retains focus, and ensure `select()` closes the popup after `onChange`.

- [ ] **Step 4: Verify combobox GREEN**

Run: `npx vitest run src/ui/SetupInteractions.test.tsx`

Expected: pointer and keyboard selection tests pass.

- [ ] **Step 5: Add failing crown markup assertions**

Extend the static control test to render `PlayerSetupCard` and assert that each manual selector:

- has no visible “выбрать” or “первый” text;
- has `aria-pressed="true"` only for the selected player;
- has a state-specific `aria-label` and `title`;
- contains an SVG crown.

- [ ] **Step 6: Implement compact crown states**

Add a local `CrownIcon({ selected })`:

- outlined crown when false;
- accent-filled crown plus a small SVG check path when true.

Reduce the third player-row grid column from `4rem` to `2.75rem`; make `.firstButton` a 44×44px square; remove `<small>` rules; preserve disabled, focus-visible, roulette highlight, and winner pulse styling.

- [ ] **Step 7: Verify GREEN**

Run: `npx vitest run src/ui/SetupControls.test.tsx src/ui/SetupInteractions.test.tsx && npx tsc -b`

Expected: all setup tests and typecheck pass.

### Task 5: Full verification

**Files:**
- Verify only; fix scoped regressions in files listed above.

- [ ] **Step 1: Run automated checks**

Run:

```bash
npm test
npm run lint
npm run build
npx -y react-doctor@latest . --verbose --diff
```

Expected: tests, lint, and build exit 0; React Doctor reports no new actionable issues in changed React files.

- [ ] **Step 2: Verify desktop behavior in browser**

At 1180×900:

- select a name option and confirm the list closes;
- manually select first players and confirm crown state follows selection;
- start a game and cancel the new-game modal using button, Escape, and backdrop;
- confirm only “Начать заново” returns to setup;
- randomize several Draft rows and confirm no race or power duplicates appear;
- toggle hidden score and confirm its visual behavior matches setup.

- [ ] **Step 3: Verify narrow behavior**

At 390×844, confirm the modal fits without clipping, the crown button remains 44×44px, player-name fields do not overflow, Draft row actions remain reachable, and the shared switch wraps cleanly.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm draft deal animation and switch transitions do not animate.
