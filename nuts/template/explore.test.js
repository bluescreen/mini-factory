// The gate for a day nobody has solved yet. It is a weaker gate than
// aoc.test.js and the difference is the whole lesson.
//
// There is no accepted answer to compare against, so this cannot ask "is it
// right". It asks the three things that can be asked without an oracle:
//
//   the example    the puzzle states its own worked result. That number is
//                  read off the page by a human and passed in -- the build
//                  never sees this file, so it cannot write its own target.
//   two runs       the same input twice, the same answer twice. Catches a
//                  solution that leans on iteration order, a clock or a seed.
//   the budget     same clock as always, same child process, same SIGTERM.
//
// What stays open: a build that special-cases the example passes all three.
// The determinism check does not see it and neither does the budget. Only
// submitting the answer closes that hole, and submitting is a person's job.
//
// So green here means self-consistent, not correct. That is exactly the gap a
// Definition of Done fills, and the point of running a day this way once is to
// feel the difference between this file and the other one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BUDGET_MS = Number(process.env.AOC_BUDGET_MS ?? 10000);
const { year, day, title, expect: stated } = JSON.parse(readFileSync('fixtures/answers.json', 'utf8'));

const CHILD = {
  'part1 on the example': `import { readFileSync } from 'node:fs';
import { part1 } from './src/solution.js';
process.stdout.write(String(part1(readFileSync('fixtures/example.txt', 'utf8'))));`,
  'part2 on the example': `import { readFileSync } from 'node:fs';
import { part2 } from './src/solution.js';
process.stdout.write(String(part2(readFileSync('fixtures/example.txt', 'utf8'))));`,
  'part1 on the real input': `import { readFileSync } from 'node:fs';
import { part1 } from './src/solution.js';
process.stdout.write(String(part1(readFileSync('fixtures/input.txt', 'utf8'))));`,
  'part2 on the real input': `import { readFileSync } from 'node:fs';
import { part2 } from './src/solution.js';
process.stdout.write(String(part2(readFileSync('fixtures/input.txt', 'utf8'))));`,
};

function answer(what) {
  const started = Date.now();
  try {
    return {
      value: execFileSync(process.execPath, ['--input-type=module', '-e', CHILD[what]], {
        timeout: BUDGET_MS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      }).trim(),
      ms: Date.now() - started,
    };
  } catch (error) {
    if (error.signal === 'SIGTERM') assert.fail(`${what} was still running after ${BUDGET_MS} ms.`);
    const said = String(error.stderr || error.message).trim().split('\n').filter(Boolean).slice(-3).join(' / ');
    return assert.fail(`${what} did not produce an answer: ${said}`);
  }
}

test(`${year} day ${day} -- ${title} -- the worked example`, () => {
  const { value } = answer('part1 on the example');
  assert.equal(value, stated[0], `part1 on the example returned ${value}, and the puzzle says ${stated[0]}`);
});

test(`${year} day ${day} -- part 2 on the worked example`, { skip: stated.length < 2 && 'part two is not unlocked until part one is accepted' }, () => {
  const { value } = answer('part2 on the example');
  assert.equal(value, stated[1], `part2 on the example returned ${value}, and the puzzle says ${stated[1]}`);
});

test(`${year} day ${day} -- the real input, twice`, () => {
  const first = answer('part1 on the real input');
  const second = answer('part1 on the real input');

  assert.equal(first.value, second.value, 'two runs, two answers -- something in here is not deterministic');
  assert.notEqual(first.value, stated[0], 'the real input gave the example answer, which is one thing it cannot be');
  assert.ok(first.value.length > 0, 'part1 returned nothing on the real input');

  console.log(`\n  candidate answer for ${year} day ${day}, part 1:  ${first.value}   (${first.ms} ms)`);
  console.log('  Nothing here says it is right. Submit it and find out.\n');
});
