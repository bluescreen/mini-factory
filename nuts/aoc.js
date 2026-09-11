#!/usr/bin/env node
// Fetches one day: the puzzle as the spec, your input, and your answers as the
// Definition of Done.
//
// Nothing it writes is committed. The puzzle text and the inputs belong to
// Advent of Code and are not ours to redistribute, so they land in .cache/,
// which is ignored -- every participant fetches their own with their own
// session cookie. That is also what makes the DoD real: the answers come off
// the page of a day YOU have already solved, so the suite asserts a number
// Advent of Code has already accepted, not one this repo made up.
//
// It follows the site's automation rules, and they are not decoration:
//
//   cache first   a resource is fetched once, ever. A second run is offline.
//   throttle      one request at a time, with a pause between days.
//   identify      the User-Agent names a human who can be contacted.
//
//   node nuts/aoc.js 2023 12          one day
//   node nuts/aoc.js 2024 1-25        a year, for the fleet
//   node nuts/aoc.js --list           what is already cached
//
// Without a cookie it still works, just not for everything: part one of a
// puzzle is a public page. The input and part two are not, and neither are
// your answers -- so a run without a cookie needs them from somewhere else:
//
//   node nuts/aoc.js 2025 1 --input ~/aoc/inputs/p1.txt --answers 1076,6379
//   node nuts/aoc.js 2025 1 --puzzle aoc.md --input ~/aoc/inputs/p1.txt
//
// which is the shape of it if you already solved the year in your own repo.
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE = process.env.AOC_CACHE ? resolve(process.env.AOC_CACHE) : resolve(HERE, '.cache');
const PAUSE_MS = 2000;
const BASE = process.env.AOC_BASE ?? 'https://adventofcode.com';

const die = (message) => { console.error(`\n  ${message}\n`); process.exit(1); };

// The cookie is read, used against the site it belongs to, and never printed,
// never written to the cache and never handed to a model. It is the one secret
// in this directory and it stays out of everything the factory can see.
function session() {
  if (process.env.AOC_SESSION) return process.env.AOC_SESSION.trim();
  for (const file of [resolve(HERE, '.session'), resolve(homedir(), '.adventofcode.session')]) {
    if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  }
  return null;
}

// The site asks that automated requests identify a human. A tool that refuses
// to say who it is has no business making the request.
function contact() {
  if (process.env.AOC_CONTACT) return process.env.AOC_CONTACT.trim();
  try {
    const email = execFileSync('git', ['config', 'user.email'], { encoding: 'utf8' }).trim();
    if (email) return email;
  } catch { /* no git identity configured */ }
  return die('set AOC_CONTACT to an email address -- the site asks automated requests to identify a human.');
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

let requests = 0;
async function get(url, cookie) {
  if (requests++) await wait(PAUSE_MS);
  const response = await fetch(url, {
    headers: {
      ...(cookie ? { cookie: `session=${cookie}` } : {}),
      'user-agent': `agent-roster-workshops/12-software-factory by ${contact()}`,
    },
  });
  if (response.status === 404) die(`${url} is not there yet -- has the puzzle unlocked?`);
  if (response.status === 400 || response.status === 500) die('the session cookie was rejected. They expire after about a month -- fetch a fresh one.');
  if (!response.ok) die(`${url} answered ${response.status}`);
  return response.text();
}

const entities = (html) => html
  .replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// HTML into something a model reads as a specification. Only the two structures
// that carry meaning survive as structure: the headings, and the example blocks
// -- mangle a <pre> and the worked example stops being one.
function asText(html) {
  const blocks = [];
  const parked = html.replace(/<pre>\s*<code>([\s\S]*?)<\/code>\s*<\/pre>/g, (_, code) => {
    blocks.push(entities(code).replace(/\n+$/, ''));
    return `@@BLOCK${blocks.length - 1}@@`;
  });

  return parked
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, title) => `\n## ${entities(title).replace(/^-+\s*|\s*-+$/g, '').trim()}\n`)
    .replace(/<li>/g, '\n  - ')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .split(/(@@BLOCK\d+@@)/)
    .map((part) => {
      const block = /^@@BLOCK(\d+)@@$/.exec(part);
      return block ? '\n```\n' + blocks[Number(block[1])] + '\n```\n' : entities(part);
    })
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Both halves of what a day is worth: the spec, and the answers the site has
// already accepted. A day you have not solved yields no oracle -- and a suite
// without an oracle is not a gate, so the caller is told instead of guessing.
export function parse(html) {
  const parts = [...html.matchAll(/<article class="day-desc">([\s\S]*?)<\/article>/g)].map((m) => asText(m[1]));
  const answers = [...html.matchAll(/Your puzzle answer was\s*<code>([^<]+)<\/code>/g)].map((m) => m[1]);
  const title = (html.match(/<h2[^>]*>\s*-+\s*(.*?)\s*-+\s*<\/h2>/) || [, ''])[1];
  return { title: entities(title), parts, answers };
}

// A page copied out of the browser, which is how you get part two without
// handing this tool a cookie. Same three things as parse(), from text instead
// of markup -- and the same hard rule about the last one.
//
// "Your puzzle answer was 1076" stands in the page around the articles, so the
// markup path drops it by construction. A text dump has no such structure, and
// an answer left standing in the spec is not a hard nut: it is a builder that
// returns the number it was told. It comes out here, deliberately, and a test
// holds it out.
export function fromDump(text) {
  const answers = [...text.matchAll(/Your puzzle answer was\s*([^.\s]+)/g)].map((m) => m[1]);
  const body = text
    .slice(Math.max(0, text.search(/^---\s*Day\s+\d+/m)))
    .split(/Both parts of this puzzle are complete|If you still want to see it|Answer:/)[0]
    .split('\n')
    .filter((line) => !/Your puzzle answer was/.test(line))
    .join('\n');

  const title = (body.match(/^---\s*(Day\s+\d+:.*?)\s*---/m) || [, ''])[1];
  const parts = body.split(/^---\s*Part Two\s*---$/m)
    .map((part, i) => (i ? '## Part Two\n' + part : part).replace(/^---\s*(.*?)\s*---$/m, '## $1').trim())
    .filter(Boolean);
  return { title, parts, answers };
}

async function day(year, number, cookie, local = {}) {
  const label = `${year} day ${String(number).padStart(2, ' ')}`;
  const dir = resolve(CACHE, String(year), String(number).padStart(2, '0'));
  const has = (name) => existsSync(resolve(dir, name));

  if (has('puzzle.md') && has('input.txt') && has('answers.json')) {
    const { answers } = JSON.parse(readFileSync(resolve(dir, 'answers.json'), 'utf8'));
    console.log(`  ${label}   cached    ${answers.length} of 2 answers`);
    return;
  }
  mkdirSync(dir, { recursive: true });

  const { title, parts, answers } = local.page
    ? fromDump(local.page)
    : parse(await get(`${BASE}/${year}/day/${number}`, cookie));

  // Three things come off that page and only the first is public. Anything the
  // login would have carried has to be handed in instead -- your input from
  // wherever you keep it, your answers from wherever you wrote them down.
  const input = local.input ?? (cookie ? await get(`${BASE}/${year}/day/${number}/input`, cookie) : null);
  if (input !== null) writeFileSync(resolve(dir, 'input.txt'), input);

  const known = local.answers ?? answers;
  writeFileSync(resolve(dir, 'puzzle.md'), `${parts.join('\n\n')}\n`);
  writeFileSync(resolve(dir, 'answers.json'), JSON.stringify({ year, day: number, title, answers: known }, null, 2) + '\n');

  // An anonymous page carries part one and nothing else. Saying so beats a
  // suite that silently gates half a day.
  const notes = [
    `${parts.length} of 2 parts`,
    `${known.length} of 2 answers`,
    input === null ? `NO INPUT -- pass --input <file>, or put a session cookie in ${resolve(HERE, '.session')}` : null,
  ].filter(Boolean).join(', ');
  console.log(`  ${label}   fetched   ${notes}   ${title}`);
}

// Importable for its parser, runnable as a tool -- the CLI only fires when this
// file IS the command, so a test can read parse() without the tool running.
if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  if (args[0] === '--list') {
    if (!existsSync(CACHE)) die('nothing cached yet.');
    for (const year of readdirSync(CACHE).sort()) {
      for (const number of readdirSync(resolve(CACHE, year)).sort()) {
        const { title, answers } = JSON.parse(readFileSync(resolve(CACHE, year, number, 'answers.json'), 'utf8'));
        console.log(`  ${year} day ${number}   ${answers.length} of 2   ${title}`);
      }
    }
    process.exit(0);
  }

  const flag = (name) => {
    const at = args.indexOf(name);
    return at < 0 ? null : args[at + 1];
  };
  const inputFile = flag('--input');
  const puzzleFile = flag('--puzzle');
  const answers = flag('--answers');
  const positional = args.filter((a, i) => !a.startsWith('--') && !String(args[i - 1] ?? '').startsWith('--'));

  const year = Number(positional[0]);
  if (!year || !positional[1]) die('usage: node nuts/aoc.js <year> <day|first-last> [--puzzle FILE] [--input FILE] [--answers A,B]   ·   node nuts/aoc.js --list');

  const [first, last] = String(positional[1]).split('-').map(Number);
  const days = Array.from({ length: (last || first) - first + 1 }, (_, i) => first + i);
  if (days.some((d) => !Number.isInteger(d) || d < 1 || d > 25)) die('days run from 1 to 25.');
  if ((inputFile || answers) && days.length > 1) die('--input and --answers describe one day, not a range.');

  const local = {};
  if (inputFile) {
    if (!existsSync(inputFile)) die(`no such input file: ${inputFile}`);
    local.input = readFileSync(inputFile, 'utf8');
  }
  if (puzzleFile) {
    if (!existsSync(puzzleFile)) die(`no such puzzle file: ${puzzleFile}`);
    local.page = readFileSync(puzzleFile, 'utf8');
  }
  if (answers) local.answers = answers.split(',').map((a) => a.trim()).filter(Boolean);

  // The cookie is wanted, never required. Part one of a puzzle is a public
  // page; the input, part two and your answers are not. So this fetches what it
  // can and names what it could not, which is more use than refusing outright.
  const cookie = session();
  console.log(`\n  advent of code ${year} -- ${days.length} day(s), ${cookie ? 'signed in' : local.page ? 'from a saved page' : 'ANONYMOUS: part one only'}, cache first\n`);
  for (const number of days) await day(year, number, cookie, local);
  console.log('');
}
