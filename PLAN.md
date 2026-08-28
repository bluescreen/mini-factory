# Implement a FizzBuzz function

**Spec — FizzBuzz (ESM, Node built-ins only)**

1. Public API — `src/fizzbuzz.js`, two named exports:
2. `fizzbuzz(n)` → `string`: `"Fizz"` if n % 3 === 0, `"Buzz"` if n % 5 === 0, `"FizzBuzz"` if both, otherwise `String(n)`.
3. `fizzbuzzRange(start, end)` → `string[]`: inclusive range, one `fizzbuzz` entry per value, ascending only.
4. Data structures — none beyond a plain `string[]`; no classes, no config object, no lookup table.
5. Steps — (a) implement `fizzbuzz` with a divisible-by-15 check first, then 3, then 5, then fallback; (b) implement `fizzbuzzRange` as a loop over `fizzbuzz`; (c) write the test file; (d) run `npm test` and confirm the coverage gate passes.
6. Edge cases — `0` is divisible by both → `"FizzBuzz"`; negative numbers work by the same rule (`-15` → `"FizzBuzz"`, `-1` → `"-1"`).
7. Non-integers and non-numbers (`NaN`, `1.5`, `"3"`, `undefined`) → throw `TypeError`; guard with `Number.isInteger`.
8. `fizzbuzzRange` with `start > end` → empty array; both bounds validated by the same integer guard.
9. Files to write — `src/fizzbuzz.js` (implementation), `test/fizzbuzz.test.js` (`node:test` + `node:assert/strict`).
10. Test cases — the four classification branches, `0`, a negative multiple, a `TypeError` case, a normal range, and the empty-range case.
11. Verification — `npm test` green; the `test` script requires a real `node:assert` import and enforces ≥60% line coverage, which the eight cases above clear.
12. Out of scope — no CLI, no printing to stdout, no package entry point change.
