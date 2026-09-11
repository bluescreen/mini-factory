import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

export function appRepo(dir) {
  const root = resolve(dir);
  if (existsSync(resolve(root, '.git'))) return root;
  mkdirSync(root, { recursive: true });
  git(root, 'init', '-q', '--initial-branch=main');
  git(root, 'commit', '-q', '--allow-empty', '-m', 'baseline');
  return root;
}

export function addWorktree(repo, run, name) {
  const dir = resolve(repo, '..', `wt-${run}-${name}`);
  if (existsSync(dir)) dropWorktree(repo, dir);
  git(repo, 'worktree', 'add', '-q', '-b', `factory/${run}/${name}`, dir, 'main');
  return dir;
}

export function dropWorktree(repo, dir) {
  try { git(repo, 'worktree', 'remove', '--force', dir); } catch { /* schon weg */ }
}
