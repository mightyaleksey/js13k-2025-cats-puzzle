/* @flow */

export default function delay (wait: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000 * wait))
}
