# Sky Islands DLC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional, remembered Sky Islands expansion whose races, powers, draft pool, persisted game state, and scoring reminders activate together.

**Architecture:** Keep one complete typed catalog and mark entries by source. Filter that catalog through an `Expansions` value passed from setup into the game, draft helpers, pickers, and reminder engine. Persist setup preference separately from the saved game and infer the expansion for legacy saves containing DLC combos.

**Tech Stack:** TypeScript 6, React 19, Vitest, Testing Library, Vite, CSS modules.

## Global Constraints

- The app records player-entered totals and never resolves the physical map or awards coins automatically.
- Base-only behavior remains the default for a fresh browser.
- The setup toggle immediately persists its last value.
- Enabling Sky Islands adds 7 races and 7 powers; disabling it removes DLC rows already present in setup.
- Every scoring turn with Sky Islands enabled reminds players about fully occupied island bonuses.
- Existing stored games without expansion metadata remain compatible.

---

### Task 1: Expansion-aware catalog

**Files:**
- Modify: `src/game/catalog.ts`
- Modify: `src/game/catalog.test.ts`

**Interfaces:**
- Produces: `ExpansionId`, `Expansions`, `DEFAULT_EXPANSIONS`, `catalogFor(expansions)`, `isSkyIslandsCombo(combo)`.
- Preserves: complete `RaceId`, `PowerId`, `RACE_IDS`, `POWER_IDS`, `raceById`, `powerById`.

- [ ] **Step 1: Write failing catalog tests**

Add tests asserting the seven printed Russian race names and power names, 14/20 base counts, 21/27 enabled counts, and DLC-combo detection.

- [ ] **Step 2: Verify the catalog tests fail**

Run: `npm test -- src/game/catalog.test.ts`

Expected: FAIL because Sky Islands ids and `catalogFor` do not exist.

- [ ] **Step 3: Add expansion metadata and entries**

Add `source: 'base' | 'skyIslands'` to catalog entries, the approved names/hints/scoring metadata, and filtered catalog helpers. Keep full id arrays as the union of known tiles.

- [ ] **Step 4: Verify the catalog tests pass**

Run: `npm test -- src/game/catalog.test.ts`

Expected: all catalog tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/catalog.ts src/game/catalog.test.ts
git commit -m "feat: add Sky Islands catalog"
```

### Task 2: Persist expansion state and filter pools

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/game.test.ts`
- Modify: `src/game/storage.test.ts`
- Modify: `src/game/pool.ts`
- Modify: `src/game/pool.test.ts`
- Modify: `src/game/index.ts`

**Interfaces:**
- Consumes: `Expansions`, `DEFAULT_EXPANSIONS`, `catalogFor`, `isSkyIslandsCombo`.
- Produces: `CreateGameInput.expansions`, `Game.expansions`.
- Changes pool signatures to accept `expansions: Expansions` after existing required arguments, with a base-only default where compatibility requires it.

- [ ] **Step 1: Write failing game and pool tests**

Cover game flag round-trip, legacy base hydration, legacy DLC inference, base-only random/first-free behavior, and enabled DLC selection using deterministic RNG.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- src/game/game.test.ts src/game/storage.test.ts src/game/pool.test.ts`

Expected: FAIL because games do not store expansions and pools use every catalog id.

- [ ] **Step 3: Implement persisted expansion state**

Default new games to `{ skyIslands: false }`. Hydrate explicit metadata, or infer Sky Islands when a market/history/active/declined combo uses a DLC id.

- [ ] **Step 4: Implement expansion-aware pools**

Filter candidate ids through `catalogFor(expansions)` in `firstFreeCombo`, `randomFreeCombo`, and `randomReplacementCombo`. Keep occupied-id behavior unchanged.

- [ ] **Step 5: Verify game and pool tests pass**

Run: `npm test -- src/game/game.test.ts src/game/storage.test.ts src/game/pool.test.ts`

Expected: all selected tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/types.ts src/game/game.ts src/game/game.test.ts src/game/storage.test.ts src/game/pool.ts src/game/pool.test.ts src/game/index.ts
git commit -m "feat: persist expansion-aware game pools"
```

### Task 3: Setup preference and DLC toggle

**Files:**
- Create: `src/game/setupPreferences.ts`
- Create: `src/game/setupPreferences.test.ts`
- Modify: `src/ui/SetupScreen.tsx`
- Modify: `src/ui/SetupControls.test.tsx`
- Modify: `src/ui/MarketColumn.tsx`
- Modify: `src/ui/ComboPicker.tsx`

**Interfaces:**
- Produces: `loadExpansionPreferences(): Expansions`, `saveExpansionPreferences(expansions): void`.
- `MarketColumn` and `ComboPicker` consume an `expansions` prop and filter editors/randomizers consistently.

- [ ] **Step 1: Write failing preference and setup tests**

Test fresh-browser defaults, saved-value restoration, accessible toggle copy, and a controlled setup interaction where switching DLC off removes a DLC combo and its row coins.

- [ ] **Step 2: Verify setup tests fail**

Run: `npm test -- src/game/setupPreferences.test.ts src/ui/SetupControls.test.tsx`

Expected: FAIL because preference helpers and toggle are absent.

- [ ] **Step 3: Implement preference storage**

Use `small-world-counter.setup.expansions.v1`; parse defensively and return a fresh default on malformed data.

- [ ] **Step 4: Implement setup toggle and filtering**

Initialize from preferences, save each change, clear DLC slots when disabling, pass expansions to pool/picker, send expansions to `startGame`, and change the rules badge copy.

- [ ] **Step 5: Make market components expansion-aware**

Pass filtered ids to `firstFreeCombo`; limit select options to the enabled catalog while retaining the current value long enough for controlled updates.

- [ ] **Step 6: Verify setup tests pass**

Run: `npm test -- src/game/setupPreferences.test.ts src/ui/SetupControls.test.tsx`

Expected: all selected tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/setupPreferences.ts src/game/setupPreferences.test.ts src/ui/SetupScreen.tsx src/ui/SetupControls.test.tsx src/ui/MarketColumn.tsx src/ui/ComboPicker.tsx
git commit -m "feat: add remembered Sky Islands setup toggle"
```

### Task 4: Expansion scoring reminders and live draft

**Files:**
- Modify: `src/game/scoringReminders.ts`
- Modify: `src/game/scoringReminders.test.ts`
- Modify: `src/ui/LiveScreen.tsx`
- Modify: `src/ui/LiveScreenScore.test.tsx`

**Interfaces:**
- Extends `ReminderContext` with `expansions`, `player`, and `rivals`.
- Live draft passes `game.expansions` to replacement pools and `MarketColumn`.

- [ ] **Step 1: Write failing reminder tests**

Cover Escargots on select/expand/decline, Khans, Goldsmith, Exploring, the island reminder, active rival Scarecrows, active rival Racketeering on select, and absence of DLC reminders in base games.

- [ ] **Step 2: Verify reminder tests fail**

Run: `npm test -- src/game/scoringReminders.test.ts src/ui/LiveScreenScore.test.tsx`

Expected: FAIL because reminder context lacks game expansion and rival information.

- [ ] **Step 3: Implement own-combo and island reminders**

Use catalog scoring entries where their timing fits. Add explicit Escargot action copy, Racketeering next-pick copy, and one board reminder whenever `skyIslands` is true.

- [ ] **Step 4: Implement rival reminders**

Inspect active rival combos only: warn about Scarecrows on conquest-capable turns and Racketeering during selection. Include owner names to make reminders actionable.

- [ ] **Step 5: Wire live screen and live draft**

Pass actor/player/rivals/expansions into reminders; pass expansions to `randomReplacementCombo` and `MarketColumn`.

- [ ] **Step 6: Verify reminder and live tests pass**

Run: `npm test -- src/game/scoringReminders.test.ts src/ui/LiveScreenScore.test.tsx`

Expected: all selected tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/scoringReminders.ts src/game/scoringReminders.test.ts src/ui/LiveScreen.tsx src/ui/LiveScreenScore.test.tsx
git commit -m "feat: add Sky Islands scoring reminders"
```

### Task 5: Full verification and documentation check

**Files:**
- Modify if required by verification: files from Tasks 1–4 only.

**Interfaces:**
- Verifies the complete feature against `docs/superpowers/specs/2026-09-11-sky-islands-dlc-design.md`.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test && npm run lint && npm run build`

Expected: all tests PASS, lint exits 0, TypeScript/Vite build exits 0.

- [ ] **Step 2: Run React Doctor**

Run the project’s React Doctor skill workflow and fix only issues caused by this branch.

- [ ] **Step 3: Review the diff against the spec**

Check that all 14 DLC tile names are present, base-only defaults hold, saved games hydrate, setup preference survives reload, draft filtering is consistent, and no score is auto-awarded.

- [ ] **Step 4: Commit verification fixes if any**

```bash
git add src
git commit -m "fix: complete Sky Islands integration"
```
