/* @flow */

import { PIECE_SIZE } from '../../constants.mjs'
import { Dimentions, line, rect, setColor } from '../../engine.mjs'
import { BaseState } from '../BaseState.mjs'

const y0 = 0.2 * PIECE_SIZE
const y1 = 0.8 * PIECE_SIZE
const y2 = 1.5 * PIECE_SIZE

const patternWidth = 2 * PIECE_SIZE
const rows = [y0, y1, y2]
const scratches = [
  [y1 + 1, y0 + 4, y1 + 4, y0 + 3],
  [y1 + 3, y1 - 4, y1 + 7, y1 - 4],

  [y2 + 1, y2 - 6, y2 + 4, y2 - 7],
  [y2, y2 - 4, y2 + 6, y2 - 4],
  [y2 + 8, y2 - 3, y2 + 16, y2 - 3],

  [y0, y2 + 14, y1, y2 + 14]
]

export class BgState extends BaseState {
  render () {
    const { width, height } = Dimentions
    setColor('#e8ad90')
    rect('fill', 0, 0, width, height)

    for (let x = 0; x < width + patternWidth; x += patternWidth) {
      for (let y = 0; y < height + patternWidth; y += patternWidth) {
        this._drawPattern(x, y)
      }
    }
  }

  _drawPattern (x: number, y: number) {
    setColor('#8f5f4f')
    rows.forEach((offsetY) => {
      line(x, y + offsetY, patternWidth, y + offsetY)
    })

    setColor('#f4bba0')
    scratches.forEach((c) => line(x + c[0], y + c[1], x + c[2], y + c[3]))
  }
}
