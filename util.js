import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const RUN = String(Date.now());
const DIR = `.adw/${RUN}`;
mkdirSync(DIR, { recursive: true });

let step = 0;
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
  return answer;
}
