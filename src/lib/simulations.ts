export const GROUND = 0
export const HEAD = 1
export const TAIL = 2
export const WING = 3

export type SimulationId = 'glider'

export const SIMULATIONS: { id: SimulationId; label: string }[] = [
  { id: 'glider', label: 'Head, tail, and wing' },
]

function stepGlider(states: Uint8Array, neighbors: number[][], next: Uint8Array) {
  for (let i = 0; i < states.length; i++) {
    let heads = 0
    let tails = 0
    let wings = 0
    for (const neighbor of neighbors[i]) {
      const state = states[neighbor]
      if (state === HEAD) heads += 1
      else if (state === TAIL) tails += 1
      else if (state === WING) wings += 1
    }

    const state = states[i]
    if (state === GROUND && heads >= 1 && tails >= 1) next[i] = WING
    else if (state === GROUND && heads >= 1 && wings >= 2) next[i] = HEAD
    else if (state === HEAD && wings >= 1) next[i] = TAIL
    else if (state === HEAD) next[i] = HEAD
    else if (state === TAIL) next[i] = WING
    else next[i] = GROUND
  }
}

export function stepSimulation(
  id: SimulationId,
  states: Uint8Array,
  neighbors: number[][],
  next: Uint8Array,
) {
  if (id === 'glider') stepGlider(states, neighbors, next)
}
