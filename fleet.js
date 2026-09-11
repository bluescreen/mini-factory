#!/usr/bin/env node
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { lint, report } from './lint.js';
import { appRepo, addWorktree, dropWorktree } from './repo.js';

const HOME = dirname(resolve(process.argv[1]));
const RUN = String(Date.now());
const plan = JSON.parse(readFileSync(process.argv[2] ?? 'plan.json', 'utf8'));

console.log(`\n  fleet · ${plan.goal}\n`);
if (report(lint(plan))) {
  console.log('\n  ⛔ Plan hat Blocker — die Fabrik startet nicht.\n');
  process.exit(1);
}

const goal = (plan.dod ?? []).length
  ? `${plan.goal}\n\nDefinition of Done. Name your tests exactly like these, one test per line:\n${plan.dod.map((d) => `- ${d}`).join('\n')}`
  : plan.goal;

const repo = appRepo(plan.app ?? '.runs/app');
const names = Array.from({ length: plan.runs }, (_, i) => `cand-${i + 1}`);
const journalDir = resolve(repo, '..', 'journal');
mkdirSync(journalDir, { recursive: true });
const boxes = names.map((name) => ({ name, dir: addWorktree(repo, RUN, name), log: `${RUN}-${name}.log` }));

function runOne({ name, dir, log }) {
  return new Promise((done) => {
    const out = createWriteStream(resolve(journalDir, log));
    const child = spawn('node', [resolve(HOME, 'candidate.js'), dir, goal], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    child.stdout.pipe(out, { end: false });
    child.stderr.pipe(out, { end: false });
    child.on('exit', (code) => { out.end(); done({ name, dir, log, ok: code === 0 }); });
  });
}

// Die Schlussrechnung gibt es erst am Ende. Wer währenddessen wissen will, wo
// der Lauf steht, liest die Phasen selbst: die .prompt.md entsteht, bevor die
// Phase startet, die .json, wenn sie fertig ist. Eine Phase mit Prompt und ohne
// Antwort läuft gerade.
function ledgerOf(dir) {
  const runs = resolve(dir, '.adw');
  if (!existsSync(runs)) return null;
  const adw = readdirSync(runs).map((r) => resolve(runs, r)).find((r) => existsSync(r));
  if (!adw) return null;
  const fertig = resolve(adw, 'costs.json');
  if (existsSync(fertig)) return { adw, ...JSON.parse(readFileSync(fertig, 'utf8')) };

  const phases = [];
  for (const f of readdirSync(adw).sort()) {
    const m = f.match(/^(\d+)-([a-z]+)\.(json|prompt\.md)$/);
    if (!m) continue;
    const [, n, role, kind] = m;
    let phase = phases.find((p) => p.n === n);
    if (!phase) { phase = { n, role, model: role === 'test' || role === 'commit' ? 'code' : '…', usd: 0, ms: null, läuft: true }; phases.push(phase); }
    if (kind === 'json') {
      const j = JSON.parse(readFileSync(resolve(adw, f), 'utf8'));
      phase.model = j.model ?? 'code';
      phase.usd = j.usd ?? 0;
      phase.ms = j.ms ?? null;
      phase.par = j.par === true;
      phase.läuft = false;
    }
  }
  return { adw, usd: phases.reduce((s, p) => s + p.usd, 0), ms: phases.reduce((s, p) => s + (p.ms || 0), 0), phases };
}

function gateOf(adw) {
  if (!adw) return null;
  const file = readdirSync(adw).filter((f) => f.endsWith('-test.json')).pop();
  if (!file) return null;
  const t = JSON.parse(readFileSync(resolve(adw, file), 'utf8'));
  const count = (label) => Number((t.output ?? '').match(new RegExp(`(?:^# |\u2139 )${label} (\\d+)`, 'm'))?.[1] ?? 0);
  return { pass: t.pass, command: t.command, tests: { pass: count('pass'), fail: count('fail') } };
}

function branchOf(dir) {
  try { return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim(); }
  catch { return null; }
}


const candidates = await Promise.all(boxes.map(runOne));
const priced = candidates.map((c) => {
  const led = ledgerOf(c.dir);
  return {
    ...c,
    usd: led ? led.usd : Infinity,
    ms: led ? led.ms : null,
    phases: led ? led.phases : [],
    gate: gateOf(led && led.adw),
    branch: branchOf(c.dir),
  };
});
for (const c of priced) {
  console.log(`   ${c.ok ? '\u2713' : '\u2717'} ${c.name.padEnd(10)} ${c.ok ? `$${c.usd.toFixed(4)}` : 'rot bei test'}`);
}

const winner = priced.filter((c) => c.ok).sort((a, b) => a.usd - b.usd)[0] ?? null;
console.log(winner
  ? `\n  Sieger: ${winner.name} — billigster grüner Kandidat ($${winner.usd.toFixed(4)})`
  : '\n  Kein grüner Kandidat.');

if (plan.teardown !== false) {
  for (const c of priced) dropWorktree(repo, c.dir);
  console.log(`  Worktrees abgeräumt — die Branches factory/${RUN}/* bleiben in ${repo}.\n`);
}

process.exit(winner ? 0 : 1);
