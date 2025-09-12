/* @flow */

import { GamePlayState } from './states/game/GamePlayState.mjs'
import { GameStartState } from './states/game/GameStartState.mjs'
import { StateMachine } from './states/StateMachine.mjs'
import { StateStack } from './states/StateStack.mjs'

export const gameState: StateStack = new StateStack()

export function initNavigation () {
  // sets all the screens
  gameState.push(
    new StateMachine({ play: () => new GamePlayState() }).change('play')
  )

  // todo enable
  // gameState.push(new GameStartState())
}
