import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';

const RUN = String(Date.now());
const DIR = `.adw/${RUN}`;
mkdirSync(DIR, { recursive: true });

let step = 0;
const next = () => String(++step).padStart(2, '0');
const ledger = [];
let written = [];

export const hasTests = () => { try { return readdirSync('test').some((f) => f.endsWith('.js')); } catch { return false; } };

const HAD_TESTS = hasTests();

export const TESTS = HAD_TESTS
  ? 'Do not write tests. The suite already exists, is the binding specification, and you will not see it. A test file you return is discarded.'
  : 'Also write the tests that prove it, as node:test files under test/ that import from ../src/.';
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
  const { result, total_cost_usd = 0, duration_ms = 0, usage = {} } = JSON.parse(stdout);
  const answer = result.trim();
  ledger.push({ n, role, model, usd: total_cost_usd, ms: duration_ms, out: usage.output_tokens ?? 0 });
  save(`${n}-${role}.json`, JSON.stringify({ phase: role, model, usd: total_cost_usd, usage, answer }, null, 2));
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

export function verdict(pass, text) {
  const reason = text.split('\n').slice(1).find((line) => line.trim()) ?? '';
  console.log(`      ${pass ? 'ship' : 'revise'}${reason ? ` — ${reason.trim().slice(0, 76)}` : ''}`);
}

export function gate(command = 'npm test') {
  const n = next();
  const started = Date.now();
  const { status, stdout, stderr } = spawnSync(command, { shell: true, encoding: 'utf8' });
  ledger.push({ n, role: 'test', model: 'code', usd: 0, ms: Date.now() - started, out: 0 });
  const output = `${stdout}${stderr}`.trim();
  const pass = status === 0;
  save(`${n}-test.json`, JSON.stringify({ phase: 'test', command, pass, output: output.slice(-2000) }, null, 2));
  console.log(`  ${n}  CODE   ${'test'.padEnd(6)}  ${pass ? 'green' : 'red'}`);
  return { pass, output };
}

export const rejected = (output) => `Your last attempt was rejected:\n\n${output}`;

export const writtenFiles = () =>
  written.map((path) => `--- ${path} ---\n${readFileSync(path, 'utf8')}`).join('\n\n');


export function commit(goal, review = '', branch = `factory/${RUN}`) {
  const n = next();
  const started = Date.now();
  const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
  git('checkout', '-b', branch);
  git('add', '-A');
  git('commit', '-m', `feat: ${goal}`);

  let pr = null;
  if (process.env.FACTORY_PR) {
    const pushed = git('push', '-u', 'origin', branch);
    if (pushed.status !== 0) {
      console.log(`      push failed — staying local: ${(pushed.stderr || '').trim().split('\n')[0]}`);
    } else {
      const url = (git('remote', 'get-url', 'origin').stdout || '').trim();
      const slug = url.replace(/\.git$/, '').replace(/^.*[:/]([^/:]+\/[^/]+)$/, '$1');
      const body = [review.trim(), '', '---', 'Proposed by the mini-factory. The gate was green and the review is above. Nothing was merged — that part is yours.'].join('\n');
      const made = spawnSync('gh', ['pr', 'create', '--repo', slug, '--title', `feat: ${goal}`, '--body', body, '--head', branch], { encoding: 'utf8' });
      pr = made.status === 0 ? (made.stdout || '').trim().split('\n').pop() : null;
      if (!pr) console.log(`      pushed, but no pull request: ${(made.stderr || '').trim().split('\n')[0]}`);
    }
  }

  ledger.push({ n, role: 'commit', model: 'code', usd: 0, ms: Date.now() - started, out: 0 });
  save(`${n}-commit.json`, JSON.stringify({ phase: 'commit', branch, pr }, null, 2));
  console.log(`  ${n}  CODE   ${'commit'.padEnd(6)}  ${pr || branch}`);
}

const BRANCHES = /\b(?:if|for|while|case|catch)\b|&&|\|\||\?\?|\?(?![.?])/g;

export function crap() {
  const ceiling = Number(process.env.CRAP_MAX);
  if (!ceiling) return { pass: true, output: '' };
  const n = next();
  const started = Date.now();
  const measured = spawnSync('node', ['--test', '--experimental-test-coverage'], { encoding: 'utf8', maxBuffer: 1 << 25 });
  const report = `${measured.stdout}${measured.stderr}`;
  const covered = {};
  for (const [, file, pct] of report.matchAll(/(\S+\.js)\s*\|\s*([\d.]+)/g)) covered[file] = Number(pct) / 100;
  const rows = written.filter((p) => !p.startsWith('test/')).map((p) => {
    const cc = (readFileSync(p, 'utf8').match(BRANCHES) ?? []).length + 1;
    const cov = covered[p.split('/').pop()] ?? 0;
    return { file: p, cc, cov, crap: Math.round(cc ** 2 * (1 - cov) ** 3 + cc) };
  });
  const worst = rows.reduce((a, b) => (b.crap > a.crap ? b : a), { file: '—', crap: 0 });
  const pass = worst.crap <= ceiling;
  save(`${n}-crap.json`, JSON.stringify({ phase: 'crap', ceiling, worst, rows }, null, 2));
  ledger.push({ n, role: 'crap', model: 'code', usd: 0, ms: Date.now() - started, out: 0 });
  console.log(`  ${n}  CODE   ${'crap'.padEnd(6)}  ${pass ? 'green' : 'red'}     ${worst.file} ${worst.crap}/${ceiling}`);
  return { pass, output: `CRAP ${worst.crap} in ${worst.file} is over the ceiling of ${ceiling}. Fewer branches, or more coverage.` };
}

export function costs() {
  const usd = ledger.reduce((sum, row) => sum + row.usd, 0);
  const ms = ledger.reduce((sum, row) => sum + row.ms, 0);
  save('costs.json', JSON.stringify({ usd, ms, phases: ledger }, null, 2));
  console.log('\n  Phase          Model              Cost        Duration');
  for (const row of ledger) {
    console.log(`  ${row.n} ${row.role.padEnd(12)} ${row.model.padEnd(18)} ${row.usd ? `$${row.usd.toFixed(4)}` : 'free'.padStart(7)} ${(row.ms / 1000).toFixed(1).padStart(9)}s`);
  }
  console.log(`     ${'total'.padEnd(12)} ${''.padEnd(18)} $${usd.toFixed(4)} ${(ms / 1000).toFixed(1).padStart(9)}s`);
}
