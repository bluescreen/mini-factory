#!/usr/bin/env node
import { prompt, phase, panel, gate, verdict, rejected, writtenFiles, commit, costs, crap, TESTS, SUITE, BINDING, GRADING } from './util.js';

const goal = process.argv[2] ?? 'Implement the tennis kata';
const GATE = process.argv[3];
const PLANNER = 'claude-sonnet-5';
const BUILDER = 'claude-haiku-4-5';
const REVIEWER = 'claude-sonnet-5';
const MAX_REPAIR_TRIES = 3;
const LENSES = [
  'correctness — does the implementation do what the plan says?',
  'edge cases — what does the test suite fail to cover?',
  'the goal — is anything the goal asks for missing?',
];

console.log(`mini-factory · ${goal}
  Gate: ${GATE ?? 'npm test'}${SUITE}
`);

const plan = phase('plan', PLANNER, prompt('planner.prompt', { goal, binding: BINDING }));
phase('build', BUILDER, prompt('builder.prompt', { goal, plan, tests: TESTS }));

async function check() {
  const result = gate(GATE);
  if (!result.pass) return result;
  const files = writtenFiles();
  const reviews = await panel('review', REVIEWER, LENSES.map((lens) =>
    prompt('reviewer.prompt', { goal, plan, files, grading: GRADING, lens })));
  const ships = reviews.filter((r) => !/^\s*VERDICT:\s*revise/im.test(r)).length;
  verdict(ships, reviews);
  if (ships <= reviews.length / 2) return { pass: false, output: reviews.join('\n\n---\n\n') };
  const risk = crap();
  return risk.pass ? { pass: true, output: reviews.join('\n\n---\n\n') } : risk;
}

let result = await check();
for (let round = 1; !result.pass && round <= MAX_REPAIR_TRIES; round++) {
  console.log('  ↩  repair loop');
  phase('build', BUILDER, prompt('builder.prompt', { goal, plan, tests: TESTS, feedback: rejected(result.output) }));
  result = await check();
}

if (result.pass) commit(goal, plan, result.output);

costs();

console.log(`\n  ${result.pass ? '✓' : '✗'}\n`);
process.exit(result.pass ? 0 : 1);
