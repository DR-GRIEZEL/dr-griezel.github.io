export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;
export const subtract = (a, b) => a - b;
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const safeDivide = (a, b) => (b === 0 ? null : a / b);
