/* @flow */

export default function nullthrows<T> (value: ?T): T {
  if (value == null) {
    throw new Error('Unexpected "null" value')
  }

  return value
}
