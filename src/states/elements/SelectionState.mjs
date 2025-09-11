/* @flow */

import { rect, setColor } from '../../engine.mjs'
import { BaseState } from '../BaseState.mjs'
import type { PieceState } from './PieceState.mjs'

export class SelectionState extends BaseState {
  target: ?PieceState

  constructor () {
    super()
    this.target = null
  }

  render () {
    const target = this.target
    if (target == null) return

    setColor('#E7040F')
    rect(
      'line',
      target.pageX + target.x * target.width,
      target.pageY + target.y * target.height,
      target.width,
      target.height,
      2
    )
  }
}
