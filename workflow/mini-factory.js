export const meta = {
  name: 'mini-factory',
  description: 'Dieselbe Kette wie das Lab, als Workflow: plan → build → gate → review → CRAP → commit',
  whenToUse: 'Wenn ein Ziel zu einem Branch werden soll und jede Phase überprüfbar bleiben muss. args: { dir, goal, crapMax?, repairs?, lenses? }',
  phases: [
    { title: 'Plan' },
    { title: 'Build' },
    { title: 'Gate' },
    { title: 'Review' },
    { title: 'Commit' },
  ],
}

const dir = args?.dir
const goal = args?.goal ?? 'Implement the tennis kata'
const CEILING = args?.crapMax ?? 30
const MAX_REPAIRS = args?.repairs ?? 3
const LENSES = args?.lenses ?? ['correctness', 'edge cases', 'the goal itself']

if (!dir) throw new Error('args.dir is required — the factory must never write into the session root')

const FILES = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: { path: { type: 'string' }, content: { type: 'string' } },
        required: ['path', 'content'],
      },
    },
  },
  required: ['files'],
}

const GATE = {
  type: 'object',
  properties: { pass: { type: 'boolean' }, output: { type: 'string' } },
  required: ['pass', 'output'],
}

const VERDICT = {
  type: 'object',
  properties: { verdict: { type: 'string', enum: ['ship', 'revise'] }, reason: { type: 'string' } },
  required: ['verdict', 'reason'],
}

const METRICS = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          branches: { type: 'integer' },
          coverage: { type: 'number' },
        },
        required: ['path', 'branches', 'coverage'],
      },
    },
  },
  required: ['files'],
}

const inDir = `Work only inside ${dir}. Never touch anything outside it.`

phase('Plan')
const plan = await agent(
  `${inDir}

Goal: ${goal}

Write a short specification and implementation plan: the public API, the data
structures, the steps, the edge cases, and which files to write. At most 20
lines. No code. Do not write any file.`,
  { label: 'plan', model: 'opus' },
)

let feedback = ''
let builds = 0
let result = { pass: false, why: '' }

while (builds <= MAX_REPAIRS) {
  builds += 1
  if (feedback) log(`repair ${builds - 1}/${MAX_REPAIRS} — ${result.why}`)

  const proposal = await agent(
    `${inDir}

Goal: ${goal}

Specification and plan:

${plan}

${feedback}

Write the implementation and the tests that prove it, in JavaScript ESM only.
Tests are node:test files under test/ that import from ../src/ and use
node:assert. Return the complete set of files every time.

Do NOT write, edit or create any file yourself. Return them as data only.`,
    { label: `build-${builds}`, phase: 'Build', model: 'sonnet', schema: FILES },
  )

  const scoped = proposal.files.filter((f) => /(^|\/)(src|test)\//.test(f.path))
  const refused = proposal.files.length - scoped.length
  if (refused) log(`refused ${refused} file(s) outside src/ and test/ — the gate definition is not the builder's to rewrite`)

  await agent(
    `${inDir}

Write exactly these files, byte for byte, creating directories as needed.
Change nothing else, add nothing, reformat nothing.

${JSON.stringify(scoped, null, 2)}`,
    { label: `apply-${builds}`, phase: 'Build', model: 'haiku' },
  )

  const gate = await agent(
    `${inDir}

Run \`npm test\` and report the result. Do not fix anything, do not edit any
file — only run it and report. pass is the exit code being 0. output is the
last 2000 characters of stdout and stderr.`,
    { label: `gate-${builds}`, phase: 'Gate', model: 'haiku', schema: GATE },
  )

  if (!gate.pass) {
    result = { pass: false, why: 'gate red' }
    feedback = `Your last attempt was rejected:\n\n${gate.output}`
    continue
  }

  const written = scoped.map((f) => f.path).join(', ')
  const reviews = await parallel(
    LENSES.map((lens) => () =>
      agent(
        `${inDir}

Goal: ${goal}

Plan:

${plan}

The build phase wrote: ${written}. The test suite passes.

Review the work through one lens only: ${lens}. Judge against the goal and the
plan — not against the tests, because the same phase wrote both, so the suite
proves consistency rather than correctness.

Default to ship. Answer revise only if something the goal asks for is missing
or wrong. Style, naming and nice-to-haves are not reasons to revise.
Do not edit any file.`,
        { label: `review:${lens}`, phase: 'Review', model: 'opus', schema: VERDICT },
      ),
    ),
  )

  const votes = reviews.filter(Boolean)
  const ships = votes.filter((v) => v.verdict === 'ship').length
  const dissent = votes.find((v) => v.verdict === 'revise')
  log(`review ${ships}/${votes.length} ship${dissent ? ` · dissent: ${dissent.reason}` : ''}`)

  if (ships <= votes.length / 2) {
    result = { pass: false, why: `review ${ships}/${votes.length}` }
    feedback = `Your last attempt was rejected:\n\n${votes.map((v) => `${v.verdict}: ${v.reason}`).join('\n')}`
    continue
  }

  const metrics = await agent(
    `${inDir}

Run \`node --test --experimental-test-coverage\` and report, for every file
under src/ that appears in the coverage table:

  path      — relative to ${dir}
  branches  — cyclomatic complexity: count if, for, while, case, catch, &&, ||,
              ?? and ternary ?, then add 1
  coverage  — the line percentage from the table, as a fraction between 0 and 1

Report measurements only. Do not judge, do not edit, do not fix.`,
    { label: `measure-${builds}`, phase: 'Gate', model: 'haiku', schema: METRICS },
  )

  const scored = metrics.files.map((f) => ({
    ...f,
    crap: Math.round(f.branches ** 2 * (1 - f.coverage) ** 3 + f.branches),
  }))
  const worst = scored.reduce((a, b) => (b.crap > a.crap ? b : a), { path: '—', crap: 0 })
  log(`crap ${worst.crap}/${CEILING} — worst: ${worst.path}`)

  if (worst.crap > CEILING) {
    result = { pass: false, why: `CRAP ${worst.crap}/${CEILING}` }
    feedback = `Your last attempt was rejected:\n\nCRAP ${worst.crap} in ${worst.path} is over the ceiling of ${CEILING}. Fewer branches, or more coverage.`
    continue
  }

  result = { pass: true, why: '', worst, ships, votes: votes.length, files: scoped.map((f) => f.path) }
  break
}

if (!result.pass) {
  log(`stopped after ${builds} builds — ${result.why}`)
  return { shipped: false, builds, reason: result.why }
}

phase('Commit')
const branch = await agent(
  `${inDir}

Check out a new branch named factory/<something short and descriptive derived
from the goal>, stage everything, and commit with the message
"feat: ${goal}". Do not push. Do not merge. Report the branch name only.`,
  { label: 'commit', model: 'haiku' },
)

log(`shipped on ${branch.trim()} after ${builds} build(s)`)

return {
  shipped: true,
  builds,
  branch: branch.trim(),
  files: result.files,
  review: `${result.ships}/${result.votes} ship`,
  crap: `${result.worst.crap}/${CEILING}`,
}
