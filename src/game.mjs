/* @flow */

import './libs/random.mjs'

import { gameTiles } from './assets.mjs'
import { PIECE_SIZE } from './constants.mjs'
import { createEngine, genQuads, newImage } from './engine.mjs'
import { updateTimer } from './libs/timer.mjs'
import { gameState, initNavigation } from './navigation.mjs'
import { initSoundBank } from './sound.mjs'

async function initGame () {
  gameTiles.push(
    ...genQuads(await newImage('./pieces.webp'), 2 * PIECE_SIZE, 2 * PIECE_SIZE)
  )
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
