/* @flow */

import {
  PIECE_SIZE,
  T_MACRO_DURATION,
  T_MICRO_DURATION
} from '../../constants.mjs'
import { Touch } from '../../engine.mjs'
import delay from '../../libs/delay.mjs'
import { inOutCubic } from '../../libs/easing.mjs'
import nullthrows from '../../libs/nullthrows.mjs'
import { random, shuffle } from '../../libs/random.mjs'
import { tween } from '../../libs/timer.mjs'
import { playSound } from '../../sound.mjs'
import { BaseState } from '../BaseState.mjs'
import { BgState } from '../elements/BgState'
import { BoardState } from '../elements/BoardState.mjs'
import { InfoState } from '../elements/InfoState.mjs'
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

const angles = shuffle([-270, -180, -90, 90, 180, 270])

export class GamePlayState extends BaseState {
  // state
  cursor: [number, number]
  interactive: boolean
  moves: number
  showInfo: boolean
  stepsBeforeRotation: number
  totalMatches: number
  // elements
  bg: BgState
  board: BoardState
  info: InfoState

  enter () {
    this.cursor = [-1, -1]
    this.interactive = true
    this.moves = 0
    this.showInfo = false
    this.stepsBeforeRotation = random(4, 5)
    this.totalMatches = 0

    this.bg = new BgState()
    this.board = new BoardState()
    this.board._genBoard()
    this.info = new InfoState()
    this.info._updateRotation(this.stepsBeforeRotation)
  }

  render () {
    this.bg.render()
    this.board.render()
    this.showInfo && this.info.render()
  }

  update (delta: number) {
    this.board.update(delta)

    if (!this.showInfo) {
      this.showInfo = true
    }

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
          playSound('select')
          // swap pieces
          this.interactive = false
          this.moves++
          this.info._updateMoves(this.moves)
          await this._swapPieces(targetPiece)
          await this._updateBoard()
          if (this.moves % this.stepsBeforeRotation === 0) {
            this.stepsBeforeRotation = random(4, 5)
            this.info._updateRotation(this.stepsBeforeRotation)
            // pick first angle and rotate the sequence
            const angle = nullthrows(angles.shift())
            angles.push(angle)
            await this._rotateBoard(angle)
          }
          this.interactive = true
        } else {
          playSound('error')
          board.selection.target = targetPiece
        }
      }
    } else {
      board._updateSelection(this.cursor[0], this.cursor[1])
      if (board._hasPiece(this.cursor[0], this.cursor[1])) {
        playSound('select')
      }
    }
  }

  async _rotateBoard (angle: number) {
    const multiplier = 2 * Math.floor(Math.abs(angle / 90))
    await tween(
      [[this.board, { angle }]],
      multiplier * T_MACRO_DURATION,
      inOutCubic
    )
    this.board._transpose()
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

      this.info._updateMatches(matches.length)

      // calculate matched pieces
      this.totalMatches += matches.length

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
