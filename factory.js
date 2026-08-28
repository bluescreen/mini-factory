#!/usr/bin/env node
import { prompt, phase, gate, verdict, rejected, writtenFiles, commit, costs, crap, TESTS } from './util.js';

const goal = process.argv[2] ?? 'Implement the tennis kata';
const GATE = process.argv[3];
const PLANNER = 'claude-sonnet-5';
const BUILDER = 'claude-haiku-4-5';
const REVIEWER = 'claude-sonnet-5';
const MAX_REPAIR_TRIES = 3;

console.log(`mini-factory · ${goal}
  Gate: ${GATE ?? 'npm test'}
`);

const plan = phase('plan', PLANNER, prompt('planner.prompt', { goal }));
phase('build', BUILDER, prompt('builder.prompt', { goal, plan, tests: TESTS }));

function check() {
  const result = gate(GATE);
  if (!result.pass) return result;
  const review = phase('review', REVIEWER, prompt('reviewer.prompt', { goal, plan, files: writtenFiles() }));
  const pass = !/^\s*VERDICT:\s*revise/im.test(review);
  verdict(pass, review);
  if (!pass) return { pass, output: review };
  const risk = crap();
  return risk.pass ? { pass: true, output: review } : risk;
}

let result = check();
for (let round = 1; !result.pass && round <= MAX_REPAIR_TRIES; round++) {
  console.log('  ↩  repair loop');
  phase('build', BUILDER, prompt('builder.prompt', { goal, plan, tests: TESTS, feedback: rejected(result.output) }));
  result = check();
}

if (result.pass) commit(goal, result.output);

costs();

console.log(`\n  ${result.pass ? '✓' : '✗'}\n`);
process.exit(result.pass ? 0 : 1);
