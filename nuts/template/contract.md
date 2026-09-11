Solve this Advent of Code puzzle in `src/solution.js`.

Export two functions:

    part1(input) -> the answer to part one
    part2(input) -> the answer to part two

Each takes the whole puzzle input as one string, exactly as it stands in
`fixtures/input.txt`, and returns the answer. The suite reads that file itself,
calls your functions in a separate process and compares what comes back as
text, so `1234` and `"1234"` are the same answer.

Two conditions, and the second one is not a nicety:

  - **Right.** The answer is compared against the one this account has already
    had accepted for this input. There is no partial credit and no arguing with
    it.
  - **In time.** Each part gets ten seconds on the real input. The worked
    example in the puzzle is small enough that almost anything passes it; the
    real input is not. A solution that is correct and too slow fails the same
    way a wrong one does.

The input file is large. Do not print it, do not paste it back, and do not
write tests -- the suite already exists, it is the binding specification, and
you will not see it.

The puzzle follows, in the site's own words.

---

