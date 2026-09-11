# Sky Islands DLC — design

## Goal

Optionally include Small World: Sky Islands («Небесные острова») in a tracked game: 7 races, 7 powers, scoring reminders (including the island-control bonus). The table still types the coin total; the app never resolves the map.

Official product: https://www.daysofwonder.com/game/small-world-sky-islands/

## Out of scope

- Auto-awarding coins, island occupancy, or access points.
- Changing default turn count or player limits (2–5, slider 8–10 stay as they are).
- Modelling zeppelins, cannons, lightning, trade pacts, dragons, or burning regions beyond a combo `hint`.
- Other expansions.

## Approach

Each catalog entry has `source: 'base' | 'skyIslands'`. `catalogFor(expansions)` returns the races and powers allowed in the draft. Pool, randomizer, and combo picker all use that list. `raceById` / `powerById` still search the full catalog so a saved DLC game can hydrate.

## Data

`Expansions = { skyIslands: boolean }`. Missing `skyIslands` means `false`.

- `CreateGameInput.expansions` and `Game.expansions` persist with the party (same `localStorage` game key, no bump required: `hydrateGame` defaults the flag to `false`).
- If a stored game has any combo whose race or power `source` is `skyIslands`, hydrate as `skyIslands: true` even if the field was missing.
- Setup preference is a separate key, e.g. `small-world-counter.setup.expansions.v1`. Fresh browser: `{ skyIslands: false }`. Changing the toggle writes this key immediately so the next visit restores it.

## Setup UI

In section «Партия», next to «Скрытый счёт»:

- Label: «Небесные острова»
- Description: «7 рас и 7 сил дополнения в драфте»

Turning the toggle **on** only expands the pool; existing column rows stay.

Turning it **off** empties any column row whose race or power is from Sky Islands (combo and coins on that row, same as an unused slot). Randomize and edit then see only the base catalog.

`startGame` passes `expansions` into `createGame`. The badge «по правилам базы» becomes «база + Небесные острова» when the toggle is on.

## Draft and live game

`firstFreeCombo`, `randomFreeCombo`, and `randomReplacementCombo` take the enabled expansions (or the filtered id lists). `MarketColumn` / `ComboPicker` receive `expansions` from setup or from `game.expansions` so live edits cannot pick a DLC tile in a base-only game, and can pick them when DLC is on.

`RACE_IDS` / `POWER_IDS` remain the union of all known tiles (types stay complete). Filtering is a runtime concern.

## Catalog names

Printed Hobby World / Days of Wonder Russian names; English as on the official tiles.

| Id | RU | EN |
|---|---|---|
| wendigos | Вендтиго | Wendigos |
| drakons | Драконы | Drakons |
| scavengers | Падальщики | Scavengers |
| scarecrows | Пугала | Scarecrows |
| escargots | Улитки | Escargots |
| khans | Ханы | Khans |
| stormGiants | Штормовые великаны | Storm Giants |
| airborne | Воздушные | Airborne |
| racketeering | Вымогатели | Racketeering |
| zeppelined | Дирижабельные | Zeppelined |
| goldsmith | Золотоносные | Goldsmith |
| exploring | Ищущие | Exploring |
| gunner | Стрелковые | Gunner |
| haggling | Торговые | Haggling |

Non-scoring table effects go in `hint` (Airborne first-turn cheaper conquests, Zeppelined crashes, Gunner cannons, Haggling pacts, Storm Giants lightning and first conquest in the sky, Drakons, Wendigos, Scavenger leftover tokens as defense). Exploring’s “needs the Sky Islands board” is implied by the DLC toggle; no extra lock.

## Scoring reminders

`scoringRemindersForTurn` also receives `expansions` and the other players’ names + active combos.

**Own combo (same `when` rules as base):**

- Escargots, `select`: регионы в этот ход не дают монет; со следующего хода — в начале хода, не в конце. Монеты силы — по-прежнему в конце хода.
- Escargots, `expand`: монеты за регионы Улиток уже в начале хода (не в конце).
- Escargots, `decline`: регионы уже посчитаны в начале хода; в упадке регионы считаются ещё раз как обычно.
- Khans, `active`: +1 за холм или пашню, −1 за любой другой регион (не ниже 0).
- Goldsmith, `active`: +2 за шахту, −1 за любой другой регион (не ниже 0).
- Exploring, `active`: бонус = меньшее из числа регионов на земле и на небесных островах.
- Racketeering, own `decline` and the following own `select` (`awaitingSelect` after that decline): следующая связка бесплатна, с какой бы строки её ни взяли. After the pick, do not show this again (a later decline wipes non-Spirit Racketeering from `declined`).
- Scavengers, `active` only: хозяин жетонов упадка всё равно получает монету за регион, который заняли Падальщики; если это ваши же жетоны упадка — регион может дать две монеты. When Scavengers themselves decline, leftover tokens are discarded — no extra reminder.

**Opponents (current actor is not the owner):**

- Scarecrows active at the table, current `expand` or `select`: +1 из банка за каждый завоёванный регион с активными Пугалами.
- Racketeering active at the table, current `select`: игрок с Вымогателями получает из банка столько монет, сколько строк вы пропускаете.

**Board, every score while `skyIslands`:**

- +1 за каждый остров, целиком занятый одной вашей расой (активной или в упадке). Озеро занимать не обязательно.

Reminders stay unique by text. Still no automatic total.

## Tests

- Catalog: Sky Islands Russian names match the table above; `catalogFor({ skyIslands: false })` is exactly today’s 14×20; with the flag on, counts are 21 races and 27 powers.
- Pool: with DLC off, random/first free never returns a Sky Islands id; with DLC on, those ids can appear.
- `createGame` / `hydrateGame`: flag round-trips; old saves without `expansions` stay base-only unless a DLC combo is present.
- Reminders: Escargots / Khans / Goldsmith / Exploring / island bonus / Scarecrows vs opponent / Racketeering vs opponent; island bonus absent when DLC is off.
- Setup: toggle label; turning it off strips DLC rows from the draft; preference key restores the last value.

## Verification

Unit/component tests above, then full test/lint/build. In the browser: start with DLC off (base pool), turn it on (picker and randomizer include Ханы / Золотоносные), start a game and see the island reminder on score; reload and confirm the toggle and in-progress game keep the flag. Turn DLC off after filling a DLC row and confirm that row empties.
