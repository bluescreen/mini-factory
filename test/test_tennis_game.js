import { test } from "node:test";
import assert from "node:assert";
import { TennisGame } from "../src/tennis_game.js";

test("TennisGame", async (t) => {
  await t.test("Love-All at start", () => {
    const game = new TennisGame("Player1", "Player2");
    assert.strictEqual(game.score(), "Love-All");
  });

  await t.test("Fifteen-Love", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Fifteen-Love");
  });

  await t.test("Love-Fifteen", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Love-Fifteen");
  });

  await t.test("Fifteen-All", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Fifteen-All");
  });

  await t.test("Thirty-Love", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Thirty-Love");
  });

  await t.test("Thirty-Fifteen", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Thirty-Fifteen");
  });

  await t.test("Forty-Love", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Forty-Love");
  });

  await t.test("Love-Forty", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Love-Forty");
  });

  await t.test("Deuce at 40-40", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Deuce");
  });

  await t.test("Advantage Player1", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Advantage Player1");
  });

  await t.test("Advantage Player2", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Advantage Player2");
  });

  await t.test("Win for Player1 from advantage", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Win for Player1");
  });

  await t.test("Win for Player2 from advantage", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Win for Player2");
  });

  await t.test("Back and forth from deuce", () => {
    const game = new TennisGame("Player1", "Player2");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player1");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Deuce");

    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Advantage Player1");

    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Deuce");

    game.wonPoint("Player2");
    assert.strictEqual(game.score(), "Advantage Player2");

    game.wonPoint("Player1");
    assert.strictEqual(game.score(), "Deuce");
  });

  await t.test("Unknown player throws error", () => {
    const game = new TennisGame("Player1", "Player2");
    assert.throws(() => {
      game.wonPoint("Player3");
    });
  });
});
