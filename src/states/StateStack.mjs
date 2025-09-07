/* @flow */

import type { State } from './BaseState.mjs'

export class StateStack {
  stack: Array<State>

  constructor () {
    this.stack = []
  }

  pop () {
    this.stack[this.stack.length - 1].exit()
    this.stack.pop()
  }

  push (state: State) {
    state.enter()
    this.stack.push(state)
  }

  render () {
    this.stack.forEach((state) => state.render())
  }

  update (dt: number) {
    this.stack[this.stack.length - 1].update(dt)
  }
}
