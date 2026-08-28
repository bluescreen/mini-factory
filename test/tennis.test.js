import { strict as assert } from "node:assert";
import { test } from "node:test";
import { TennisGame } from "../src/tennis.js";

test("Tennis Game - Initial Score", () => {
  const game = new TennisGame();
  assert.equal(game.getScore(), "Love-All");
});

test("Tennis Game - 15-Love", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  assert.equal(game.getScore(), "Fifteen-Love");
});

test("Tennis Game - Love-15", () => {
  const game = new TennisGame();
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Love-Fifteen");
});

test("Tennis Game - 15-All", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Fifteen-All");
});

test("Tennis Game - 30-15", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Thirty-Fifteen");
});

test("Tennis Game - 15-30", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Fifteen-Thirty");
});

test("Tennis Game - 30-All", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Thirty-All");
});

test("Tennis Game - 40-30", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Forty-Thirty");
});

test("Tennis Game - 30-40", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Thirty-Forty");
});

test("Tennis Game - Deuce (3-3)", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Deuce");
});

test("Tennis Game - Advantage player1", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player1");
  assert.equal(game.getScore(), "Advantage player1");
});

test("Tennis Game - Advantage player2", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Advantage player2");
});

test("Tennis Game - Win for player1", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  assert.equal(game.getScore(), "Win for player1");
});

test("Tennis Game - Win for player2", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Win for player2");
});

test("Tennis Game - Deuce after Advantage", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player1");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Deuce");
});

test("Tennis Game - Forty-Love", () => {
  const game = new TennisGame();
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  game.pointWonBy("player1");
  assert.equal(game.getScore(), "Forty-Love");
});

test("Tennis Game - Love-Forty", () => {
  const game = new TennisGame();
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  game.pointWonBy("player2");
  assert.equal(game.getScore(), "Love-Forty");
});
