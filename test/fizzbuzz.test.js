import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fizzbuzz, fizzbuzzRange } from '../src/fizzbuzz.js';

test('fizzbuzz: multiple of 3 returns Fizz', () => {
  assert.equal(fizzbuzz(3), 'Fizz');
});

test('fizzbuzz: multiple of 5 returns Buzz', () => {
  assert.equal(fizzbuzz(5), 'Buzz');
});

test('fizzbuzz: multiple of 15 returns FizzBuzz', () => {
  assert.equal(fizzbuzz(15), 'FizzBuzz');
});

test('fizzbuzz: non-multiple returns the stringified number', () => {
  assert.equal(fizzbuzz(7), '7');
});

test('fizzbuzz: 0 is divisible by both 3 and 5, returns FizzBuzz', () => {
  assert.equal(fizzbuzz(0), 'FizzBuzz');
});

test('fizzbuzz: negative multiple of 15 returns FizzBuzz', () => {
  assert.equal(fizzbuzz(-15), 'FizzBuzz');
});

test('fizzbuzz: negative non-multiple returns the stringified number', () => {
  assert.equal(fizzbuzz(-1), '-1');
});

test('fizzbuzz: non-integer or non-number input throws TypeError', () => {
  assert.throws(() => fizzbuzz(1.5), TypeError);
  assert.throws(() => fizzbuzz(NaN), TypeError);
  assert.throws(() => fizzbuzz('3'), TypeError);
  assert.throws(() => fizzbuzz(undefined), TypeError);
});

test('fizzbuzzRange: returns the inclusive ascending range', () => {
  assert.deepEqual(fizzbuzzRange(1, 5), ['1', '2', 'Fizz', '4', 'Buzz']);
});

test('fizzbuzzRange: start > end returns an empty array', () => {
  assert.deepEqual(fizzbuzzRange(5, 1), []);
});

test('fizzbuzzRange: non-integer bounds throw TypeError', () => {
  assert.throws(() => fizzbuzzRange(1.5, 5), TypeError);
  assert.throws(() => fizzbuzzRange(1, 'x'), TypeError);
});
