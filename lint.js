import { readFileSync } from 'node:fs';

export function lint(plan) {
  const f = [];
  if (!plan.goal) f.push({ level: 'blocker', message: 'Kein Ziel: die Fabrik weiß nicht, was sie bauen soll.' });
  if (!plan.runs || plan.runs < 1) f.push({ level: 'blocker', message: 'Kein runs: null Kandidaten sind kein Lauf.' });
  if (!plan.cap) f.push({ level: 'blocker', message: 'Kein Deckel: ein Lauf ohne cap kostet, solange er läuft.' });
  if (plan.runs > 1 && plan.placement !== 'box')
    f.push({ level: 'blocker', message: `${plan.runs} Fabriken auf deinem Laptop: sie teilen CPU, Ports und dein Dateisystem.` });
  if (!Array.isArray(plan.dod) || plan.dod.length === 0)
    f.push({ level: 'blocker', message: 'Kein DoD: ohne Abnahmekriterien misst der Judge, was der Kandidat selbst geschrieben hat.' });
  if (plan.teardown === false) f.push({ level: 'warn', message: 'Kein Teardown: die Worktrees bleiben stehen.' });
  return f;
}

export function report(findings) {
  for (const x of findings) console.log(`   ${x.level === 'blocker' ? '⛔' : '·'} ${x.message}`);
  return findings.some((x) => x.level === 'blocker');
}

if (process.argv[1] && process.argv[1].endsWith('lint.js')) {
  const plan = JSON.parse(readFileSync(process.argv[2] ?? 'plan.json', 'utf8'));
  const blocked = report(lint(plan));
  console.log(blocked ? '\n  ⛔ Plan hat Blocker — die Fabrik startet nicht.\n' : '\n  ✓ Plan ist sauber.\n');
  process.exit(blocked ? 1 : 0);
}
