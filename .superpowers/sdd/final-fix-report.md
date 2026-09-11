# Final whole-branch review fixes

## Status

Implemented all requested final findings on `feat/sky-islands-dlc`.

## Changes

- Strengthened the setup toggle interaction test to prove the filled Goldsmith row disappears and all six rows are empty; retained the helper-level coin reset assertion.
- Added a real valid-form submission test using the `GameContext.Provider` pattern. It fills two names, randomizes six unique rows, enables Sky Islands, submits, and verifies `startGame` receives `expansions: { skyIslands: true }`.
- Restored `SetupScreen.randomizeCombo` to a pure functional `setMarket(current => ...)` update using the current market and enabled expansions, while retaining deal sound and animation updates.
- Documented why the Racketeering check uses `declined.at(-1)`.
- Corrected the official Russian heading to `Вендиго` in the catalog, hint, catalog expectation, design spec, and implementation plan.
- Excluded retained Escargots from later decline reminders while preserving Dwarves and the current Escargots decline-turn reminder.

## TDD evidence

### RED

Command:

`npm test -- src/ui/SetupControls.test.tsx src/game/scoringReminders.test.ts src/game/catalog.test.ts`

Result: exit 1; 3 expected failures and 45 passes:

- rapid randomization retained only one row instead of two;
- retained Escargots repeated its decline reminder on a later turn;
- catalog returned `Вендтиго` instead of `Вендиго`.

The strengthened DLC-clearing test and new setup payload integration test passed immediately because they close review coverage gaps around behavior already present.

### GREEN

Focused command:

`npm test -- src/ui/SetupControls.test.tsx src/game/scoringReminders.test.ts src/game/catalog.test.ts`

Result: exit 0; 3 files passed, 48 tests passed.

Full command:

`npm test && npm run lint && npm run build`

Result: exit 0:

- tests: 30 files passed, 214 tests passed;
- lint: completed with 2 existing Fast Refresh warnings in `src/state/GameContext.tsx`;
- build: TypeScript and Vite build completed; 647 modules transformed.

React Doctor:

`npx -y react-doctor@latest . --verbose --scope changed`

Result: exit 0 after making the state updater pure. Remaining diagnostics are the explicitly out-of-scope pool iteration suggestions and broad `LiveScreen` complexity warning.

## Files

- `src/ui/SetupScreen.tsx`
- `src/ui/SetupControls.test.tsx`
- `src/game/scoringReminders.ts`
- `src/game/scoringReminders.test.ts`
- `src/game/catalog.ts`
- `src/game/catalog.test.ts`
- `docs/superpowers/specs/2026-09-11-sky-islands-dlc-design.md`
- `docs/superpowers/plans/2026-09-11-sky-islands-dlc.md`
- `.superpowers/sdd/final-fix-report.md`

## Commit

Conventional commit: `fix: resolve final Sky Islands review findings` (the focused commit containing this report).

## Concerns

- Lint still reports two pre-existing `react(only-export-components)` warnings in `src/state/GameContext.tsx`.
- Vite reports four existing unresolved-at-build-time Unbounded font URLs, which remain runtime-resolved.
- npm reports the existing deprecated `devdir` environment configuration warning.
- React Doctor could not reach its score API, but its local scan completed successfully.
