export class TennisGame {
  constructor(player1Name, player2Name) {
    this.player1Name = player1Name;
    this.player2Name = player2Name;
    this.player1Points = 0;
    this.player2Points = 0;
  }

  wonPoint(playerName) {
    if (playerName === this.player1Name) {
      this.player1Points++;
    } else if (playerName === this.player2Name) {
      this.player2Points++;
    } else {
      throw new Error(`Unknown player: ${playerName}`);
    }
  }

  score() {
    const scores = ["Love", "Fifteen", "Thirty", "Forty"];
    const p1 = this.player1Points;
    const p2 = this.player2Points;

    if (p1 === p2) {
      if (p1 < 3) {
        return `${scores[p1]}-All`;
      }
      return "Deuce";
    }

    if (p1 < 4 && p2 < 4) {
      return `${scores[p1]}-${scores[p2]}`;
    }

    const diff = Math.abs(p1 - p2);
    const leader = p1 > p2 ? this.player1Name : this.player2Name;

    if (diff === 1) {
      return `Advantage ${leader}`;
    }

    return `Win for ${leader}`;
  }
}
