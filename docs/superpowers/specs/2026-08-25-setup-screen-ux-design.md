# Setup Screen UX Design

## Goal

Make the first visit feel like a lightweight landing page: explain the product in one
sentence, reduce setup friction, and lead clearly to starting the game.

## Chosen approach

Use one responsive setup page rather than a wizard. On desktop the page has a
two-column workspace: game and players on the left, combo market on the right.
On mobile the same sections stack in task order. A wizard would reduce density but
would hide the relationship between the physical table and entered market; a dense
dashboard would be faster for returning users but less welcoming to first-time users.

## Composition

1. Compact hero with product title, one-sentence purpose, and a subtle game motif.
2. A "Партия" section with discrete custom sliders:
   - players: 2–5;
   - turns: 8–10, automatically reset to the official value when player count changes,
     but still manually adjustable.
3. A unified "Игроки и первый ход" section:
   - one player row per participant;
   - editable combobox for the name;
   - manual first-player selection on the same row;
   - a compact dice button in the section header starts the first-player roulette.
4. A "Колонка комбо" section with six rows and existing inline editors. Each row gets
   a dice button that assigns one random free race and one random free power.
5. A readiness strip immediately before the main CTA. It says exactly what remains
   incomplete. The CTA is named "Играть".

## Name combobox

Recent names are stored locally only when a game starts. Suggestions are unique,
most-recent-first, and exclude names already assigned at the current table. When
there is no history, the dropdown shows a small built-in list of playful names.
Typing any custom value remains possible. The storage schema is versioned separately
from saved games.

## Random behavior and animation

First-player roulette rapidly moves a highlight through player rows, then slows and
lands on a uniformly random player. While running, player count and roulette controls
are locked. The winner receives a short halo/pulse; reduced-motion users get an
immediate result with a static highlight.

Each market-row dice button samples independently from currently free races and powers.
The current row is excluded from the taken set while editing. Its result receives a
brief card-deal/highlight animation. Existing uniqueness filtering remains authoritative.
If either stack is exhausted, randomization is disabled with an explanatory label.

## Validation and accessibility

- Player names must be non-empty and unique.
- All six market rows must be filled with unique races and powers.
- Random controls have text alternatives and visible focus states.
- Sliders expose labels, current values, min/max, and keyboard operation.
- Animations respect `prefers-reduced-motion`.

## Testing

Add unit tests for recent-name normalization/persistence and random free-combo
selection. Keep random choice injectable for deterministic tests. Browser verification
covers desktop and mobile overflow, roulette completion, per-row market randomization,
keyboard-accessible sliders, readiness messaging, and successful game start.
