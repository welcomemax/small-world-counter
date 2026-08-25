# Setup Screen UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the setup screen into a welcoming, low-friction landing-style flow with custom sliders, remembered name comboboxes, animated first-player roulette, and unique per-row market randomization.

**Architecture:** Keep setup state local to `SetupScreen`, extracting reusable controls and pure random/name helpers into focused modules. Persist only normalized recent names; random selection consumes the existing pool model so manually selected and generated combos share one uniqueness rule.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest, localStorage.

## Global Constraints

- Keep setup on one responsive page; desktop uses two columns and mobile stacks sections.
- Player names and all race/power IDs must remain unique in their respective scopes.
- All animations respect `prefers-reduced-motion`.
- Do not add runtime dependencies.
- Keep existing game-state storage compatible.

---

### Task 1: Recent player names

**Files:**
- Create: `src/game/recentNames.ts`
- Create: `src/game/recentNames.test.ts`

**Interfaces:**
- Produces: `loadRecentNames(): string[]`
- Produces: `saveRecentNames(names: string[]): void`
- Produces: `nameSuggestions(recent: string[], selected: string[], currentIndex: number): string[]`
- Produces: `FUNNY_NAMES: readonly string[]`

- [ ] Write tests proving trimming, case-insensitive deduplication, most-recent-first order, malformed-storage recovery, a 12-name cap, and filtering names selected by other player rows.
- [ ] Run `npx vitest run src/game/recentNames.test.ts`; expect failure because the module is absent.
- [ ] Implement versioned localStorage persistence under `small-world-counter.recent-names.v1`; catch storage and JSON failures; provide playful Russian fallback names.
- [ ] Run the focused test; expect all tests to pass.

### Task 2: Deterministic random selection helpers

**Files:**
- Modify: `src/game/pool.ts`
- Modify: `src/game/pool.test.ts`

**Interfaces:**
- Produces: `randomFreeCombo(taken: TakenIds, rng?: () => number): Combo | null`
- Produces: `randomIndex(length: number, rng?: () => number): number`

- [ ] Add tests that generated races and powers exclude taken IDs, deterministic RNG selects the expected option, and exhausted pools return `null`.
- [ ] Run `npx vitest run src/game/pool.test.ts`; expect failure for missing exports.
- [ ] Implement free-array sampling with clamped RNG indexes.
- [ ] Run the focused test; expect all tests to pass.

### Task 3: Accessible setup controls

**Files:**
- Create: `src/ui/DiscreteSlider.tsx`
- Create: `src/ui/DiscreteSlider.module.css`
- Create: `src/ui/NameCombobox.tsx`
- Create: `src/ui/NameCombobox.module.css`

**Interfaces:**
- Produces: `<DiscreteSlider label value min max onChange marks />`
- Produces: `<NameCombobox value onChange suggestions id placeholder />`

- [ ] Implement the slider as a native `input[type=range]` with a filled-track CSS variable, visible current value, endpoint/mark labels, focus styling, and keyboard behavior inherited from the native control.
- [ ] Implement an editable combobox using input + popup listbox; open on focus, filter suggestions by substring, select on pointer down, close on blur, and expose ARIA combobox/listbox attributes.
- [ ] Style both controls for the current dark theme, minimum 44px targets, and mobile widths without overflow.
- [ ] Run `npx tsc -b --noEmit` and `npx oxlint src`; expect no new diagnostics.

### Task 4: Market row randomization

**Files:**
- Modify: `src/ui/MarketColumn.tsx`
- Modify: `src/ui/MarketColumn.module.css`
- Modify: `src/ui/SetupScreen.tsx`

**Interfaces:**
- `MarketColumn` gains `onRandomize?: (index: number) => void`
- `MarketColumn` gains `randomizedIndex?: number | null`

- [ ] Add a compact dice button to each market row while retaining the edit button; provide an accessible label containing the row number.
- [ ] In `SetupScreen`, compute `takenExcept(index)`, call `randomFreeCombo`, set that slot, and use a nonce/index state to replay a short deal animation.
- [ ] Ensure randomization is unavailable when no free race or power remains and never introduces duplicates.
- [ ] Add CSS for the dice icon, card-deal pulse, visible focus, and reduced motion.
- [ ] Run pool tests and TypeScript checks.

### Task 5: Landing-style setup composition and first-player roulette

**Files:**
- Modify: `src/ui/SetupScreen.tsx`
- Modify: `src/ui/SetupScreen.module.css`

**Interfaces:**
- Setup persists names by calling `saveRecentNames` immediately before `startGame`.
- Roulette keeps the final selection uniform while visual cycling is presentation-only.

- [ ] Replace player/turn selects with `DiscreteSlider`; player changes still reset turns through `defaultTurnCount`.
- [ ] Merge name entry and first-player controls into one section. Render each player as a row with `NameCombobox`, order badge, and manual first-player button.
- [ ] Add a small dice action to the section header. On click, preselect a uniform winner, animate highlight cycling every 70–180ms with slowdown, then settle on the winner with a halo. Disable conflicting controls while rolling and clean all timers on unmount/restart.
- [ ] For reduced-motion users, choose and reveal the winner immediately.
- [ ] Recompose the page into hero, responsive two-column workspace, readiness strip, and CTA text `Играть`.
- [ ] Validate non-empty unique names and six unique race/power assignments. Readiness copy identifies the first unmet requirement.
- [ ] Run `npx vitest run`, `npx tsc -b --noEmit`, `npx oxlint src`, and `npm run build`.

### Task 6: Browser verification

**Files:**
- No production files unless verification reveals defects.

- [ ] At 1280px verify two-column composition, combobox suggestions, discrete sliders, roulette completion, per-row combo randomization, readiness state, and successful start.
- [ ] At 390px verify stacked layout, no horizontal overflow, 44px control targets, and the sticky/visible primary CTA.
- [ ] Verify reduced motion suppresses cycling/deal movement.
- [ ] Re-run all tests and production build after any fixes.
