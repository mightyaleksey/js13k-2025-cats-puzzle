/* @flow */

import { Touch } from '../../engine.mjs'
import { BaseState } from '../BaseState.mjs'
import { BoardState } from '../elements/BoardState.mjs'

export class GamePlayState extends BaseState {
  cursor: ?[number, number]
  board: BoardState

  enter () {
    this.cursor = null
    this.board = new BoardState()
  }

  render () {
    this.board.render()
  }

  update (delta: number) {
    this.board.update(delta)

    if (Touch.wasTouched()) {
      const cursor = this.board.mapCoords(Touch.getPosition())

      if (cursor != null && this.cursor != null) {
        this.board.swapPieces(this.cursor, cursor)
        this.cursor = null
      } else {
        this.cursor = cursor
      }
    }
  }
}
