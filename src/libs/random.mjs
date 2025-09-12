/* @flow */

let _seed = 2025

export function setSeed (seed: number) {
  _seed = seed % 2147483647
  if (_seed <= 0) _seed += 2147483646
}

export function random (min: number, max?: number): number {
  if (max == null) {
    max = min
    min = 0
  }

  _seed = (_seed * 16807) % 2147483647
  const next = (_seed - 1) / 2147483646 // normalize to [0, 1)
  // generate random integer between min and max (inclusive)
  return Math.floor(next * (max - min + 1)) + min
}

// Fisher–Yates shuffle
export function shuffle<T> (sequence: Array<T>): Array<T> {
  for (let i = sequence.length - 1; i >= 1; i--) {
    const j = Math.floor(random(i))
    // $FlowExpectedError[unsupported-syntax]
    ;[sequence[i], sequence[j]] = [sequence[j], sequence[i]]
  }

  return sequence
}
