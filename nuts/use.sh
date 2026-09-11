#!/usr/bin/env bash
# Stages one fetched day into a factory working directory.
#
#   nuts/use.sh 2023 12            into the current directory
#   nuts/use.sh 2024 21 ../run     into somewhere else
#
# A day you have not solved has no accepted answer, and so no oracle. It can
# still be run, against a weaker gate: the worked example out of the puzzle,
# which you read off the page and hand in here.
#
#   nuts/use.sh 2025 6 ../run --example ~/aoc/inputs/p6_example.txt --expect 4277556
#
# It writes four things and prints the command that starts the run: the frozen
# suite, the input, the accepted answers, and the goal the factory is handed.
# The input and the puzzle text are excluded from git on the way in -- they are
# not ours to publish, and the lab's commit step adds everything it finds.
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
YEAR=${1:-}
DAY=${2:-}
TARGET=${3:-$PWD}
EXAMPLE=""
EXPECT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --example) EXAMPLE=${2:-}; shift 2 ;;
    --expect)  EXPECT=${2:-}; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "$YEAR" ] || [ -z "$DAY" ]; then
  echo "usage: nuts/use.sh <year> <day> [target-dir]" >&2
  exit 1
fi

PADDED=$(printf '%02d' "$DAY")
CACHE="${AOC_CACHE:-$HERE/.cache}/$YEAR/$PADDED"

if [ ! -f "$CACHE/answers.json" ]; then
  echo "not fetched yet: $YEAR day $DAY" >&2
  echo "  node nuts/aoc.js $YEAR $DAY" >&2
  exit 1
fi

if [ ! -f "$CACHE/input.txt" ]; then
  echo "no input for $YEAR day $DAY — fetch it again with --input <file> or a session cookie." >&2
  exit 1
fi

# Two gates, and which one you get is decided here rather than by a flag: an
# accepted answer is an oracle, and without one the suite can only hold the
# build to the worked example. A suite that asserts nothing at all is not a
# gate, so a day with neither is refused.
HAS_ORACLE=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).answers.filter(Boolean).length ? "yes" : "no")' "$CACHE/answers.json")

if [ "$HAS_ORACLE" = "no" ] && { [ -z "$EXAMPLE" ] || [ -z "$EXPECT" ]; }; then
  echo "$YEAR day $DAY has no accepted answer on your account." >&2
  echo "  Solve it and re-fetch, or gate it on the worked example instead:" >&2
  echo "  nuts/use.sh $YEAR $DAY $TARGET --example <file> --expect <the number the puzzle states>" >&2
  exit 1
fi

mkdir -p "$TARGET/test" "$TARGET/fixtures" "$TARGET/.aoc"
rm -f "$TARGET/test/aoc.test.js" "$TARGET/test/explore.test.js"
cp "$CACHE/input.txt" "$TARGET/fixtures/"
cp "$CACHE/puzzle.md" "$TARGET/.aoc/puzzle.md"

if [ "$HAS_ORACLE" = "yes" ]; then
  cp "$HERE/template/aoc.test.js" "$TARGET/test/aoc.test.js"
  cp "$CACHE/answers.json" "$TARGET/fixtures/answers.json"
  cat "$HERE/template/contract.md" "$CACHE/puzzle.md" > "$TARGET/.aoc/goal.md"
else
  cp "$HERE/template/explore.test.js" "$TARGET/test/explore.test.js"
  cp "$EXAMPLE" "$TARGET/fixtures/example.txt"
  node -e 'const fs=require("fs");const day=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));day.expect=process.argv[2].split(",").map(s=>s.trim()).filter(Boolean);fs.writeFileSync(process.argv[3],JSON.stringify(day,null,2)+"\n")' \
    "$CACHE/answers.json" "$EXPECT" "$TARGET/fixtures/answers.json"
  cat "$HERE/template/contract-explore.md" "$CACHE/puzzle.md" > "$TARGET/.aoc/goal.md"
fi

# The same handle workshop 15 uses for its event log: an exclude that lives in
# the repo but is not part of it. `git add -A` in the commit step would
# otherwise carry all three into the branch, and with FACTORY_PR=1 into GitHub:
# the input, the goal, and the envelopes, which quote the puzzle back in full.
if [ -d "$TARGET/.git" ]; then
  for LINE in 'fixtures/' '.aoc/' '.adw/'; do
    grep -qxF "$LINE" "$TARGET/.git/info/exclude" 2>/dev/null || echo "$LINE" >> "$TARGET/.git/info/exclude"
  done
fi

TITLE=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).title ?? "")' "$CACHE/answers.json")

cat <<EOF

  staged: $YEAR day $DAY — $TITLE

    test/                 the gate — $([ "$HAS_ORACLE" = yes ] && echo "the answers your account already earned" || echo "the worked example, and no oracle beyond it")
    fixtures/input.txt    your input, excluded from git
    .aoc/goal.md          the puzzle, as the factory will read it

  Run it. The gate is the second argument, because a nut is judged on the
  answer and the clock, not on a coverage floor:

    node factory.js "\$(cat .aoc/goal.md)" "node --test"

  Give it longer than ten seconds if the day deserves it:

    AOC_BUDGET_MS=30000 node factory.js "\$(cat .aoc/goal.md)" "node --test"

EOF
