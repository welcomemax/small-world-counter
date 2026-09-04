# Small World base rules (2018) — tracker reference

Source: *Small World* rules booklet, Days of Wonder, 2018 (`7901-SW-rules-EN-2018`). This is a working digest for the companion, not a substitute for the official booklet.

Designer: Philippe Keyaerts. Art: Miguel Coimbra. Graphic design: Cyrille Daujean. © 2009–2018 Days of Wonder, Inc.

Official page: https://www.daysofwonder.com/game/small-world/

## Setup

- Choose the map whose player-count icon matches the table (2 / 3 / 4 / 5).
- Game Turn marker on the first space. Game length is the last space on **that** map: 10 / 9 / 9 / 8 turns.
- Shuffle race banners and power badges. Lay a column of **6** visible combos (five pairs plus the pair on top of the stacks).
- Lost Tribe tokens on Lost Tribe symbols; Mountain tokens on mountains.
- Each player starts with **five 1-value Victory coins**. Coins stay hidden until the end.

First player in the boxed game is “most pointed ears”; this app lets the table roll or pick.

## Object

Conquer regions, score 1 coin per occupied region at end of turn (plus printed bonuses), and know when to send a race **In Decline** so a new combo can expand. Most coins after the last round wins. Official tie-break: most race tokens still on the board (active + in decline).

## Combo column

- Top combo is free. Each step down costs **one extra coin**, paid by dropping 1 coin on **every combo above** the chosen one.
- Coins sitting on the chosen combo are **taken**.
- After a pick, combos slide up; a new pair is revealed so **six** remain visible (until banners/powers run out).
- Tokens in hand = race number + power number. Physical token supply is a hard cap.

This app’s draft is a mirror of the table: edit or randomize rows, then pick by index so `takeSlot` applies paid/taken.

## Turn 1 (everyone)

1. Pick a combo.
2. First conquest must enter via a **border** region (unless a power says otherwise, e.g. Halflings, Flying).
3. Conquer adjacent regions (2 tokens + 1 per defender/marker). Seas/lakes are illegal unless Seafaring.
4. Optional last attack: if ≥1 token left and short by ≤3, roll the reinforcement die (0–3).
5. Redeploy freely among owned regions; leave ≥1 token per region.
6. Score.

## Later turns

Either:

- **Expand:** leave 1 token per region, take the rest in hand, conquer, redeploy, score; or abandon regions (empty regions score nothing; abandoning **all** means the next entry is a first conquest).
- **Decline:** flip the banner, discard the power (exceptions printed on the power, e.g. Spirit), leave **one** in-decline token per owned region, return extras to the tray. **No conquests this turn.** Score 1/region for the new in-decline tokens; printed bonuses usually stop.

Only **one** in-decline race at a time: an older in-decline race is wiped when a new one declines, except Spirit (Spirit never counts toward that limit). The wiped banner and special power return to their stacks and may appear in the column again. If every in-decline token of a race is eliminated, that race returns immediately even if it was the only one in decline (token counts are not tracked in the app yet). Next turn: pick a new combo as on turn 1, then score **both** the new active race and leftover in-decline regions.

## Combat leftovers

Defender discards 1 token (Elves keep all) and redeploys the rest at the end of the attacker’s turn. A lone Lost Tribe or in-decline token is just discarded. You may attack your own in-decline tokens.

## Scoring

- 1 coin per region with your active tokens.
- 1 coin per region with your in-decline tokens.
- Active race + power bonuses **unless** the banner/badge says they work in decline (Dwarves mines; Troll lairs stay as defense; Seafaring keeps seas/lakes; Fortresses keep the +1 defense but not the coin, etc.).
- This app records whatever total the table counted. Optional fields: active regions, decline regions, bonuses.

## Races (banner value = token count)

| Race | Tokens | Effect that matters at the table |
|---|---|---|
| Amazons | 15 | +4 tokens exist only for conquest; remove 4 after redeploy, return them when readying troops. |
| Dwarves | 8 | +1/mine, **kept in decline**. |
| Elves | 11 | Do not discard a token when conquered. |
| Ghouls | 10 | All tokens stay in decline and may still conquer (before the active race). |
| Giants | 11 | −1 cost vs regions next to a mountain you occupy. |
| Halflings | 11 | Enter anywhere; 2 Holes-in-the-Ground (immune) until decline/abandon. |
| Humans | 10 | +1/farmland. |
| Orcs | 10 | +1 per non-empty region conquered this turn. |
| Ratmen | 13 | No racial power. |
| Skeletons | 20 | +1 token per 2 non-empty conquests this turn, at redeploy. |
| Sorcerers | 18 | Once/turn/opponent: replace a lone adjacent **active** enemy token from the tray. Elves still lose that token. |
| Tritons | 11 | −1 cost on coastal regions. |
| Trolls | 10 | Lair in each occupied region: +1 defense, stays in decline until abandon/conquer. |
| Wizards | 10 | +1/magic region. |

Non-empty region = at least one Lost Tribe or race token. A mountain with no tokens is empty.

## Powers (badge value = extra tokens)

Alchemist +2/turn while active. Berserk: die before every conquest. Bivouacking: 5 encampments as +1 defense, gone in decline. Commando −1 conquest cost. Diplomat: peace with one unattacked opponent until your next turn (not vs in-decline Ghouls). Dragon Master: one region with 1 token + dragon immunity. Flying: any land region, no adjacency. Forest/Hill/Swamp +1 per matching terrain. Fortified: 1 fortress/turn, +1 coin while active, +1 defense even in decline. Heroic: 2 immune regions. Merchant +1 per occupied region. Mounted −1 on hill/farmland. Pillaging +1 per non-empty conquest this turn. Seafaring: seas/lake as 3 empty regions, kept in decline. Spirit: in-decline race does not use the single-decline slot. Stout: may decline at end of a normal conquest turn after scoring. Underworld −1 on caverns; all caverns adjacent. Wealthy: +7 once, end of first turn.

## This app must not simulate

Token math, die rolls, diplomat, dragon/heroes/holes, Ghouls’ extra conquests, Stout timing, or map adjacency. Those stay on the table; the tracker stores names, the six-row draft, turn actions, and coin totals.
