// The gate for one Advent of Code day. Staged by use.sh, never edited by hand
// and never seen by the builder -- util.js hides test/ once it exists, so the
// suite is the specification and the build has to earn it blind.
//
// It asserts two things, and the second one is the half people forget:
//
//   the answer   the string the site already accepted for YOUR input. Not a
//                number this repo invented, not one the builder wrote down
//                itself -- an oracle from outside the run.
//   the budget   how long it may take. Almost every hard day has a solution
//                that is correct on the worked example and hopeless on the
//                real input; without a clock the gate cannot tell them apart.
//
// Both halves run in a child process, and that is not tidiness. A solution that
// recomputes instead of remembering blocks this thread synchronously, and no
// test timeout interrupts a loop that never yields. A gate that hangs is not a
// gate -- so the work happens where a SIGTERM can end it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BUDGET_MS = Number(process.env.AOC_BUDGET_MS ?? 10000);
const { year, day, title, answers } = JSON.parse(readFileSync('fixtures/answers.json', 'utf8'));

const CHILD = {
  part1: `import { readFileSync } from 'node:fs';
import { part1 } from './src/solution.js';
process.stdout.write(String(part1(readFileSync('fixtures/input.txt', 'utf8'))));`,
  part2: `import { readFileSync } from 'node:fs';
import { part2 } from './src/solution.js';
process.stdout.write(String(part2(readFileSync('fixtures/input.txt', 'utf8'))));`,
};

function answer(part) {
  const started = Date.now();
  try {
    return {
      value: execFileSync(process.execPath, ['--input-type=module', '-e', CHILD[part]], {
        timeout: BUDGET_MS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      }).trim(),
      ms: Date.now() - started,
    };
  } catch (error) {
    if (error.signal === 'SIGTERM') {
      assert.fail(`${part} was still running after ${BUDGET_MS} ms on the real input. It may well be correct -- correct is not the whole requirement.`);
    }
    const said = String(error.stderr || error.message).trim().split('\n').filter(Boolean).slice(-3).join(' / ');
    return assert.fail(`${part} did not produce an answer: ${said}`);
  }
}

test(`${year} day ${day} -- ${title} -- part 1`, () => {
  const { value, ms } = answer('part1');
  assert.equal(value, answers[0], `part1 returned ${value}, and the accepted answer is ${answers[0]}`);
  assert.ok(ms <= BUDGET_MS, `part1 is right but took ${ms} ms of ${BUDGET_MS} ms`);
});

test(`${year} day ${day} -- ${title} -- part 2`, { skip: answers.length < 2 && 'no accepted answer for part 2 -- solve the day first, then re-fetch' }, () => {
  const { value, ms } = answer('part2');
  assert.equal(value, answers[1], `part2 returned ${value}, and the accepted answer is ${answers[1]}`);
  assert.ok(ms <= BUDGET_MS, `part2 is right but took ${ms} ms of ${BUDGET_MS} ms`);
});
