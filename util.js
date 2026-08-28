import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';

const RUN = String(Date.now());
const DIR = `.adw/${RUN}`;
mkdirSync(DIR, { recursive: true });

let step = 0;
let written = [];

export const hasTests = () => { try { return readdirSync('test').some((f) => f.endsWith('.js')); } catch { return false; } };

const HAD_TESTS = hasTests();

export const TESTS = HAD_TESTS
  ? 'Do not write tests. The suite already exists, is the binding specification, and you will not see it. A test file you return is discarded.'
  : 'Also write the tests that prove it, as node:test files under test/ that import from ../src/.';
const next = () => String(++step).padStart(2, '0');
const save = (name, data) => writeFileSync(`${DIR}/${name}`, data);

export const prompt = (file, vars) =>
  Object.entries(vars)
    .reduce((text, [key, value]) => text.replaceAll(`{{${key}}}`, value), readFileSync(file, 'utf8'))
    .replace(/\{\{\w+\}\}/g, '');

export function phase(role, model, text) {
  const n = next();
  save(`${n}-${role}.prompt.md`, text);
  const { status, stdout, stderr } = spawnSync('claude', ['-p', '--tools', '', '--output-format', 'json', '--model', model, text], { encoding: 'utf8', maxBuffer: 1 << 25 });
  if (status !== 0) throw new Error(`${role}: ${stderr}`);
  const { result } = JSON.parse(stdout);
  const answer = result.trim();
  save(`${n}-${role}.json`, JSON.stringify({ phase: role, model, answer }, null, 2));
  console.log(`  ${n}  AGENT  ${role.padEnd(6)}  ${model}`);
  writeFiles(answer);
  return answer;
}

function writeFiles(answer) {
  const all = [...answer.matchAll(/```[\w.]*\s+path=(\S+)\n([\s\S]*?)```/g)];
  const scoped = all.filter(([, path]) => path.startsWith('src/') || path.startsWith('test/'));
  const files = HAD_TESTS ? scoped.filter(([, path]) => !path.startsWith('test/')) : scoped;
  const refused = all.length - scoped.length;
  const dropped = scoped.length - files.length;
  if (refused) console.log(`      refused ${refused} file(s) outside src/ and test/`);
  if (dropped) console.log(`      discarded ${dropped} test file(s) — the suite was already there`);
  if (!files.length) return;
  for (const path of written) rmSync(path, { force: true });
  written = files.map(([, path]) => path);
  for (const [, path, code] of files) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, code);
  }
  console.log(`      ${written.join(', ')}`);
}

export function gate(command = 'npm test') {
  const n = next();
  const { status, stdout, stderr } = spawnSync(command, { shell: true, encoding: 'utf8' });
  const output = `${stdout}${stderr}`.trim();
  const pass = status === 0;
  save(`${n}-test.json`, JSON.stringify({ phase: 'test', command, pass, output: output.slice(-2000) }, null, 2));
  console.log(`  ${n}  CODE   ${'test'.padEnd(6)}  ${pass ? 'green' : 'red'}`);
  return { pass, output };
}

export const rejected = (output) => `Your last attempt was rejected:\n\n${output}`;
