export class Game {
  constructor() {
    this.rolls = [];
  }

  roll(pins) {
    if (pins < 0 || pins > 10) {
      throw new Error('Invalid pin count');
    }
    this.rolls.push(pins);
  }

  score() {
    let score = 0;
    let rollIndex = 0;

    for (let frame = 0; frame < 10; frame++) {
      if (this.rolls[rollIndex] === 10) {
        score += 10 + this.rolls[rollIndex + 1] + this.rolls[rollIndex + 2];
        rollIndex += 1;
      } else if (this.rolls[rollIndex] + this.rolls[rollIndex + 1] === 10) {
        score += 10 + this.rolls[rollIndex + 2];
        rollIndex += 2;
      } else {
        score += this.rolls[rollIndex] + this.rolls[rollIndex + 1];
        rollIndex += 2;
      }
    }

    return score;
  }
}
