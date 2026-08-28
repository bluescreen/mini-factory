import { test } from 'node:test';
import assert from 'node:assert';
import { encode, decode } from '../src/caesar.js';

test('encode: empty string', () => {
  assert.strictEqual(encode('', 3), '');
});

test('encode: shift by 0', () => {
  assert.strictEqual(encode('hello', 0), 'hello');
});

test('encode: shift by 26 (full rotation)', () => {
  assert.strictEqual(encode('hello', 26), 'hello');
});

test('encode: simple shift', () => {
  assert.strictEqual(encode('hello', 1), 'ifmmp');
});

test('encode: uppercase', () => {
  assert.strictEqual(encode('HELLO', 1), 'IFMMP');
});

test('encode: mixed case', () => {
  assert.strictEqual(encode('Hello', 1), 'Ifmmp');
});

test('encode: wraparound lowercase', () => {
  assert.strictEqual(encode('xyz', 3), 'abc');
});

test('encode: wraparound uppercase', () => {
  assert.strictEqual(encode('XYZ', 3), 'ABC');
});

test('encode: preserves punctuation', () => {
  assert.strictEqual(encode('hello, world!', 1), 'ifmmp, xpsme!');
});

test('encode: preserves digits', () => {
  assert.strictEqual(encode('abc123xyz', 1), 'bcd123yza');
});

test('encode: preserves spaces', () => {
  assert.strictEqual(encode('a b c', 1), 'b c d');
});

test('encode: preserves unicode', () => {
  assert.strictEqual(encode('café', 1), 'dbgé');
});

test('encode: negative shift', () => {
  assert.strictEqual(encode('ifmmp', -1), 'hello');
});

test('encode: negative shift wraparound', () => {
  assert.strictEqual(encode('abc', -1), 'zab');
});

test('encode: large shift (27)', () => {
  assert.strictEqual(encode('hello', 27), 'ifmmp');
});

test('encode: large negative shift (-27)', () => {
  assert.strictEqual(encode('hello', -27), 'gdkkn');
});

test('encode: all lowercase alphabet', () => {
  assert.strictEqual(
    encode('abcdefghijklmnopqrstuvwxyz', 1),
    'bcdefghijklmnopqrstuvwxyza'
  );
});

test('encode: all uppercase alphabet', () => {
  assert.strictEqual(
    encode('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 1),
    'BCDEFGHIJKLMNOPQRSTUVWXYZA'
  );
});

test('decode: simple decode', () => {
  assert.strictEqual(decode('ifmmp', 1), 'hello');
});

test('decode: uppercase', () => {
  assert.strictEqual(decode('IFMMP', 1), 'HELLO');
});

test('decode: mixed case', () => {
  assert.strictEqual(decode('Ifmmp', 1), 'Hello');
});

test('decode: with non-letters', () => {
  assert.strictEqual(decode('ifmmp, xpsme!', 1), 'hello, world!');
});

test('decode: wraparound', () => {
  assert.strictEqual(decode('abc', 3), 'xyz');
});

test('encode then decode roundtrip', () => {
  const text = 'The quick brown fox jumps over the lazy dog!';
  const encoded = encode(text, 7);
  const decoded = decode(encoded, 7);
  assert.strictEqual(decoded, text);
});

test('decode then encode roundtrip', () => {
  const text = 'Pack my box with five dozen liquor jugs';
  const decoded = decode(text, 5);
  const encoded = encode(decoded, 5);
  assert.strictEqual(encoded, text);
});
