---
name: small-world-rules
description: Applies official Small World (Days of Wonder, 2018) base-game rules to this score tracker. Use when changing scoring, draft/market, decline, turn order, race/power effects, setup, or when the user asks about Small World rules.
---

# Small World rules for this tracker

Small World is a trademark of Days of Wonder, Inc. Official product page: https://www.daysofwonder.com/game/small-world/

This companion **does not resolve conquests**. Players play on the physical board; the app records picks, coins, and decline. Never invent map resolution, token counts, or bonuses the table did not report.

## When to load more

For turn structure, the combo column, decline, scoring, and race/power effects, read [reference.md](reference.md).

## App mapping (do not break)

| Table rule | Code |
|---|---|
| 2–5 players | `createGame` |
| Turns: 2p→10, 3–4p→9, 5p→8 | `defaultTurnCount` |
| Start with 5 coins | `STARTING_COINS` |
| Six visible race+power combos | `MARKET_SIZE`, `takeSlot` |
| Combo cost = index; coins on skipped rows stay | `takeSlot` paid/taken |
| Clockwise from first player | `currentActor` + `firstPlayerIndex` |
| First pick is `select`; later expand **or** decline | `TurnAction` |
| Decline turn: no conquests, then score | action `decline` |
| Next turn after decline: pick a new combo | `awaitingSelect` |
| One in-decline race unless Spirit | `nextDeclined`, `isSpiritPower` |
| Wiped in-decline race (second decline, or later: 0 tokens) returns race+power to stacks | `occupiedCombos`, `wipeDeclinedCombo` |
| Dwarves keep mine bonus in decline | `scoresInDecline` on dwarves |
| Hidden coins until the end | `scoreHidden` |

## Guardrails

- Do not copy or ship the official rules PDF. Link the publisher.
- Do not auto-award race/power bonuses: the player types the turn total (optional breakdown).
- A race/power still on the table (column, active, or currently in decline) cannot be dealt again. When an in-decline race is replaced (except Spirit) or later wiped because it has no tokens left, its banner and power return to the stacks (`occupiedCombos`, `wipeDeclinedCombo`). Token counts are not in v1; `wipeDeclinedCombo` is the hook.
- Stout decline-after-scoring and Ghoul in-decline conquests are table-side; the tracker only needs the coins and whether a new combo is selected.
- Official winner tie-break (most tokens on the board) is not in v1; do not fake it.
