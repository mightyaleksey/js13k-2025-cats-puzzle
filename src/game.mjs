/* @flow */

import { createEngine, rect, setColor } from './engine.mjs'

function renderGame () {
  setColor('#00f')
  rect('line', 50, 50, 20, 20)
}

createEngine(null, null, renderGame)
