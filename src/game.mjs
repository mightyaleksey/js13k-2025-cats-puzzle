/* @flow */

import './libs/random.mjs'

import { createEngine } from './engine.mjs'
import { updateTimer } from './libs/timer.mjs'
import { initSoundBank } from './sound.mjs'
import { GamePlayState } from './states/game/GamePlayState.mjs'
import { StateMachine } from './states/StateMachine.mjs'
import { StateStack } from './states/StateStack.mjs'

const gameState = new StateStack()

async function initGame () {
  await initSoundBank()

  gameState.push(
    new StateMachine({ play: () => new GamePlayState() }).change('play')
  )
}

function updateGame (delta: number) {
  updateTimer(delta)
  gameState.update(delta)
}

function renderGame () {
  gameState.render()
}

createEngine(initGame, updateGame, renderGame)
