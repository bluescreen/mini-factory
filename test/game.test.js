import { test } from 'node:test';
import assert from 'node:assert';
import { Game } from '../src/game.js';

test('gutter game', () => {
  const game = new Game();
  for (let i = 0; i < 20; i++) {
    game.roll(0);
  }
  assert.strictEqual(game.score(), 0);
});

test('all ones', () => {
  const game = new Game();
  for (let i = 0; i < 20; i++) {
    game.roll(1);
  }
  assert.strictEqual(game.score(), 20);
});

test('one spare', () => {
  const game = new Game();
  game.roll(5);
  game.roll(5);
  game.roll(3);
  for (let i = 0; i < 17; i++) {
    game.roll(0);
  }
  assert.strictEqual(game.score(), 16);
});

test('one strike', () => {
  const game = new Game();
  game.roll(10);
  game.roll(3);
  game.roll(4);
  for (let i = 0; i < 16; i++) {
    game.roll(0);
  }
  assert.strictEqual(game.score(), 24);
});

test('perfect game', () => {
  const game = new Game();
  for (let i = 0; i < 12; i++) {
    game.roll(10);
  }
  assert.strictEqual(game.score(), 300);
});

test('all spares with 5', () => {
  const game = new Game();
  for (let i = 0; i < 21; i++) {
    game.roll(5);
  }
  assert.strictEqual(game.score(), 150);
});

test('mixed game with strike and spare', () => {
  const game = new Game();
  game.roll(10);
  game.roll(5);
  game.roll(5);
  game.roll(3);
  game.roll(4);
  game.roll(10);
  game.roll(1);
  game.roll(2);
  for (let i = 0; i < 10; i++) {
    game.roll(0);
  }
  assert.strictEqual(game.score(), 56);
});

test('strike in 9th frame', () => {
  const game = new Game();
  for (let i = 0; i < 16; i++) {
    game.roll(0);
  }
  game.roll(10);
  game.roll(3);
  game.roll(4);
  assert.strictEqual(game.score(), 24);
});

test('strike in 10th frame', () => {
  const game = new Game();
  for (let i = 0; i < 18; i++) {
    game.roll(0);
  }
  game.roll(10);
  game.roll(5);
  game.roll(5);
  assert.strictEqual(game.score(), 20);
});

test('invalid roll negative pins', () => {
  const game = new Game();
  assert.throws(() => {
    game.roll(-1);
  }, /Invalid pin count/);
});

test('invalid roll too many pins', () => {
  const game = new Game();
  assert.throws(() => {
    game.roll(11);
  }, /Invalid pin count/);
});
