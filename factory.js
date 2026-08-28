#!/usr/bin/env node
import { prompt, phase, gate, rejected, TESTS, SUITE, BINDING } from './util.js';

const goal = process.argv[2] ?? 'Implement the tennis kata';
const GATE = process.argv[3];
const PLANNER = 'claude-sonnet-5';
const BUILDER = 'claude-haiku-4-5';
const MAX_REPAIR_TRIES = 3;


console.log(`mini-factory · ${goal}
  Gate: ${GATE ?? 'npm test'}${SUITE}
`);

const plan = phase('plan', PLANNER, prompt('planner.prompt', { goal, binding: BINDING }));
phase('build', BUILDER, prompt('builder.prompt', { goal, plan, tests: TESTS }));

function check() {
  return gate(GATE);
}

let result = check();
for (let round = 1; !result.pass && round <= MAX_REPAIR_TRIES; round++) {
  console.log('  ↩  repair loop');
  phase('build', BUILDER, prompt('builder.prompt', { goal, plan, tests: TESTS, feedback: rejected(result.output) }));
  result = check();
}

console.log(`
  ${result.pass ? '✓' : '✗'}
`);
process.exit(result.pass ? 0 : 1);
