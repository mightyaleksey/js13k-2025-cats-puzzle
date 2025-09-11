/* @flow */

import type { EasingType } from './easing.mjs'
import { linear } from './easing.mjs'
import nullthrows from './nullthrows.mjs'

// target, prop, begin, change, duration
type TaskType = [
  mixed,
  string, // prop
  number, // calback id
  EasingType,
  number, // start time
  number, // begin
  number, // change
  number // duration
]

const _callbacks: Array<?() => void> = []
const _completed: Set<number> = new Set()
const _tasks: Array<TaskType> = []
let _time: number = 0

export function updateTimer (delta: number) {
  if (_tasks.length === 0) return

  _time += delta
  _tasks.forEach(([target, prop, callbackID, easing, startTime, b, c, d]) => {
    const elapsedTime = Math.min(_time - startTime, d)
    // $FlowFixMe[incompatible-use]
    target[prop] = easing(elapsedTime, b, c, d)

    if (elapsedTime === d) _completed.add(callbackID)
  })

  // clean up
  if (_completed.size > 0) {
    for (let i = _tasks.length - 1; i >= 0; --i) {
      const task = _tasks[i]
      if (_completed.has(task[2])) _tasks.splice(i, 1)
    }

    _completed.forEach((id) => nullthrows(_callbacks[id])())
    _completed.clear()
  }

  if (_tasks.length === 0) _time = 0
}

export async function tween (
  definitions: $ReadOnlyArray<[mixed, { [string]: number }]>,
  wait: number,
  easing?: EasingType
): Promise<mixed> {
  const promise = new Promise((resolve) => {
    _callbacks.push(resolve)
  })

  const callbackID = _callbacks.length - 1
  const easingFn = easing ?? linear
  definitions.forEach(([target, props]) => {
    Object.keys(props).forEach((prop) => {
      // $FlowFixMe[incompatible-use]]
      const start = target[prop]
      const end = props[prop]
      _tasks.push([
        target,
        prop,
        callbackID,
        easingFn,
        _time,
        start,
        end - start,
        wait
      ])
    })
  })

  return promise
}
