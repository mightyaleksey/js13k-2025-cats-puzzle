/* @flow */

import emptyFunction from './libs/emptyFunction.mjs'

const _frameRate = 60
const _minFrameTime = 1 / _frameRate
const _maxFrameTime = 1
const _scale = 3
const _state: { buffer: HTMLCanvasElement, context: CanvasRenderingContext2D } =
  // $FlowExpectedError[incompatible-type]
  { buffer: null, context: null }

const _input: { touched: boolean, touches: { [string]: [number, number] } } = {
  touched: false,
  touches: {}
}

/**
 * Shared type for the mode argument to be used
 * for various shapes drawing
 */
type DrawMode = 'fill' | 'line'

/**
 * Helper to check available space.
 * Returns virtual resolution.
 */
export const Dimentions = { width: 0, height: 0 }

export const Touch = {
  getPosition (id?: ?string): ?[number, number] {
    if (id == null) id = Object.keys(_input.touches)[0]
    // $FlowExpectedError[incompatible-type]: missing null check
    return _input.touches[id] ?? null
  },

  getTouches (): $ReadOnlyArray<string> {
    return Object.keys(_input.touches)
  },

  wasTouched (): boolean {
    return _input.touched
  }
}

export function clear () {
  const b = _state.buffer
  const c = _state.context
  c.clearRect(0, 0, b.width, b.height)
}

export function circle (mode: DrawMode, x: number, y: number, radius: number) {
  const c = _state.context
  c.beginPath()
  c.arc(x, y, radius, 0, 2 * Math.PI)
  mode === 'fill' ? c.fill() : c.stroke()
}

export function ellipse (
  mode: DrawMode,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation: number
) {
  const c = _state.context
  c.beginPath()
  c.ellipse(x, y, radiusX, radiusY, (rotation * Math.PI) / 180, 0, 2 * Math.PI)
  mode === 'fill' ? c.fill() : c.stroke()
}

export function rect (
  mode: DrawMode,
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

export function rotate (degree: number) {
  const c = _state.context
  c.rotate((degree * Math.PI) / 180)
}

export function setColor (color: string, opacity?: number) {
  const c = _state.context
  c.fillStyle = color
  c.strokeStyle = color
}

export function translate (dx: number, dy: number) {
  const c = _state.context
  c.translate(Math.floor(dx), Math.floor(dy))
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
    const delta = currentFrame - previousFrame

    if (delta >= _maxFrameTime) {
      // skip update if too much time passed
      previousFrame = currentFrame
    } else if (delta >= _minFrameTime) {
      previousFrame = currentFrame

      // update game state
      update(delta)
      _normalizeCanvas()
      _updateDimentions()

      clear()
      // save and restore helps to reset "translate" changes
      _state.context.save()
      render()
      _state.context.restore()

      _input.touched = false
    }

    window.requestAnimationFrame(() => {
      gameLoop(previousFrame)
    })
  })(_getTime())

  document.addEventListener('click', onClick)
  document.addEventListener('touchstart', onTouch)
  document.addEventListener('touchmove', onTouch)
  document.addEventListener('touchend', onTouchEnd)

  function onClick (event: MouseEvent) {
    _preventDefault(event)

    if (event.button === 0) {
      _input.touched = true
      _input.touches.mouse = [event.pageX / _scale, event.pageY / _scale]
    }
  }

  function onTouch (event: TouchEvent) {
    _preventDefault(event)

    _input.touched = true

    for (let t = 0; t < event.changedTouches.length; t++) {
      const touchEvent = event.changedTouches[t]
      _input.touches[String(touchEvent.identifier)] = [
        touchEvent.pageX / _scale,
        touchEvent.pageY / _scale
      ]
    }
  }

  function onTouchEnd (event: TouchEvent) {
    _preventDefault(event)

    for (let t = 0; t < event.changedTouches.length; t++) {
      const touchEvent = event.changedTouches[t]
      delete _input.touches[String(touchEvent.identifier)]
    }
  }

  function _preventDefault (event: UIEvent) {
    event.preventDefault()
  }
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
