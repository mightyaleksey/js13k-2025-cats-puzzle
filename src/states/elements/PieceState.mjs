/* @flow */

import { gameTiles } from '../../assets.mjs'
import { PIECE_SIZE } from '../../constants.mjs'
import { draw, rect, setColor } from '../../engine.mjs'
import { RotatingObjectState } from './ObjectState.mjs'

export class PieceState extends RotatingObjectState {
  id: number
  offsetX: number
  offsetY: number
  x: number
  y: number

  constructor (x: number, y: number, id: number) {
    super()
    this.id = id
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
    const pageX = this.clientX + this.pageX + this.offsetX
    const pageY = this.clientY + this.pageY + this.offsetY

    setColor('#EACD95')
    rect('fill', pageX + 1, pageY + 1, this.width - 2, this.height - 2, 2)
    setColor('#FEE7BC')
    rect('line', pageX + 1, pageY + 1, this.width - 2, this.height - 2, 2)

    draw(gameTiles[this.id], pageX, pageY, this.width, this.height)
  }

  toJSON (): $ReadOnly<{ x: number, y: number, id: number }> {
    return { x: this.x, y: this.y, id: this.id }
  }

  _updateOffset () {
    this.offsetX = this.x * this.width
    this.offsetY = this.y * this.height
  }
}
