/* @flow */

import './libs/random.mjs'

import { createEngine } from './engine.mjs'
import { updateTimer } from './libs/timer.mjs'
import { gameState, initNavigation } from './navigation.mjs'
import { initSoundBank } from './sound.mjs'

async function initGame () {
  initNavigation()
  await initSoundBank()
}

function updateGame (delta: number) {
  updateTimer(delta)
  gameState.update(delta)
}

function renderGame () {
  gameState.render()
}

createEngine(initGame, updateGame, renderGame)
