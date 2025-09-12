//! ZzFXM (v2.0.3) | (C) Keith Clark | MIT | https://github.com/keithclark/ZzFXM
import { zzfxG, zzfxR } from './zzfx.mjs'
/* eslint-disable */
export const zzfxM = (n, f, t, e = 125) => {
  let l
  let o
  let z
  let r
  let g
  let h
  let x
  let a
  let u
  let c
  let d
  let i
  let m
  let p
  let G
  let M = 0
  let R = []
  const b = []
  const j = []
  let k = 0
  let q = 0
  let s = 1
  const v = {}
  const w = ((zzfxR / e) * 60) >> 2
  for (; s; k++) {
    ;((R = [(s = a = d = m = 0)]),
      t.map((e, d) => {
        for (
          x = f[e][k] || [0, 0, 0],
            s |= !!f[e][k],
            G = m + (f[e][0].length - 2 - !a) * w,
            p = d == t.length - 1,
            o = 2,
            r = m;
          o < x.length + p;
          a = ++o
        ) {
          for (
            g = x[o],
              u = (o == x.length + p - 1 && p) || (c != (x[0] || 0)) | g | 0,
              z = 0;
            z < w && a;
            z++ > w - 99 && u ? (i += (i < 1) / 99) : 0
          ) {
            ;((h = ((1 - i) * R[M++]) / 2 || 0),
              (b[r] = (b[r] || 0) - h * q + h),
              (j[r] = (j[r++] || 0) + h * q + h))
          }
          g &&
            ((i = g % 1),
            (q = x[1] || 0),
            (g |= 0) &&
              (R = v[[(c = x[(M = 0)] || 0), g]] =
                v[[c, g]] ||
                ((l = [...n[c]]),
                (l[2] *= 2 ** ((g - 12) / 12)),
                g > 0 ? zzfxG(...l) : [])))
        }
        m = G
      }))
  }
  return [b, j]
}
