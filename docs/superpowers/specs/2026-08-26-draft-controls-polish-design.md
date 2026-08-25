# Draft Controls Polish Design

## Scope

Polish setup and live-game controls without changing game rules or persisted data.

## Setup

- Rename the section heading “Колонка комбо” to “Драфт”.
- Make the first-player randomizer a 44×44 px icon-only button.
- Preserve its accessible name and add a tooltip.
- While the roulette is active, animate only the dice icon with an irregular tumble and a small vertical bounce.
- Stop the dice animation when the roulette settles.
- Under `prefers-reduced-motion: reduce`, keep the icon static.

## Draft controls

- Add hover feedback to the row selection area, randomizer, and edit button.
- Hover uses accent border, color, and a subtle warning-background tint without changing element dimensions.
- Disabled controls do not receive hover styling.
- Keep visible keyboard focus independent from hover.

## Live game

- Continue calling the sidebar section “Драфт”.
- Render each row randomizer only when that row has no combo.
- Setup continues to show randomizers for filled and empty rows so the initial draft can be rerolled freely.
- Empty live rows still disable their randomizer when no free race or power remains.

## Testing

- Static component tests verify the setup title, icon-only draw button, and conditional live randomizers.
- Browser checks verify hover styles, the running/stopped dice animation, reduced motion, and the absence of randomizers on filled live rows.
- Run the full tests, lint, build, and React Doctor after implementation.
