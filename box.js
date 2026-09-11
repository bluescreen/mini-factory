#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { chmodSync, rmSync } from 'node:fs';

const IMAGE = process.env.BOX_IMAGE ?? 'mini-factory-box';
const PASSED = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'CRAP_MAX',
  'PLANNER_MODEL', 'BUILDER_MODEL', 'REVIEWER_MODEL'];
const WHERE = process.env.DOCKER_HOST ?? 'this machine';
const SEED = '/tmp/seed.bundle';

const sh = (bin, ...args) => spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 1 << 25 });
const docker = (...args) => sh('docker', ...args);
const out = (result) => (result.stdout ?? '').trim();

function must(result, what) {
  if (result.status !== 0) {
    console.error(`  ✗ ${what}: ${(result.stderr || result.stdout || '').trim().split('\n')[0]}`);
    process.exit(1);
  }
  return out(result);
}

function start(goal) {
  const box = `box-${Date.now()}`;
  console.log(`mini-factory · ${goal}\n  Box: ${box}\n  Host: ${WHERE}\n`);

  must(sh('git', 'bundle', 'create', SEED, '--all'), 'nothing committed to send');
  chmodSync(SEED, 0o644);
  const env = PASSED.flatMap((name) => (process.env[name] ? ['-e', name] : []));
  if (!env.length) console.log('  no credential in the environment — the agent phases will fail in the box');

  must(docker('run', '-d', '--name', box, ...env, IMAGE), 'the box did not start');
  must(docker('cp', SEED, `${box}:/tmp/seed.bundle`), 'the seed did not arrive');
  must(docker('exec', box, 'git', 'clone', '-q', '/tmp/seed.bundle', '/box'), 'the box has no repo');
  must(docker('exec', '-d', box, 'sh', '-c',
    `cd /box && node factory.js ${JSON.stringify(goal)} > /tmp/run.log 2>&1; echo $? > /tmp/run.exit`), 'the factory did not start');

  console.log(`  seeded and running · node box.js harvest ${box}`);
  return box;
}

function harvest(box) {
  if (docker('inspect', '--type', 'container', box).status !== 0) {
    console.error(`  ✗ no such box: ${box}`);
    process.exit(1);
  }
  const done = docker('exec', box, 'cat', '/tmp/run.exit');
  if (done.status !== 0) {
    console.log(`  ${box} is still running:\n`);
    process.stdout.write(out(docker('exec', box, 'tail', '-5', '/tmp/run.log')) + '\n');
    process.exit(2);
  }
  process.stdout.write(out(docker('exec', box, 'cat', '/tmp/run.log')) + '\n\n');

  const code = Number(out(done));
  if (code === 0) {
    must(docker('exec', box, 'git', '-C', '/box', 'bundle', 'create', '/tmp/home.bundle', '--all'), 'nothing to bring home');
    must(docker('cp', `${box}:/tmp/home.bundle`, '/tmp/home.bundle'), 'the bundle did not arrive');
    const fetched = sh('git', 'fetch', '-q', '/tmp/home.bundle', '+refs/heads/factory/*:refs/heads/factory/*');
    if (fetched.status !== 0) console.log(`  no branch came home: ${(fetched.stderr || '').trim().split('\n')[0]}`);
    rmSync('/tmp/home.bundle', { force: true });
  }
  must(docker('cp', `${box}:/box/.adw`, '.'), 'no journal');
  must(docker('rm', '-f', box), 'teardown failed');

  const branch = out(sh('git', 'branch', '--list', 'factory/*', '--sort=-committerdate', '--format=%(refname:short)')).split('\n')[0];
  console.log(`  box torn down · journal in .adw/${branch ? ` · branch ${branch}` : ''}`);
  process.exit(code);
}

function list() {
  const rows = out(docker('ps', '-a', '--filter', 'name=box-', '--format', '{{.Names}}\t{{.Status}}'));
  console.log(rows ? `  on ${WHERE}:\n${rows.split('\n').map((r) => `  ${r}`).join('\n')}` : `  no boxes on ${WHERE}`);
}

const [command, arg] = process.argv.slice(2);
if (command === 'start' && arg) start(arg);
else if (command === 'harvest' && arg) harvest(arg);
else if (command === 'list') list();
else {
  console.log('usage:\n  node box.js start "<goal>"\n  node box.js harvest <box>\n  node box.js list');
  process.exit(1);
}
