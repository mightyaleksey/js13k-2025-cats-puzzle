/* @flow */

import {
  PIECE_SIZE,
  T_MACRO_DURATION,
  T_MICRO_DURATION
} from '../../constants.mjs'
import { rect, setColor, Touch } from '../../engine.mjs'
import delay from '../../libs/delay.mjs'
import { inOutCubic } from '../../libs/easing.mjs'
import nullthrows from '../../libs/nullthrows.mjs'
import { playSound } from '../../sound.mjs'
import { BaseState } from '../BaseState.mjs'
import { AnimationState } from '../elements/AnimationState.mjs'
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
  animation: AnimationState
  cursor: [number, number]
  interactive: boolean
  selectedPiece: ?PieceState
  // elements
  board: BoardState

  enter () {
    this.animation = new AnimationState()
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
    this.animation.update(delta)
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

  async _handleInput () {
    if (this.selectedPiece != null) {
      const deltaX = this.selectedPiece.x - this.cursor[0]
      const deltaY = this.selectedPiece.y - this.cursor[1]

      if (deltaX === 0 && deltaY === 0) {
        // reset selection
        this.selectedPiece = null
        return
      }

      const eligiblePositionForMove = Math.abs(deltaX) + Math.abs(deltaY) === 1
      const targetPiece = this.board._getPiece(
        this.cursor[0],
        this.cursor[1],
        0
      )

      if (targetPiece != null) {
        if (eligiblePositionForMove && this._canMove(targetPiece)) {
          // swap pieces
          await this._swapPieces(targetPiece)
          await this._updateBoard()
        } else {
          playSound('selection')
          this.selectedPiece = targetPiece
        }
      }
    } else {
      const piece = this.board._getPiece(this.cursor[0], this.cursor[1], 0)
      if (piece != null) {
        playSound('selection')
      }

      this.selectedPiece = piece
    }
  }

  _rotateBoard () {
    this.board.transpose()
  }

  async _swapPieces (targetPiece: PieceState) {
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

    await this.animation.tween(
      [
        [
          selectedPiece,
          {
            clientX: selectedPiece.x * PIECE_SIZE,
            clientY: selectedPiece.y * PIECE_SIZE
          }
        ],
        [
          targetPiece,
          {
            clientX: targetPiece.x * PIECE_SIZE,
            clientY: targetPiece.y * PIECE_SIZE
          }
        ]
      ],
      { easing: inOutCubic, wait: T_MACRO_DURATION }
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
        return this.animation.tween(
          pieces.map((piece) => [piece, { clientY: piece.y * PIECE_SIZE }]),
          { wait: space * T_MICRO_DURATION * 2 }
        )
      }, null)

      matches = this.board._getMatches()
    }
  }
}
