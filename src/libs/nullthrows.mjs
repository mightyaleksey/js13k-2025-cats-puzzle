/* @flow */

export default function nullthrows<T> (value: ?T, message?: string): T {
  if (value == null) {
    throw new Error(message ?? 'Unexpected "null" value')
  }

  return value
}
