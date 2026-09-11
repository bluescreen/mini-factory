import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fizzBuzz, { fizzBuzzSingle } from '../src/fizzBuzz.js';

describe('fizzBuzzSingle', () => {
  it('returns the string representation for non-fizz/buzz inputs', () => {
    assert.equal(fizzBuzzSingle(1), '1');
    assert.equal(fizzBuzzSingle(2), '2');
    assert.equal(fizzBuzzSingle(7), '7');
  });

  it('returns "Fizz" for multiples of 3 only', () => {
    assert.equal(fizzBuzzSingle(3), 'Fizz');
    assert.equal(fizzBuzzSingle(6), 'Fizz');
  });

  it('returns "Buzz" for multiples of 5 only', () => {
    assert.equal(fizzBuzzSingle(5), 'Buzz');
    assert.equal(fizzBuzzSingle(10), 'Buzz');
  });

  it('returns "FizzBuzz" for multiples of 15', () => {
    assert.equal(fizzBuzzSingle(15), 'FizzBuzz');
    assert.equal(fizzBuzzSingle(30), 'FizzBuzz');
  });

  it('throws TypeError for non-numeric or non-integer input', () => {
    assert.throws(() => fizzBuzzSingle('3'), TypeError);
    assert.throws(() => fizzBuzzSingle(3.5), TypeError);
    assert.throws(() => fizzBuzzSingle(null), TypeError);
  });

  it('throws RangeError for input below 1', () => {
    assert.throws(() => fizzBuzzSingle(0), RangeError);
    assert.throws(() => fizzBuzzSingle(-4), RangeError);
  });
});

describe('fizzBuzz', () => {
  it('returns the expected sequence up to the limit', () => {
    assert.deepEqual(fizzBuzz(15), [
      '1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz',
      '11', 'Fizz', '13', '14', 'FizzBuzz',
    ]);
  });

  it('returns an array of strings', () => {
    const sequence = fizzBuzz(5);
    assert.ok(Array.isArray(sequence));
    assert.ok(sequence.every((entry) => typeof entry === 'string'));
  });

  it('throws TypeError for a non-integer limit', () => {
    assert.throws(() => fizzBuzz('15'), TypeError);
    assert.throws(() => fizzBuzz(15.5), TypeError);
  });

  it('throws RangeError for a limit below 1', () => {
    assert.throws(() => fizzBuzz(0), RangeError);
    assert.throws(() => fizzBuzz(-3), RangeError);
  });
});
