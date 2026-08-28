export class TennisGame {
  constructor() {
    this.points = { player1: 0, player2: 0 };
  }

  pointWonBy(player) {
    this.points[player]++;
  }

  getScore() {
    const { player1, player2 } = this.points;
    const scoreNames = ["Love", "Fifteen", "Thirty", "Forty"];

    if (player1 < 3 || player2 < 3) {
      const name1 = scoreNames[Math.min(player1, 3)];
      const name2 = scoreNames[Math.min(player2, 3)];

      if (player1 === player2) {
        return `${name1}-All`;
      }
      return `${name1}-${name2}`;
    }

    if (player1 === player2) {
      return "Deuce";
    }

    if (player1 > player2) {
      return player1 - player2 === 1 ? "Advantage player1" : "Win for player1";
    }

    return player2 - player1 === 1 ? "Advantage player2" : "Win for player2";
  }
}
