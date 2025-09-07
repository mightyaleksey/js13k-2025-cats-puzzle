import { BoardState } from './BoardState.mjs'
import { PieceState } from './PieceState.mjs'

import assert from 'node:assert'
import test from 'node:test'

function genBoard (pieces) {
  const board = new BoardState(pieces[0].length, pieces.length)
  board.pieces = pieces.map((row, y) =>
    row.map((id, x) => (id != null ? new PieceState(x, y, id) : null)))

  return board
}

test('BoardState :: _getMatches()', () => {
  const board = genBoard([[null, 1, 1, 1]])
  const matches = board._getMatches()

  assert.equal(matches.length, 3)
  assert.notEqual(matches[0], matches[1])
  assert.notEqual(matches[0], matches[2])
  assert.notEqual(matches[1], matches[2])
  matches.forEach((piece) => assert.ok(piece instanceof PieceState))
})
