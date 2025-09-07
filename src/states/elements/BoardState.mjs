/* @flow */

import { PIECE_SIZE } from '../../constants.mjs'
import { Dimentions, rect, setColor } from '../../engine.mjs'
import nullthrows from '../../libs/nullthrows.mjs'
import { random } from '../../libs/random.mjs'
import { BaseState } from '../BaseState.mjs'
import { PieceState } from './PieceState.mjs'

const siblingCoords = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
]

export class BoardState extends BaseState {
  maxIDs: number
  minMoves: number

  width: number
  height: number
  pieces: Array<Array<?PieceState>>

  constructor (width?: number, height?: number) {
    super()
    this.width = width ?? 5
    this.height = height ?? 5
    this.pieces = []

    this.maxIDs = 3
    this.minMoves = 2
    this._genBoard()
  }

  render () {
    const { width, height } = Dimentions
    const w = this.width * PIECE_SIZE
    const h = this.height * PIECE_SIZE
    const offsetX = 0.5 * (width - w)
    const offsetY = 0.5 * (height - h)
    // render background
    setColor('#19A974')
    rect('fill', offsetX, offsetY, w, h, 2)

    this.pieces.forEach((row) =>
      row.forEach((piece) => {
        if (piece == null) return
        piece.offsetX = offsetX
        piece.offsetY = offsetY
        piece.render()
      }))
  }

  update () {}

  _genBoard () {
    const pieces = (this.pieces = [])

    for (let y = 0; y < this.height; ++y) {
      // create empty row
      pieces.push([])

      for (let x = 0; x < this.width; ++x) {
        pieces[y].push(new PieceState(x, y, random(this.maxIDs)))
      }
    }

    while (this._getMatches().length > 0 || !this._hasMoves(this.minMoves)) {
      this._genBoard()
    }
  }

  _getMatches (): Array<PieceState> {
    // check if we have horizontal or vertical sequence of 3 or more pieces
    const matches: Array<PieceState> = []

    for (let t = 0; t < 2; ++t) {
      const my = t === 0 ? this.height : this.width
      const mx = t === 0 ? this.width : this.height

      for (let y = 0; y < my; ++y) {
        // ideally we should check if tile is available, however, subsequent tile
        // checks will invalide count (if tile does not match) and we need to get
        // at least 3 existing tiles in a row to add it to the list
        let counter = 1
        let lastID = this._getTile(0, y, t)?.id

        for (let x = 1; x < mx; ++x) {
          const tile = this._getTile(x, y, t)

          if (tile?.id === lastID) {
            counter++
          } else {
            counter = 1
            lastID = tile?.id
          }

          if (counter === 3) {
            matches.push(nullthrows(this._getTile(x - 2, y, t)))
            matches.push(nullthrows(this._getTile(x - 1, y, t)))
          }

          if (counter >= 3) {
            matches.push(nullthrows(tile))
          }
        }
      }
    }

    return matches
  }

  _getTile (x: number, y: number, transpose: number): ?PieceState {
    const ox = transpose === 0 ? x : y
    const oy = transpose === 0 ? y : x

    if (ox < 0 || ox >= this.width || oy < 0 || oy >= this.height) {
      return null
    }

    return this.pieces[oy][ox]
  }

  _hasMoves (minMoves: number): boolean {
    let moves = 0

    for (let y = 0; y < this.height; ++y) {
      let lastID = this._getTile(0, y, 0)?.id

      for (let x = 1; x < this.width; ++x) {
        const tile = this._getTile(x, y, 0)

        if (tile?.id === lastID) {
          if (
            this._hasSiblingPieces(x - 2, y, tile.id) ||
            this._hasSiblingPieces(x + 1, y, tile.id)
          ) {
            moves++
          }

          if (moves === minMoves) {
            return true
          }
        } else {
          lastID = tile?.id
        }
      }
    }

    return false
  }

  _hasSiblingPieces (x: number, y: number, id: number): boolean {
    // assuming that one of the pieces will be part of sequence
    // we need to check that we have at least two pieces of matching ID
    let counter = 0

    siblingCoords.forEach((p) => {
      const tile = this._getTile(p[0], p[1], 0)
      if (tile?.id === id) counter++
    })

    return counter > 1
  }
}
