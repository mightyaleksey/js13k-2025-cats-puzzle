/* @flow */

import { BaseState } from '../BaseState.mjs'

export class ObjectState extends BaseState {
  // position on the page
  pageX: number
  pageY: number
  // dimentions
  width: number
  height: number

  constructor () {
    super()
    // position on the page
    this.pageX = 0
    this.pageY = 0
    // dimentions
    this.width = 0
    this.height = 0
  }
}

export class RotatingObjectState extends ObjectState {
  angle: number
  // global offset helps to compensate canvas origin shift
  clientX: number
  clientY: number

  constructor () {
    super()
    this.angle = 0
    // global offset helps to compensate canvas origin shift
    this.clientX = 0
    this.clientY = 0
  }

  update (delta: number) {
    const angle = this.angle
    this.clientX = angle > 0 ? -(this.pageX + 0.5 * this.width) : 0
    this.clientY = angle > 0 ? -(this.pageY + 0.5 * this.height) : 0
  }
}
