import { linear } from './easing.mjs'

import assert from 'node:assert'
import test from 'node:test'

test('linear(t, b, c, d)', () => {
  // transition from 0 to 1
  assert.equal(linear(0, 0, 1, 5), 0)
  assert.equal(linear(1, 0, 1, 5), 0.2)
  assert.equal(linear(5, 0, 1, 5), 1)
  // transition from 2 to 4
  assert.equal(linear(0, 2, 2, 5), 2)
  assert.equal(linear(1, 2, 2, 5), 2.4)
  assert.equal(linear(5, 2, 2, 5), 4)
  // transition from 0 to -1
  assert.equal(linear(0, 0, -1, 5), 0)
  assert.equal(linear(1, 0, -1, 5), -0.2)
  assert.equal(linear(5, 0, -1, 5), -1)
})
