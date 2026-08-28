#!/usr/bin/env node
import { prompt, phase } from './util.js';

const goal = process.argv[2] ?? 'Implement the tennis kata';
const PLANNER = 'claude-sonnet-5';

console.log(`mini-factory · ${goal}\n`);

phase('plan', PLANNER, prompt('planner.prompt', { goal }));
