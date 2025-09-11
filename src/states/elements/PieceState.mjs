/* @flow */

import { PIECE_SIZE } from '../../constants.mjs'
import { rect, setColor } from '../../engine.mjs'
import { ObjectState } from './ObjectState.mjs'

const colors = [
  '#FF6300',
  '#5E2CA5',
  '#357EDD',
  '#137752',
  '#00449E',
  '#E7040F',
  '#001B44'
]

export class PieceState extends ObjectState {
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
    // global offset helps to compensate canvas origin shift
    this.clientX = 0
    this.clientY = 0
    // offset related to the board based on virtual coordinates
    this.offsetX = 0
    this.offsetY = 0
    // virtual coordinates on the board
    this.x = x
    this.y = y

    this.width = PIECE_SIZE
    this.height = PIECE_SIZE
    this._updateOffset()
  }

  render () {
    setColor(colors[this.id])
    rect(
      'fill',
      this.clientX + this.pageX + this.offsetX + 1,
      this.clientY + this.pageY + this.offsetY + 1,
      this.width - 2,
      this.height - 2,
      2
    )
  }

  toJSON (): $ReadOnly<{ x: number, y: number, id: number }> {
    return { x: this.x, y: this.y, id: this.id }
  }

  _updateOffset () {
    this.offsetX = this.x * this.width
    this.offsetY = this.y * this.height
  }
}
