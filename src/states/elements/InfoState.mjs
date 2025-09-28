/* @flow */

import { Dimentions, printf, setColor } from '../../engine.mjs'
import { BaseState } from '../BaseState.mjs'

export class InfoState extends BaseState {
  moves: number
  scores: number
  rotation: number

  constructor () {
    super()
    this.rotation = 0
    this.scores = 0
    this._updateMoves(0)
  }

  render () {
    setColor('#fff')
    printf(
      String(this.scores).padStart(7, '0'),
      5,
      16,
      Dimentions.width - 10,
      'right'
    )

    printf(
      `↺${this.rotation - this.moves}`,
      5,
      30,
      Dimentions.width - 10,
      'right'
    )
  }

  _updateMatches (matchesCount: number) {
    // it is expected to get at least 3 matches, however, if player makes more
    // in the same turn, we need to reward them accordingly

    // idea: would be interesting to test how rewarding only for "extras" would
    // work out

    // idea2: show ratio (total matches / moves) instead of scores
    this.scores += Math.floor((10 * matchesCount) / 3)
  }

  _updateMoves (moves: number) {
    this.moves = moves
  }

  _updateRotation (stepsBeforeRotation: number) {
    // a bit lazy to figure out how to next number that can be divided by
    // "stepsBeforeRotation" without remainder, thus, we will iterate next
    // 10 numbers to find it :)
    for (let i = this.moves + 1; i < this.moves + 10; ++i) {
      if (i % stepsBeforeRotation === 0) {
        this.rotation = i
        break
      }
    }
  }
}
