# Reinforcement die design

## Goal

Give the table a reinforcement die inside the tracker, so a player short of tokens for a last conquest can roll without hunting for the physical die.

## Die

The base game die has six faces: three blank, one 1, one 2, one 3. A blank face is therefore twice as likely as any number. The tracker models the faces literally as `[0, 0, 0, 1, 2, 3]` and picks one uniformly, rather than weighting numbers, so the rule stays readable in code.

Rolling is a pure function over an injected random source. The UI owns no probability logic.

## Placement and flow

An icon-only die button lives in the live-game header next to the other header actions and is available on every live turn, including a decline turn, because the tracker does not police when the table reaches for the die.

Pressing it opens a full-screen overlay: the screen dims, a large die tumbles in the centre, then settles on the rolled face. While it tumbles the button is unavailable and the overlay ignores repeated rolls.

The result reads as a full sentence:

- blank face: `Пусто — подкрепления нет`;
- numbered face: `+N к завоеванию`.

The overlay closes with its close button, a backdrop click, or Escape. Focus returns to the die button.

## Boundaries

The roll is transient. It is not written into turn history, does not touch coins or the score breakdown, and disappears when the overlay closes. The tracker still does not resolve conquests: the player decides whether the reinforcement was enough.

## Motion

The tumble uses CSS transforms and lasts under a second. When the user prefers reduced motion the overlay opens directly on the result with no tumbling phase.

## Components

- `src/game/reinforcementDie.ts` — faces and the pure roll.
- `src/ui/ReinforcementDie.tsx` — button, overlay, and roll state, self-contained so `LiveScreen` only mounts it.

## Testing

- Unit-test that every face index maps to its printed face and that the face list holds three blanks.
- Component-test a numbered result, a blank result, the blocked repeat roll, closing with Escape, and the reduced-motion path.
- Run the full suite, lint, and build.
