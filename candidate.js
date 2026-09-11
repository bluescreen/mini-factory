#!/usr/bin/env node
import { copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';

export const CARRIED = ['factory.js', 'util.js', 'planner.prompt', 'builder.prompt', 'reviewer.prompt', 'package.json'];

export function seed(home, dir) {
  for (const f of CARRIED) copyFileSync(resolve(home, f), resolve(dir, f));
}

if (process.argv[1] && process.argv[1].endsWith('candidate.js')) {
  const [dir, goal] = process.argv.slice(2);
  const home = dirname(resolve(process.argv[1]));
  seed(home, dir);
  const run = spawnSync('node', ['factory.js', goal], { cwd: dir, encoding: 'utf8', env: process.env });
  process.stdout.write((run.stdout ?? '') + (run.stderr ?? ''));
  process.exit(run.status ?? 1);
}
