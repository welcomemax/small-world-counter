# Turn score input redesign

## Goal

Make turn scoring fast on a shared touch device and remove contradictory data. The player enters a required breakdown; the app derives the turn total instead of accepting a separate authoritative total.

## Scoring model

The editable parts are:

- regions occupied by the active race;
- regions occupied by races in decline;
- bonuses from the active race, power, and allowed in-decline effects.

The displayed total is always:

`activeRegions + declineRegions + bonus`

New UI turns store all three parts and the derived `total`. Existing saved turns that contain only `total` remain valid and continue to appear as unclassified score in analytics.

The game layer accepts either a legacy total-only score or a complete itemized score. If any breakdown field is present, all three are required. It rejects negative or non-finite values and any supplied `total` that differs from the sum. This protects the invariant even if another UI calls `applyTurn`.

## Score card UX

Remove the editable “Всего монет” field and the optional `<details>` section. Show the three controls directly in the card and a prominent read-only result: “Итого: N монет”.

Active and decline regions use the existing `DiscreteSlider` visual pattern paired with an exact numeric input. The slider covers the common 0–20 range and expands its maximum to a larger manually entered value, so it never truncates a valid score. Bonus uses a compact numeric input with −/+ buttons because its value is assembled from heterogeneous rules and is less naturally scanned as a range.

On a decline turn, active regions are fixed at zero; their control is hidden and a short explanation says to count the newly declined race under “Регионы упадка”. On select and expand turns all three parts remain available because a player may score both the active race and older in-decline races.

Submitting resets all parts to zero.

## Contextual bonus reminders

Scoring reminders are structured catalog metadata, separate from general gameplay hints. A reminder contains concise Russian scoring text and an applicability condition: every active turn, first active turn only, or while in decline.

The score card resolves the relevant combo as follows:

- during `select`, use the combo currently selected in the draft column;
- during `expand`, use the player’s active combo;
- during `decline`, show only effects that still score in decline;
- also inspect retained declined races for explicit in-decline scoring effects.

Initial reminders cover every base-game effect that directly changes coin income:

- Dwarves, Humans, Orcs, Wizards;
- Alchemist, Forest, Fortified, Hill, Merchant, Pillaging, Swamp, Wealthy.

Examples include “Маги: +1 монета за каждый занятый магический регион” and “Алхимик: +2 монеты в конце каждого хода, пока раса активна”. The Wealthy reminder appears only on the turn when that combo is selected.

Reminders never calculate or award coins. Players still count the physical board and enter the resulting bonus.

## Boundaries

- Draft coin payments and coins collected from a selected row remain separate `comboCoins`; they are not part of the score breakdown.
- The app does not infer board regions, conquests, token counts, or race/power outcomes.
- Non-scoring tactical abilities do not appear beside the bonus field.
- No official booklet text or PDF is copied into the application.

## Components and helpers

- Extract score arithmetic and validation into a small game helper so UI, game logic, and tests share one definition.
- Extract the score editor from `LiveScreen` into a focused component that receives action, relevant combos, value, and `onChange`.
- Extend catalog entries with scoring-specific reminder metadata rather than hardcoding race IDs inside `LiveScreen`.
- Keep analytics backward-compatible: fully itemized new turns produce no “other” remainder; old total-only turns still do.

## Testing

- Unit-test score summation and validation, including mismatch, negative, and legacy total-only cases.
- Unit-test reminder selection for draft selection, active play, decline, and Dwarves in decline.
- Component-test automatic total updates, action-specific controls, and reset/submit behavior.
- Preserve storage and analytics tests for legacy histories.
- Run the full test suite, lint, build, React Doctor, and a browser interaction check.
