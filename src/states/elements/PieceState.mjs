/* @flow */

import { PIECE_SIZE } from '../../constants.mjs'
import { rect, setColor } from '../../engine.mjs'
import { BaseState } from '../BaseState.mjs'

const colors = [
  '#FF6300',
  '#5E2CA5',
  '#357EDD',
  '#137752',
  '#00449E',
  '#E7040F',
  '#001B44'
]

export class PieceState extends BaseState {
  id: number
  clientX: number
  clientY: number
  offsetX: number
  offsetY: number
  x: number
  y: number

  constructor (x: number, y: number, id: number) {
    super()
    this.id = id
    // virtual coordinates on the board
    this.x = x
    this.y = y

    this.clientX = this.x * PIECE_SIZE
    this.clientY = this.y * PIECE_SIZE
    // top left corner offset for rendering
    this.offsetX = 0
    this.offsetY = 0
  }

  render () {
    setColor(colors[this.id])
    rect(
      'fill',
      this.offsetX + this.clientX + 1,
      this.offsetY + this.clientY + 1,
      PIECE_SIZE - 2,
      PIECE_SIZE - 2,
      2
    )
  }

  toJSON (): $ReadOnly<{ x: number, y: number, id: number }> {
    return { x: this.x, y: this.y, id: this.id }
  }
}
