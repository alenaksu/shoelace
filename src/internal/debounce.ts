// @debounce decorator
//
// Delays the execution until the provided delay in milliseconds has
// passed since the last time the function has been called.
//
//
// Usage:
//
//  @debounce(1000)
//  handleInput() {
//    ...
//  }
//

import type { ReactiveElement } from 'lit';

export const debounce = (delay: number) => {
  let timerId: number;
  return (_target: ReactiveElement, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const superFn = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (...args: unknown[]) {
      clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        superFn.apply(this, args);
      }, delay);
    };
  };
};
