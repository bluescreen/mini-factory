#!/usr/bin/env node
import { prompt, phase, TESTS } from './util.js';

const goal = process.argv[2] ?? 'Implement the tennis kata';
const PLANNER = 'claude-sonnet-5';
const BUILDER = 'claude-haiku-4-5';

console.log(`mini-factory · ${goal}\n`);

phase('plan', PLANNER, prompt('planner.prompt', { goal }));
phase('build', BUILDER, prompt('builder.prompt', { goal, tests: TESTS }));
