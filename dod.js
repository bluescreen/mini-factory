import { spawnSync, execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function passedTests(output) {
  const names = new Set();
  for (const [, name] of output.matchAll(/^\s*(?:ok \d+ - |✔ )(.+?)(?: \(\d.*)?$/gm)) names.add(name.trim());
  return names;
}

export function match(items, passed) {
  return items.map((item) => ({
    item,
    test: [...passed].find((name) => name.includes(item)) ?? null,
  })).map((row) => ({ ...row, ok: row.test !== null }));
}

export function dodCheck(dir, items) {
  const run = spawnSync('node', ['--test'], { cwd: dir, encoding: 'utf8' });
  const rows = match(items, passedTests(`${run.stdout}${run.stderr}`));
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
  const receipt = { head, ok: rows.every((r) => r.ok), items: rows, at: new Date().toISOString() };
  writeFileSync(resolve(dir, 'dod.json'), JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}

if (process.argv[1] && process.argv[1].endsWith('dod.js')) {
  const [dir, planPath] = process.argv.slice(2);
  const plan = JSON.parse(execFileSync('cat', [planPath ?? 'plan.json'], { encoding: 'utf8' }));
  const receipt = dodCheck(dir, plan.dod ?? []);
  for (const row of receipt.items) console.log(`   ${row.ok ? '✓' : '✗'} ${row.item}${row.test ? ` → ${row.test}` : ' → kein Test'}`);
  process.exit(receipt.ok ? 0 : 1);
}
