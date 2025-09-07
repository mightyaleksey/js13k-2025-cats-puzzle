/* @flow */

export interface State {
  enter(input: mixed): void;
  exit(): void;
  render(): void;
  update(delta: number): void;
}

export class BaseState implements State {
  enter (input: mixed) {}
  exit () {}
  render () {}
  update (delta: number) {}
}
