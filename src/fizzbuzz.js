/**
 * FizzBuzz — ESM, Node built-ins only.
 */

/**
 * Classify a single integer per FizzBuzz rules.
 * @param {number} n
 * @returns {string}
 */
export function fizzbuzz(n) {
  if (!Number.isInteger(n)) {
    throw new TypeError(
      `fizzbuzz: expected an integer, got ${typeof n === 'number' ? n : typeof n}`
    );
  }
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return String(n);
}

/**
 * Build the inclusive FizzBuzz sequence from start to end, ascending.
 * Returns an empty array when start > end.
 * @param {number} start
 * @param {number} end
 * @returns {string[]}
 */
export function fizzbuzzRange(start, end) {
  if (!Number.isInteger(start)) {
    throw new TypeError(
      `fizzbuzzRange: expected an integer start, got ${typeof start === 'number' ? start : typeof start}`
    );
  }
  if (!Number.isInteger(end)) {
    throw new TypeError(
      `fizzbuzzRange: expected an integer end, got ${typeof end === 'number' ? end : typeof end}`
    );
  }

  const result = [];
  for (let i = start; i <= end; i += 1) {
    result.push(fizzbuzz(i));
  }
  return result;
}
