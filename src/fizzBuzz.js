export function fizzBuzzSingle(n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new TypeError('fizzBuzzSingle expects an integer input');
  }
  if (n < 1) {
    throw new RangeError('fizzBuzzSingle expects a positive integer input');
  }
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return String(n);
}

export default function fizzBuzz(limit) {
  if (typeof limit !== 'number' || !Number.isInteger(limit)) {
    throw new TypeError('fizzBuzz expects an integer limit');
  }
  if (limit < 1) {
    throw new RangeError('fizzBuzz expects a positive integer limit');
  }
  const sequence = [];
  for (let n = 1; n <= limit; n += 1) {
    sequence.push(fizzBuzzSingle(n));
  }
  return sequence;
}
