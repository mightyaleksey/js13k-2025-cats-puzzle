/* @flow */

import { T_MICRO_DURATION } from '../../constants.mjs'
import {
  Dimentions,
  printf,
  rect,
  setColor,
  setFont,
  Touch
} from '../../engine.mjs'
import { outCubic } from '../../libs/easing.mjs'
import { tween } from '../../libs/timer.mjs'
import { gameState } from '../../navigation.mjs'
import { BaseState } from '../BaseState.mjs'

export class GameStartState extends BaseState {
  opacity: number

  constructor () {
    super()
    this.opacity = 0.25
  }

  render () {
    const { width, height } = Dimentions
    setColor('#000', this.opacity)
    rect('fill', 0, 0, width, height)

    setColor('#a14e3d')
    setFont(36)
    printf('Cats Puzzle', 0, 0.5 * height, null, 'center')
  }

  update () {
    if (Touch.wasTouched()) {
      this._startGame()
    }
  }

  async _startGame () {
    await tween([[this, { opacity: 0 }]], T_MICRO_DURATION, outCubic)
    gameState.pop()
  }
}
