export class TennisGame {
  constructor(player1Name, player2Name) {
    this.players = [player1Name, player2Name];
    this.points = [0, 0];
  }

  wonPoint(playerName) {
    const index = this.players.indexOf(playerName);
    if (index === -1) {
      throw new Error(`Player "${playerName}" not found`);
    }
    this.points[index]++;
  }

  score() {
    const p1 = this.points[0];
    const p2 = this.points[1];
    const pointNames = ["Love", "Fifteen", "Thirty", "Forty"];

    if (p1 < 4 && p2 < 4 && p1 === p2) {
      return pointNames[p1] + "-All";
    }

    if (p1 < 4 && p2 < 4) {
      return pointNames[p1] + "-" + pointNames[p2];
    }

    if (p1 >= 4 || p2 >= 4) {
      const diff = p1 - p2;

      if (diff === 0) {
        return "Deuce";
      }

      if (diff === 1) {
        return "Advantage " + this.players[0];
      }

      if (diff === -1) {
        return "Advantage " + this.players[1];
      }

      if (diff >= 2) {
        return "Win for " + this.players[0];
      }

      if (diff <= -2) {
        return "Win for " + this.players[1];
      }
    }

    return "";
  }
}
