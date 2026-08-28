import test from 'node:test';
import assert from 'node:assert';
import { fizzbuzz, fizzbuzz_range } from '../src/fizzbuzz.js';

test('fizzbuzz returns number as string for non-divisible values', () => {
  assert.strictEqual(fizzbuzz(1), '1');
  assert.strictEqual(fizzbuzz(2), '2');
  assert.strictEqual(fizzbuzz(4), '4');
  assert.strictEqual(fizzbuzz(7), '7');
  assert.strictEqual(fizzbuzz(8), '8');
});

test('fizzbuzz returns Fizz for multiples of 3 only', () => {
  assert.strictEqual(fizzbuzz(3), 'Fizz');
  assert.strictEqual(fizzbuzz(6), 'Fizz');
  assert.strictEqual(fizzbuzz(9), 'Fizz');
  assert.strictEqual(fizzbuzz(18), 'Fizz');
  assert.strictEqual(fizzbuzz(21), 'Fizz');
});

test('fizzbuzz returns Buzz for multiples of 5 only', () => {
  assert.strictEqual(fizzbuzz(5), 'Buzz');
  assert.strictEqual(fizzbuzz(10), 'Buzz');
  assert.strictEqual(fizzbuzz(20), 'Buzz');
  assert.strictEqual(fizzbuzz(25), 'Buzz');
});

test('fizzbuzz returns FizzBuzz for multiples of 15', () => {
  assert.strictEqual(fizzbuzz(15), 'FizzBuzz');
  assert.strictEqual(fizzbuzz(30), 'FizzBuzz');
  assert.strictEqual(fizzbuzz(45), 'FizzBuzz');
  assert.strictEqual(fizzbuzz(60), 'FizzBuzz');
  assert.strictEqual(fizzbuzz(75), 'FizzBuzz');
});

test('fizzbuzz_range 1-15 produces correct sequence', () => {
  const result = fizzbuzz_range(1, 15);
  const expected = ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'];
  assert.deepStrictEqual(result, expected);
});

test('fizzbuzz_range with empty range returns empty array', () => {
  assert.deepStrictEqual(fizzbuzz_range(10, 5), []);
  assert.deepStrictEqual(fizzbuzz_range(0, -5), []);
  assert.deepStrictEqual(fizzbuzz_range(100, 50), []);
});

test('fizzbuzz_range with single element', () => {
  assert.deepStrictEqual(fizzbuzz_range(3, 3), ['Fizz']);
  assert.deepStrictEqual(fizzbuzz_range(5, 5), ['Buzz']);
  assert.deepStrictEqual(fizzbuzz_range(15, 15), ['FizzBuzz']);
  assert.deepStrictEqual(fizzbuzz_range(7, 7), ['7']);
});

test('fizzbuzz_range with negative numbers', () => {
  const result = fizzbuzz_range(-5, 0);
  const expected = ['Buzz', '-4', 'Fizz', '-2', '-1', 'FizzBuzz'];
  assert.deepStrictEqual(result, expected);
});
