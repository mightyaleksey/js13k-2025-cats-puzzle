/* @flow */

import { emptyFunction } from './libs/emptyFunction.mjs'

const _frameRate = 60
const _minFrameTime = 1 / _frameRate
const _maxFrameTime = 1
const _scale = 3
const _state: { buffer: HTMLCanvasElement, context: CanvasRenderingContext2D } =
  // $FlowExpectedError[incompatible-type]
  { buffer: null, context: null }

/**
 * Helper to check available space.
 * Returns virtual resolution.
 */
export const Dimentions = { width: 0, height: 0 }

export function clear () {
  const b = _state.buffer
  const c = _state.context
  c.clearRect(0, 0, b.width, b.height)
}

export function rect (
  mode: 'fill' | 'line',
  x: number,
  y: number,
  width: number,
  height: number,
  radius?: number
) {
  const c = _state.context
  c.beginPath()
  c.roundRect(
    Math.floor(x),
    Math.floor(y),
    Math.floor(width),
    Math.floor(height),
    radius ?? 0
  )
  mode === 'fill' ? c.fill() : c.stroke()
}

export function setColor (color: string, opacity?: number) {
  const c = _state.context
  c.fillStyle = color
  c.strokeStyle = color
}

export async function createEngine (
  initGame?: ?() => Promise<void>,
  updateGame?: ?(delta: number) => void,
  renderGame?: ?() => void
) {
  _updateDimentions()
  if (initGame != null) await initGame()

  // normalize input
  const render = renderGame ?? emptyFunction
  const update: (number) => void = updateGame ?? emptyFunction

  const c = _createCanvas()
  _state.buffer = c[0]
  _state.context = c[1]

  document.body?.appendChild(_state.buffer)
  ; (function gameLoop(previousFrame: number) {
    const currentFrame = _getTime()
    const elapsedTime = currentFrame - previousFrame

    if (elapsedTime >= _maxFrameTime) {
      // skip update if too much time passed
      previousFrame = currentFrame
    } else if (elapsedTime >= _minFrameTime) {
      previousFrame = currentFrame

      update(elapsedTime)
      _normalizeCanvas()
      _updateDimentions()

      clear()
      // save and restore helps to reset "translate" changes
      _state.context.save()
      render()
      _state.context.restore()
    }

    window.requestAnimationFrame(() => {
      gameLoop(previousFrame)
    })
  })(_getTime())
}

/**
 * Helpers
 */

function _createCanvas (): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  context.imageSmoothingEnabled = false
  context.font = '8px Consolas, monaco, monospace'
  context.textBaseline = 'top'

  return [canvas, context]
}

function _normalizeCanvas () {
  _state.buffer.width = window.innerWidth
  _state.buffer.height = window.innerHeight
  _state.context.scale(_scale, _scale)
}

function _getTime (): number {
  return 0.001 * Date.now()
}

function _updateDimentions () {
  Dimentions.width = Math.ceil(window.innerWidth / _scale)
  Dimentions.height = Math.ceil(window.innerHeight / _scale)
}
