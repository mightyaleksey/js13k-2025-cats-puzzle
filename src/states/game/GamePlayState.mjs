/* @flow */

import { PIECE_SIZE } from '../../constants.mjs'
import { rect, setColor, Touch } from '../../engine.mjs'
import nullthrows from '../../libs/nullthrows.mjs'
import { BaseState } from '../BaseState.mjs'
import { BoardState } from '../elements/BoardState.mjs'
import type { PieceState } from '../elements/PieceState.mjs'

/**
 * How to handle input
 *  _______________
 * |               |
 * | select piece  |
 * |_______________|
 *         |
 *  _______|_______      ________________
 * |               |    |                |
 * |  has cursor   |----| update cursor  |
 * |_______________| no |________________|
 *         | yes
 *  _______|_______      ________________
 * |               |    |                |
 * | has selection |----| make selection |
 * |_______________| no |________________|
 *         | yes
 *  _______|_______
 * |               |      note: cursor step is mainly
 * |   validate    |      required for the keyboard input
 * |_______________|
 *         |
 *  _______|_______
 * |               |
 * |  swap pieces  |
 * |_______________|
 *
 */

export class GamePlayState extends BaseState {
  // state
  cursor: [number, number]
  interactive: boolean
  selectedPiece: ?PieceState
  // elements
  board: BoardState

  enter () {
    this.cursor = [-1, -1]
    this.interactive = true
    this.selectedPiece = null

    this.board = new BoardState()
  }

  render () {
    this.board.render()

    // render selection
    const selectedPiece = this.selectedPiece
    if (selectedPiece != null) {
      setColor('#E7040F')
      rect(
        'line',
        this.board.offsetX + selectedPiece.x * PIECE_SIZE,
        this.board.offsetY + selectedPiece.y * PIECE_SIZE,
        PIECE_SIZE,
        PIECE_SIZE,
        2
      )
    }
  }

  update (delta: number) {
    this.board.update(delta)

    if (Touch.wasTouched()) {
      const cursor = this.board.mapCoords(Touch.getPosition())

      if (cursor != null) {
        this.cursor[0] = cursor[0]
        this.cursor[1] = cursor[1]
        this._handleInput()
      }
    }
  }

  _canMove (targetPiece: PieceState): boolean {
    // check matches after changing pieces position
    const selectedPiece = nullthrows(this.selectedPiece)
    const pieces = this.board.pieces
    // temporary update board matrix
    pieces[targetPiece.y][targetPiece.x] = selectedPiece
    pieces[selectedPiece.y][selectedPiece.x] = targetPiece

    const matches = this.board._getMatches()
    // restore board matrix
    pieces[targetPiece.y][targetPiece.x] = targetPiece
    pieces[selectedPiece.y][selectedPiece.x] = selectedPiece

    return matches.length > 0
  }

  _handleInput () {
    if (this.selectedPiece != null) {
      const deltaX = this.selectedPiece.x - this.cursor[0]
      const deltaY = this.selectedPiece.y - this.cursor[1]

      if (deltaX === 0 && deltaY === 0) {
        // reset selection
        this.selectedPiece = null
        return
      }

      const eligiblePositionForMove = Math.abs(deltaX) + Math.abs(deltaY) === 1
      const targetPiece = this.board._getTile(this.cursor[0], this.cursor[1], 0)

      if (
        targetPiece != null &&
        eligiblePositionForMove &&
        this._canMove(targetPiece)
      ) {
        // swap pieces
        this._swapPieces(targetPiece)
      }
    } else {
      const piece = this.board._getTile(this.cursor[0], this.cursor[1], 0)
      this.selectedPiece = piece
    }
  }

  _swapPieces (targetPiece: PieceState) {
    const selectedPiece = nullthrows(this.selectedPiece)
    const pieces = this.board.pieces

    // swap pieces
    pieces[targetPiece.y][targetPiece.x] = selectedPiece
    pieces[selectedPiece.y][selectedPiece.x] = targetPiece

    // update virtual coordinates
    const tempX = targetPiece.x
    const tempY = targetPiece.y
    targetPiece.x = selectedPiece.x
    targetPiece.y = selectedPiece.y
    selectedPiece.x = tempX
    selectedPiece.y = tempY

    this.selectedPiece = null
  }
}
