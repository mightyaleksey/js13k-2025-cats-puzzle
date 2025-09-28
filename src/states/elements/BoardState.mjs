/* @flow */

import { PIECE_SIZE, SIBLING_PIECE_COORDS } from '../../constants.mjs'
import {
  Dimentions,
  rect,
  restore,
  setColor,
  wasResized
} from '../../engine.mjs'
import { NO_PIECE_FOUND } from '../../libs/error.mjs'
import nullthrows from '../../libs/nullthrows.mjs'
import { random } from '../../libs/random.mjs'
import { RotatingObjectState } from './ObjectState.mjs'
import { PieceState } from './PieceState.mjs'
import { SelectionState } from './SelectionState.mjs'

export class BoardState extends RotatingObjectState {
  // challenge
  expectedIDs: number
  expectedMoves: number

  columns: number
  rows: number
  table: Array<Array<?PieceState>>

  selection: SelectionState

  constructor (columns?: number, rows?: number, ids?: number, moves?: number) {
    super()

    // challenge
    this.expectedIDs = ids ?? 3
    this.expectedMoves = moves ?? 2

    this.columns = columns ?? 6
    this.rows = rows ?? 5
    this.table = []

    this.selection = new SelectionState()

    this._updateDimentions()
    this._updatePagePosition()
  }

  render () {
    const isPosUpdated = wasResized()
    if (isPosUpdated) {
      this._updatePagePosition()
    }

    super.render()

    const pageX = this.clientX + this.pageX
    const pageY = this.clientY + this.pageY
    const width = this.columns * PIECE_SIZE
    const height = this.rows * PIECE_SIZE

    setColor('#BE8353')
    rect('fill', pageX, pageY, width, height, 2)

    this.table.forEach((row) =>
      row.forEach((piece) => {
        if (piece == null) return

        piece.clientX = this.clientX
        piece.clientY = this.clientY
        piece.render()

        if (isPosUpdated) {
          piece.pageX = this.pageX
          piece.pageY = this.pageY
        }
      }))

    this.selection.render()
    restore()
  }

  update (delta: number) {
    super.update(delta)
    this.selection.update(delta)
  }

  // mainly for debug (can be removed for production)
  toJSON (): $ReadOnlyArray<$ReadOnlyArray<?number>> {
    return this.table.map((row) => row.map((piece) => piece?.id ?? null))
  }

  _genBoard () {
    const table = this.table
    table.length = 0

    for (let y = 0; y < this.rows; ++y) {
      table.push([])
      for (let x = 0; x < this.columns; ++x) {
        table[y].push(this._genPiece(x, y))
      }
    }

    while (this._getMatches().length > 0 || !this._hasMoves()) {
      this._genBoard()
    }
  }

  _genPiece (x: number, y: number): PieceState {
    const piece = new PieceState(x, y, random(this.expectedIDs))
    piece.pageX = this.pageX
    piece.pageY = this.pageY
    return piece
  }

  _getPiece (x: number, y: number, transpose: number): ?PieceState {
    const ox = transpose === 0 ? x : y
    const oy = transpose === 0 ? y : x

    if (ox < 0 || ox >= this.columns || oy < 0 || oy >= this.rows) {
      return null
    }

    return this.table[oy][ox]
  }

  _hasPiece (x: number, y: number): boolean {
    return this._getPiece(x, y, 0) != null
  }

  _removePieces (pieces: $ReadOnlyArray<PieceState>) {
    pieces.forEach((piece) => {
      this.table[piece.y][piece.x] = null
    })
  }

  _clearSelection () {
    this.selection.target = null
  }

  _getSelection (): ?PieceState {
    return this.selection.target
  }

  _updateSelection (x: number, y: number) {
    this.selection.target = this._getPiece(x, y, 0)
  }

  _getFallingPieces (): $ReadOnlyArray<?$ReadOnlyArray<PieceState>> {
    // detect gaps and update coordinates of pieces to a new position
    const pieces = this.table
    const falling = Array(this.rows + 1).fill(null)

    for (let x = 0; x < this.columns; ++x) {
      let space = 0

      for (let y = this.rows - 1; y >= 0; --y) {
        const piece = this._getPiece(x, y, 0)

        if (piece == null) {
          space++
        } else if (space > 0) {
          piece.y += space
          pieces[y + space][x] = piece
          pieces[y][x] = null

          if (falling[space] == null) falling[space] = []
          falling[space].push(piece)
        }
      }

      for (let k = 0; k < space; ++k) {
        const piece = this._genPiece(x, k)
        piece.offsetY -= space * PIECE_SIZE
        pieces[piece.y][piece.x] = piece

        if (falling[space] == null) falling[space] = []
        falling[space].push(piece)
      }
    }

    return falling
  }

  _getMatches (): $ReadOnlyArray<PieceState> {
    // check if we have horizontal or vertical sequence of 3 or more pieces
    const matches: Array<PieceState> = []

    for (let t = 0; t < 2; ++t) {
      const my = t === 0 ? this.rows : this.columns
      const mx = t === 0 ? this.columns : this.rows

      for (let y = 0; y < my; ++y) {
        // ideally we should check if tile is available, however, subsequent tile
        // checks will invalide count (if tile does not match) and we need to get
        // at least 3 existing tiles in a row to add it to the list
        let counter = 1
        let lastID = this._getPiece(0, y, t)?.id

        for (let x = 1; x < mx; ++x) {
          const tile = this._getPiece(x, y, t)

          if (tile?.id === lastID) {
            counter++
          } else {
            counter = 1
            lastID = tile?.id
          }

          if (counter === 3) {
            matches.push(
              nullthrows(this._getPiece(x - 2, y, t), NO_PIECE_FOUND)
            )
            matches.push(
              nullthrows(this._getPiece(x - 1, y, t), NO_PIECE_FOUND)
            )
          }

          if (counter >= 3) {
            matches.push(nullthrows(tile, NO_PIECE_FOUND))
          }
        }
      }
    }

    return matches
  }

  _hasMoves (): boolean {
    let moves = 0

    for (let y = 0; y < this.rows; ++y) {
      let lastID = this._getPiece(0, y, 0)?.id

      for (let x = 1; x < this.columns; ++x) {
        const tile = this._getPiece(x, y, 0)

        if (tile?.id === lastID) {
          if (
            this._hasSiblingPieces(x - 2, y, tile.id) ||
            this._hasSiblingPieces(x + 1, y, tile.id)
          ) {
            moves++
          }

          if (moves === this.expectedMoves) {
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

    SIBLING_PIECE_COORDS.forEach((p) => {
      const tile = this._getPiece(p[0], p[1], 0)
      if (tile?.id === id) counter++
    })

    return counter > 1
  }

  _toVirtualCoords (coords: ?[number, number]): ?[number, number] {
    if (coords == null) return null

    // todo check borders
    const x = Math.min(
      Math.floor(Math.max(coords[0] - this.pageX, 0) / PIECE_SIZE),
      this.columns
    )
    const y = Math.min(
      Math.floor(Math.max(coords[1] - this.pageY, 0) / PIECE_SIZE),
      this.rows
    )

    return [x, y]
  }

  _transpose () {
    // update table to match current angle
    const angle = (this.angle + 360) % 360
    if (angle === 0) return

    const rows = angle === 180 ? this.rows : this.columns
    const columns = angle === 180 ? this.columns : this.rows
    const table = Array(rows)
      .fill(0)
      .map(() => Array(columns).fill(null))

    this.table.forEach((row, y) =>
      row.forEach((piece, x) => {
        const tx = this._transposeX(x, y, angle)
        const ty = this._transposeY(x, y, angle)
        table[ty][tx] = piece

        if (piece != null) {
          piece.x = tx
          piece.y = ty
        }
      }))

    this.table.length = 0
    this.table = table

    this.columns = columns
    this.rows = rows
    this._updateDimentions()
    this._updatePagePosition()

    table.forEach((row) =>
      row.forEach((piece) => {
        if (piece == null) return
        piece.pageX = this.pageX
        piece.pageY = this.pageY
        piece._updateOffset()
      }))

    this.angle = 0
  }

  _transposeX (x: number, y: number, angle: number): number {
    switch (angle) {
      case 90:
        return this.rows - y - 1
      case 180:
        return this.columns - x - 1
      case 270:
        return y
      default:
        return x
    }
  }

  _transposeY (x: number, y: number, angle: number): number {
    switch (angle) {
      case 90:
        return x
      case 180:
        return this.rows - y - 1
      case 270:
        return this.columns - x - 1
      default:
        return y
    }
  }

  _updateDimentions () {
    this.width = this.columns * PIECE_SIZE
    this.height = this.rows * PIECE_SIZE
  }

  _updatePagePosition () {
    // should be called after dimentions
    this.pageX = 0.5 * (Dimentions.width - this.width)
    this.pageY = 0.5 * (Dimentions.height - this.height)
  }
}
