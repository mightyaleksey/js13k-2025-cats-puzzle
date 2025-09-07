/* @flow */

import { BaseState } from '../BaseState.mjs'
import { BoardState } from '../elements/BoardState.mjs'

export class GamePlayState extends BaseState {
  board: BoardState

  enter () {
    this.board = new BoardState()
  }

  render () {
    this.board.render()
  }

  update () {}
}
