import { random, shuffle } from './random.mjs'

import assert from 'node:assert'
import test from 'node:test'

test('random()', () => {
  const trials = Array(10)
    .fill(0)
    .map(() => random(1))

  // checks if random can generate upper boundary
  assert(trials.includes(1))
  // checks if random generates only integers
  trials.forEach((value) => assert.ok(value === 0 || value === 1))
})

test('shuffle()', () => {
  const input = [1, 2, 3, 4, 5, 6]
  const copy = input.slice()

  for (let i = 0; i < 50; ++i) {
    shuffle(input)
    // checks if shuffled array contains all the values
    copy.forEach((value) => assert.ok(input.includes(value)))
    // checks if shuffled array has the same length
    // (helps to detect if moved elem to a wrong position)
    assert.equal(input.length, copy.length, input)
  }
})
