/** The base-game die: three blank faces plus 1, 2 and 3. */
export const DIE_FACES = [0, 0, 0, 1, 2, 3] as const

export type DieFace = (typeof DIE_FACES)[number]

export function rollReinforcementDie(random: () => number = Math.random): DieFace {
  const index = Math.min(
    DIE_FACES.length - 1,
    Math.max(0, Math.floor(random() * DIE_FACES.length)),
  )
  return DIE_FACES[index]!
}
