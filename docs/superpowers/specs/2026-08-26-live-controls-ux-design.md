# Live Controls UX Design

## Scope

Improve safety and consistency on the live turn screen, and refine two setup-screen controls:

- confirm before abandoning an active game;
- rename the live combo market to “Драфт” and add per-row randomization;
- reuse the setup-screen hidden-score switch on the live screen;
- make manual first-player selection compact and icon-only;
- ensure the player-name combobox closes after selecting an option.

## Live turn screen

### New-game confirmation

Clicking “Новая партия” opens an application-styled modal instead of immediately clearing the game. The modal explains that the current progress will be lost.

- “Продолжить игру” is the safe primary action and receives initial focus.
- “Начать заново” is visually destructive and calls the existing `newGame` action.
- Escape and clicking the backdrop close the modal without changing game state.
- Focus remains inside the modal while it is open and returns to “Новая партия” after cancellation.

### Draft

The sidebar heading “Колонка комбо” becomes “Драфт”. Every draft row has the same dice action used during setup.

Randomization chooses one race and one power that are absent from:

- every other draft row;
- all combos selected earlier in the game, including active and declined races.

The current row is excluded from the taken set so it can be replaced. If no free race or power remains, its randomizer is disabled. The existing deal animation provides immediate feedback.

### Hidden-score switch

Extract the setup switch into a shared accessible `ToggleSwitch` component. Setup and live screens use the same markup, dimensions, focus ring, checked animation, and reduced-motion behavior. The live variant keeps the concise “Скрытый счёт” label and explanatory copy.

## Setup screen

### Name combobox

Separate the visible label from the combobox popup container. The option list must not be nested inside a `<label>`, preventing the label’s default click behavior from reactivating the input after an option is selected.

Selecting by pointer or Enter:

1. updates the name;
2. closes the popup;
3. resets the active option;
4. leaves focus on the input for continued keyboard use.

Blur and Escape also close the popup.

### Manual first-player control

Replace the wide text control in every player row with a compact square icon button:

- unselected: outlined crown;
- selected or roulette-highlighted: filled accent crown with a small check mark;
- winner pulse remains on the surrounding row.

The button has no visible text. `aria-label`, `title`, and `aria-pressed` communicate its purpose and state. The player row reserves only enough width for the compact control.

## Testing

- Component interaction tests verify that combobox selection closes the popup.
- Randomization logic tests verify that live draft replacement excludes used combos.
- Modal tests cover cancel, Escape, backdrop, and destructive confirmation.
- Static component tests verify accessible labels and pressed state for the crown control and shared switch.
- Full test, typecheck, lint, build, React Doctor, and browser checks cover desktop and narrow layouts.
