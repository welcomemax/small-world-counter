# Draft Controls Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the setup draw control and Draft actions, while limiting live-game randomizers to empty rows.

**Architecture:** Keep the existing `MarketColumn` reusable by adding an explicit randomizer-visibility mode rather than inferring screen context. Drive the dice animation from the existing `isRolling` prop and keep all visual behavior in CSS Modules.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, Vitest 4, Testing Library.

## Global Constraints

- Do not change game rules or persisted data.
- Setup randomizers remain available for filled and empty rows.
- Live randomizers render only for empty rows.
- Keep 44×44 px pointer targets and accessible names.
- Respect `prefers-reduced-motion`.

---

### Task 1: Conditional Draft randomizers

**Files:**
- Modify: `src/ui/MarketColumn.tsx`
- Modify: `src/ui/SetupControls.test.tsx`
- Modify: `src/ui/LiveScreen.tsx`

**Interfaces:**
- `MarketColumn` gains `randomizeEmptyOnly?: boolean`, defaulting to `false`.
- `LiveScreen` passes `randomizeEmptyOnly`; `SetupScreen` uses the default.

- [ ] Add a failing static test that renders a market with one filled row and asserts six randomizers by default but five with `randomizeEmptyOnly`.
- [ ] Run `npx vitest run src/ui/SetupControls.test.tsx`; expect the visibility assertion to fail.
- [ ] Render the randomizer when `onRandomize && (!randomizeEmptyOnly || !slot.combo)`.
- [ ] Pass `randomizeEmptyOnly` from the live Draft.
- [ ] Re-run the focused test; expect it to pass.

### Task 2: Icon-only animated draw and hover states

**Files:**
- Modify: `src/ui/PlayerSetupCard.tsx`
- Modify: `src/ui/SetupScreen.tsx`
- Modify: `src/ui/SetupScreen.module.css`
- Modify: `src/ui/MarketColumn.module.css`
- Modify: `src/ui/SetupControls.test.tsx`

**Interfaces:**
- The draw button retains `aria-label="Случайно выбрать первого игрока"` and gains a matching `title`.
- `isRolling` adds a CSS class to the dice SVG.

- [ ] Add failing static assertions that the draw button has no visible “Бросить жребий” text, has a tooltip, and exposes a rolling dice class when `isRolling`.
- [ ] Add a failing assertion that the setup section contains the heading “Драфт” and not “Колонка комбо”.
- [ ] Run the focused test; expect the new assertions to fail.
- [ ] Remove visible draw text, size `.roll` to 44×44 px at every breakpoint, and add tooltip text.
- [ ] Add a multi-step tumble/bounce keyframe to the dice SVG while rolling; disable it under reduced motion.
- [ ] Rename the setup heading to “Драфт”.
- [ ] Add non-layout-shifting hover styles to enabled `.pick`, `.random`, and `.edit` controls.
- [ ] Re-run focused tests and `npx tsc -b`; expect both to pass.

### Task 3: Verification, commit, and local merge

**Files:**
- Verify all changed files.

- [ ] Run `npm test`, `npm run lint`, `npm run build`, and `npx -y react-doctor@latest . --verbose --scope changed`.
- [ ] Verify desktop, 390 px, and reduced-motion behavior in headless Chrome.
- [ ] Review `git status`, `git diff`, and recent commit style; exclude temporary `.tmp` assets.
- [ ] Commit all feature changes with a conventional commit describing the setup/live UX overhaul.
- [ ] Switch to `master`, merge `feat/setup-screen-ux`, and run `npm test` on the merged result.
