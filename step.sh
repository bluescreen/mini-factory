#!/usr/bin/env bash
# Zwischen den Stücken springen, während die Gruppe zusieht.
#
#   ./step.sh nav           blättern mit den Pfeiltasten, q beendet
#   ./step.sh 5             auf Stück 5 springen
#
# Checkt detached aus: der Sprung ist eine Ansicht, kein Zweig. `make build`
# legt das Kurs-Repo ohnehin neu an, hier geht nichts verloren.
set -uo pipefail

# Ein Script, zwei Orte: im Kurs-Repo liegt es drin, im Lab liegt es daneben.
# Die Frage, die beides auseinanderhält, ist nicht der Pfad, sondern ob das Repo
# um das Script herum die Stücke überhaupt als Tags führt.
hier="$(cd "$(dirname "$0")" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "${REPO:-}" ] && [ -n "$hier" ] && [ -n "$(git -C "$hier" tag --list 'step-*' 2>/dev/null)" ]; then
  REPO="$hier"
fi
REPO="${REPO:-$HOME/dev/mini-factory}"
git -C "$REPO" rev-parse --git-dir >/dev/null 2>&1 || { echo "  ⛔ kein Repo: $REPO" >&2; exit 1; }

tags() { git -C "$REPO" tag --list 'step-*' --sort=version:refname; }
last() { tags | tail -1 | sed 's/step-//'; }

current() { # die Nummer des ausgecheckten Stücks, sonst leer
  local head
  head=$(git -C "$REPO" rev-parse HEAD)
  for t in $(tags); do
    [ "$(git -C "$REPO" rev-parse "$t^{commit}")" = "$head" ] && { echo "${t#step-}"; return; }
  done
}

title() { git -C "$REPO" tag -l --format='%(contents:subject)' "step-$1"; }

schmutzig() { [ -n "$(git -C "$REPO" status --porcelain --untracked-files=no)" ]; }

goto() { # $1 = Nummer
  local n="$1"
  git -C "$REPO" rev-parse -q --verify "step-$n" >/dev/null || { echo "  ⛔ kein step-$n (1 … $(last))" >&2; exit 1; }
  if schmutzig; then
    if [ -n "${FORCE:-}" ]; then
      git -C "$REPO" checkout -q --detach --force "step-$n" || exit 1
    else
      echo "" >&2
      echo "  ⛔ $REPO hat ungespeicherte Änderungen — der Sprung würde sie überschreiben:" >&2
      git -C "$REPO" status --porcelain --untracked-files=no | sed 's/^/      /' >&2
      echo "     Wegräumen: git -C $REPO stash    ·    Wegwerfen: FORCE=1 $0 $n" >&2
      echo "" >&2
      exit 1
    fi
  else
    git -C "$REPO" checkout -q --detach "step-$n" || exit 1
  fi
  echo ""
  echo "  ▶ $(title "$n")"
  [ "$n" -gt 1 ] && git -C "$REPO" diff --stat "step-$((n - 1))..step-$n" | sed 's/^/    /'
  echo ""
}

case "${1:-nav}" in
  nav)
    [ -t 0 ] || { echo "  ⛔ nav braucht ein Terminal" >&2; exit 1; }
    n="${2:-$(current)}"; n="${n:-1}"
    clear; goto "$n"
    while :; do
      printf '    \u2190 \u2192 bl\u00e4ttern \u00b7 [d] Diff \u00b7 [q] Schluss  '
      IFS= read -rsn1 taste || break
      case "$taste" in
        q|Q) echo; break ;;
        d|D) echo; git -C "$REPO" diff "step-$((n - 1))..step-$n" | ${PAGER:-less -R}; clear; goto "$n"; continue ;;
        '') n=$((n + 1)) ;;
        $'\e')
          # Pfeiltasten kommen als drei Zeichen: ESC [ C bzw. ESC [ D.
          read -rsn2 -t 0.2 rest
          case "$rest" in
            '[C') n=$((n + 1)) ;;
            '[D') n=$((n - 1)) ;;
            *) continue ;;
          esac
          ;;
        *) continue ;;
      esac
      [ "$n" -lt 1 ] && n=1
      [ "$n" -gt "$(last)" ] && n="$(last)"
      clear; goto "$n"
    done
    ;;
  ''|*[!0-9]*)
    awk 'NR > 1 && /^# ?(<<lab|lab>>)$/ { next } NR > 1 && /^#/ { sub(/^# ?/, ""); print; next } NR > 1 { exit }' "$0"
    exit 1
    ;;
  *)
    goto "$1"
    ;;
esac
