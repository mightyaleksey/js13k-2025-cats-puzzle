/* @flow */

import {
  PIECE_SIZE,
  T_MACRO_DURATION,
  T_MICRO_DURATION
} from '../../constants.mjs'
import { Dimentions, Touch } from '../../engine.mjs'
import delay from '../../libs/delay.mjs'
import { inOutCubic } from '../../libs/easing.mjs'
import nullthrows from '../../libs/nullthrows.mjs'
import { tween } from '../../libs/timer.mjs'
import { playSound } from '../../sound.mjs'
import { BaseState } from '../BaseState.mjs'
import { BgState } from '../elements/BgState'
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
  // elements
  bg: BgState
  board: BoardState

  enter () {
    this.cursor = [-1, -1]
    this.interactive = true

    this.bg = new BgState()
    const board = (this.board = new BoardState())
    board.pageX = 0.5 * (Dimentions.width - board.width)
    board.pageY = 0.5 * (Dimentions.height - board.height)
    board._genBoard()
  }

  render () {
    this.bg.render()
    this.board.render()
  }

  update (delta: number) {
    this.board.update(delta)

    if (this.interactive && Touch.wasTouched()) {
      const cursor = this.board._toVirtualCoords(Touch.getPosition())

      if (cursor != null) {
        this.cursor[0] = cursor[0]
        this.cursor[1] = cursor[1]
        this._handleInput()
      }
    }
  }

  _canMove (targetPiece: PieceState): boolean {
    // check matches after changing pieces position
    const selectedPiece = nullthrows(this.board._getSelection())
    const pieces = this.board.table
    // temporary update board matrix
    pieces[targetPiece.y][targetPiece.x] = selectedPiece
    pieces[selectedPiece.y][selectedPiece.x] = targetPiece

    const matches = this.board._getMatches()
    // restore board matrix
    pieces[targetPiece.y][targetPiece.x] = targetPiece
    pieces[selectedPiece.y][selectedPiece.x] = selectedPiece

    return matches.length > 0
  }

  async _handleInput () {
    const board = this.board
    const selectedPiece = board._getSelection()

    if (selectedPiece != null) {
      const deltaX = selectedPiece.x - this.cursor[0]
      const deltaY = selectedPiece.y - this.cursor[1]

      if (deltaX === 0 && deltaY === 0) {
        // reset selection
        board._clearSelection()
        return
      }

      const eligiblePositionForMove = Math.abs(deltaX) + Math.abs(deltaY) === 1
      const targetPiece = board._getPiece(this.cursor[0], this.cursor[1], 0)

      if (targetPiece != null) {
        if (eligiblePositionForMove && this._canMove(targetPiece)) {
          // swap pieces
          this.interactive = false
          await this._swapPieces(targetPiece)
          await this._updateBoard()
          this.interactive = true
        } else {
          playSound('selection')
          board.selection.target = targetPiece
        }
      }
    } else {
      board._updateSelection(this.cursor[0], this.cursor[1])
      if (board._hasPiece(this.cursor[0], this.cursor[1])) {
        playSound('selection')
      }
    }
  }

  async _swapPieces (targetPiece: PieceState) {
    const selectedPiece = nullthrows(this.board._getSelection())
    const pieces = this.board.table

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

    // reset
    this.board._updateSelection(-1, -1)

    await tween(
      [
        [
          selectedPiece,
          {
            offsetX: selectedPiece.x * PIECE_SIZE,
            offsetY: selectedPiece.y * PIECE_SIZE
          }
        ],
        [
          targetPiece,
          {
            offsetX: targetPiece.x * PIECE_SIZE,
            offsetY: targetPiece.y * PIECE_SIZE
          }
        ]
      ],
      T_MACRO_DURATION,
      inOutCubic
    )
  }

  async _updateBoard () {
    let matches = this.board._getMatches()
    while (matches.length > 0) {
      // remove matches
      this.board._removePieces(matches)

      playSound('match')
      await delay(0.5 * T_MICRO_DURATION)

      // let pieces fall
      const fallingPieces = this.board._getFallingPieces()
      // $FlowFixMe[incompatible-call]
      await fallingPieces.reduce((promise, pieces, space) => {
        if (pieces == null) return promise

        return tween(
          pieces.map((piece) => [piece, { offsetY: piece.y * PIECE_SIZE }]),
          space * T_MICRO_DURATION * 2
        )
      }, null)

      matches = this.board._getMatches()
    }
  }
}
