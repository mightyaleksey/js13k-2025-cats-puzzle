/* @flow */

/**
 * This is a JavaScript port of the Emmanuel Oga's lua implementation,
 * who ported originally Robert Penner's equations for easing.
 * @see https://github.com/EmmanuelOga/easing/tree/master
 */

/**
 * Disclaimer for Robert Penner's Easing Equations license:
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Usage:
 *
 * t = time       should go from 0 to duration,
 * b = begin      value of the property being ease,
 * c = change     ending value of the property (change = ending - beginning),
 * d = duration   total time.
 */

export type EasingType = (t: number, b: number, c: number, d: number) => number

export function linear (t: number, b: number, c: number, d: number): number {
  return (c * t) / d + b
}

export function inQuad (t: number, b: number, c: number, d: number): number {
  t = t / d
  return c * t * t + b
}

export function inCubic (t: number, b: number, c: number, d: number): number {
  t = t / d
  return c * t * t * t + b
}

export function outCubic (t: number, b: number, c: number, d: number): number {
  t = t / d - 1
  return c * (t * t * t + 1) + b
}

export function inOutCubic (
  t: number,
  b: number,
  c: number,
  d: number
): number {
  t = (t / d) * 2
  if (t < 1) {
    return (c / 2) * t * t * t + b
  } else {
    t = t - 2
    return (c / 2) * (t * t * t + 2) + b
  }
}

export function inSine (t: number, b: number, c: number, d: number): number {
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b
}

export function inOutSine (t: number, b: number, c: number, d: number): number {
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b
}
