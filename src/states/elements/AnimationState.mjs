/* @flow */

import type { EasingType } from '../../libs/easing.mjs'
import { linear } from '../../libs/easing.mjs'
import emptyFunction from '../../libs/emptyFunction.mjs'
import { NO_PROP_FOUND } from '../../libs/error.mjs'
import { BaseState } from '../BaseState.mjs'

export class AnimationState extends BaseState {
  done: () => void
  duration: number
  time: number
  easing: EasingType
  props: Array<[{ ... }, string, number, number]>

  constructor () {
    super()
    this.done = emptyFunction
    this.duration = 0
    this.easing = linear
    this.props = []
    this.time = 0
  }

  update (dt: number) {
    if (this.duration === 0) return
    this.time = Math.min(this.time + dt, this.duration)

    this.props.forEach((d) => {
      // $FlowExpectedError[prop-missing]
      d[0][d[1]] = this.easing(this.time, d[2], d[3], this.duration)
    })

    if (this.time === this.duration) {
      this.duration = 0
      // $FlowExpectedError[cannot-write]: remove all elements
      this.props.length = 0
      this.done()
      this.done = emptyFunction
    }
  }

  // The word "tween" can be a verb meaning to produce intermediate frames
  // in animation to create a smooth motion, a process also called
  // inbetweening.
  async tween<T: mixed> (
    definitions: $ReadOnlyArray<[T, { [$Keys<T>]: number }]>,
    params: { easing?: EasingType, wait: number }
  ): Promise<void> {
    this.duration = params.wait
    this.easing = params.easing ?? linear
    this.time = 0

    definitions.forEach(([target, props]) => {
      // $FlowFixMe[not-an-object]
      Object.keys(props).forEach((key) => {
        // $FlowFixMe[incompatible-use]
        if (typeof target[key] !== 'number') {
          throw new Error(NO_PROP_FOUND)
        }

        // $FlowFixMe[not-an-object]
        const change = props[key] - target[key]
        // $FlowFixMe[incompatible-call]
        // $FlowFixMe[not-an-object]
        this.props.push([target, key, target[key], change])
      })
    })

    return new Promise((resolve) => {
      this.done = resolve
    })
  }
}
