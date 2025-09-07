/* @flow */

import './libs/random.mjs'

import { createEngine } from './engine.mjs'
import { GamePlayState } from './states/game/GamePlayState.mjs'
import { StateMachine } from './states/StateMachine.mjs'
import { StateStack } from './states/StateStack.mjs'

const gameState = new StateStack()

gameState.push(
  new StateMachine({ play: () => new GamePlayState() }).change('play')
)

function renderGame () {
  gameState.render()
}

createEngine(null, null, renderGame)
