import { test } from 'node:test';
import assert from 'node:assert';
import { count } from '../src/wordCount.js';

test('word frequency counter', async (t) => {
  await t.test('empty string returns empty map', () => {
    assert.strictEqual(count('').size, 0);
  });

  await t.test('whitespace only returns empty map', () => {
    assert.strictEqual(count('   \t\n  ').size, 0);
  });

  await t.test('punctuation only returns empty map', () => {
    assert.strictEqual(count('!@#$%^&*().,;:').size, 0);
  });

  await t.test('single word', () => {
    const result = count('hello');
    assert.deepStrictEqual(result, new Map([['hello', 1]]));
  });

  await t.test('case insensitivity', () => {
    const result = count('Hello HELLO hello');
    assert.deepStrictEqual(result, new Map([['hello', 3]]));
  });

  await t.test('multiple words', () => {
    const result = count('the quick brown fox');
    assert.deepStrictEqual(result, new Map([
      ['the', 1],
      ['quick', 1],
      ['brown', 1],
      ['fox', 1]
    ]));
  });

  await t.test('repeated words', () => {
    const result = count('foo bar foo baz foo');
    assert.deepStrictEqual(result, new Map([
      ['foo', 3],
      ['bar', 1],
      ['baz', 1]
    ]));
  });

  await t.test('contractions as single words', () => {
    const result = count("don't can't won't");
    assert.deepStrictEqual(result, new Map([
      ["don't", 1],
      ["can't", 1],
      ["won't", 1]
    ]));
  });

  await t.test('hyphenated words split into separate words', () => {
    const result = count('well-known high-quality');
    assert.deepStrictEqual(result, new Map([
      ['well', 1],
      ['known', 1],
      ['high', 1],
      ['quality', 1]
    ]));
  });

  await t.test('numbers counted as words', () => {
    const result = count('2026 42 2026');
    assert.deepStrictEqual(result, new Map([
      ['2026', 2],
      ['42', 1]
    ]));
  });

  await t.test('unicode letters', () => {
    const result = count('café naïve résumé');
    assert.deepStrictEqual(result, new Map([
      ['café', 1],
      ['naïve', 1],
      ['résumé', 1]
    ]));
  });

  await t.test('punctuation stripped', () => {
    const result = count('Hello, world! How are you?');
    assert.deepStrictEqual(result, new Map([
      ['hello', 1],
      ['world', 1],
      ['how', 1],
      ['are', 1],
      ['you', 1]
    ]));
  });

  await t.test('complex mixed input', () => {
    const result = count("It's 2026. We're excited about café culture!");
    assert.deepStrictEqual(result, new Map([
      ["it's", 1],
      ['2026', 1],
      ["we're", 1],
      ['excited', 1],
      ['about', 1],
      ['café', 1],
      ['culture', 1]
    ]));
  });

  await t.test('apostrophes at word boundaries ignored', () => {
    const result = count("'hello' 'world'");
    assert.deepStrictEqual(result, new Map([
      ['hello', 1],
      ['world', 1]
    ]));
  });

  await t.test('multiple consecutive spaces', () => {
    const result = count('hello    world');
    assert.deepStrictEqual(result, new Map([
      ['hello', 1],
      ['world', 1]
    ]));
  });
});
