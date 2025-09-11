/* @flow */

import './libs/random.mjs'

import { createEngine } from './engine.mjs'
import { initSoundBank } from './sound.mjs'
import { GamePlayState } from './states/game/GamePlayState.mjs'
import { StateMachine } from './states/StateMachine.mjs'
import { StateStack } from './states/StateStack.mjs'

const gameState = new StateStack()

gameState.push(
  new StateMachine({ play: () => new GamePlayState() }).change('play')
)

async function initGame () {
  await initSoundBank()
}

function updateGame (delta: number) {
  gameState.update(delta)
}

function renderGame () {
  gameState.render()
}

createEngine(initGame, updateGame, renderGame)
