# Die harten Nüsse

Die Tennis-Kata beweist die Kette, nicht die Fabrik. Sie steht tausendfach in
den Trainingsdaten, das Modell kann sie auswendig, und was dann grün wird, ist
Erinnerung. Eine Fabrik zeigt erst, was sie kann, wenn die Aufgabe im ersten
Anlauf reißt und der Rücksprung sie holt.

Eine Nuss ist ein Tag aus **Advent of Code**. Er bringt mit, was eine gute
Aufgabe braucht und was sich sonst niemand ausdenken mag:

| Was | Woher |
|---|---|
| die Spezifikation | der Rätseltext, in den Worten des Autors, mit durchgerechnetem Beispiel |
| das Orakel | deine Antwort, die die Seite schon akzeptiert hat |
| die zweite Hälfte der DoD | Teil 2, der die Lösung aus Teil 1 zuverlässig sprengt |

Die letzte Zeile ist der Punkt. Fast jeder harte Tag hat eine Lösung, die am
Beispiel im Rätseltext richtig ist und am echten Input bis morgen früh rechnet.
Ein Gate ohne Uhr kann die beiden nicht unterscheiden, und ein Modell merkt den
Unterschied von allein nicht.

## Hier liegt kein Rätsel

Kein Rätseltext, kein Input, keine Antwort. Beides gehört adventofcode.com und
ist nicht unseres zum Weitergeben. Der Fetcher holt es mit **deinem**
Session-Cookie in den `.cache/`, der Cache ist ignoriert, und `use.sh` trägt
`fixtures/` in `.git/info/exclude` ein, bevor irgendwas läuft. Sonst nimmt der
Commit-Schritt der Fabrik den Input mit, und mit `FACTORY_PR=1` landet er auf
GitHub.

Der Cookie ist ein Passwort. Er steht in `.session` oder in `AOC_SESSION`,
beide sind ignoriert, und er geht in keinen Envelope und in keinen Prompt.

## Drei Befehle

```bash
node nuts/aoc.js 2023 12         # holen: Rätsel, Input, deine Antworten
nuts/use.sh 2023 12              # aufstellen: Suite, Input, Ziel
node factory.js "$(cat .aoc/goal.md)" "node --test"
```

Der Fetcher hält sich an die Regeln der Seite: einmal holen und nie wieder,
zwei Sekunden Pause zwischen zwei Anfragen, und ein User-Agent, der einen
Menschen benennt. Was schon im Cache liegt, wird nicht erneut geholt.

### Ohne Cookie

Teil 1 eines Rätsels ist eine öffentliche Seite, der Rest nicht. Ohne Cookie
holt der Fetcher also die Hälfte und sagt, was fehlt. Wer den Tag längst gelöst
hat, hat den Rest ohnehin auf der Platte:

```bash
# die Seite im Browser markieren, kopieren, nach nuts/.pages/ sichern
node nuts/aoc.js 2025 1 --puzzle .pages/2025-01.md --input ~/aoc/inputs/p1.txt
```

`--puzzle` nimmt den Text so, wie er aus dem Browser kommt, und zieht Teil 2
und beide Antworten daraus. Die Zeilen `Your puzzle answer was …` fallen dabei
raus, und zwar ausdrücklich: im Markup stehen sie außerhalb der Artikel, im
Text-Abzug stehen sie mittendrin. Eine Antwort, die in der Spezifikation
stehen bleibt, ist keine harte Nuss, sondern ein Builder, der die Zahl
zurückgibt, die man ihm gesagt hat. Ein Test hält das offen.

**Du brauchst einen Tag, den du selbst gelöst hast.** Nur dann steht auf deiner
Rätselseite `Your puzzle answer was …`, und genau die Zeile ist das Orakel.
Einen Tag ohne akzeptierte Antwort weist `use.sh` ab, statt eine Suite
aufzustellen, die nur grün werden kann.

## Ein Tag, den du nicht gelöst hast

Dann gibt es kein Orakel, und das Gate kann nicht fragen, ob die Antwort
stimmt. Es kann drei andere Dinge fragen, und `use.sh` stellt dafür die
schwächere Suite auf:

```bash
nuts/use.sh 2025 6 --example ~/aoc/inputs/p6_example.txt --expect 4277556
```

Geprüft wird dann: das durchgerechnete Beispiel aus dem Rätsel liefert die Zahl,
die im Rätsel steht; der echte Input liefert zweimal dasselbe; beides bleibt im
Budget. Am Ende druckt die Suite die Antwort, die dabei herauskam, und den Satz
dazu: *nichts hier sagt, dass sie stimmt.*

Offen bleibt der Fall, den auch die Determinismus-Prüfung nicht sieht: ein Bau,
der das Beispiel als Sonderfall abfängt, besteht alle drei Punkte. Erst das
Einreichen schließt diese Lücke, und Einreichen ist Handarbeit. Genau darin
liegt der Wert des Laufs: du siehst den Unterschied zwischen einem Gate mit
Orakel und einem ohne, an derselben Fabrik, am selben Tag.

## Was das Gate prüft

Zwei Bedingungen je Teil, und die zweite ist die, die man vergisst:

- **Richtig.** Die Antwort wird gegen die verglichen, die für diesen Input
  bereits akzeptiert wurde. Kein Teilerfolg, keine Diskussion.
- **In der Zeit.** Zehn Sekunden je Teil, über `AOC_BUDGET_MS` verstellbar. Eine
  korrekte und zu langsame Lösung fällt durch wie eine falsche.

Beide Hälften laufen in einem Kindprozess. Das ist keine Ordnungsliebe: eine
Lösung, die neu rechnet statt sich zu merken, blockiert den Thread synchron, und
kein Test-Timeout unterbricht einen Loop, der nie abgibt. Ein Gate, das
hängt, ist kein Gate. Im Kindprozess beendet ein `SIGTERM` die Sache nach
Budget, und der Rücksprung bekommt einen Satz, mit dem er etwas anfangen kann:
*war nach 10000 ms noch am Rechnen*.

Das Gate ist deshalb das zweite Argument von `factory.js` und nicht `npm test`:
eine Nuss wird an der Antwort und an der Uhr gemessen, nicht an einer
Coverage-Schwelle.

## Welcher Tag

Such einen, dessen Teil 2 die Bauform aus Teil 1 sprengt, nicht bloß die
Zahlen vergrößert. Wo eine Liste zu einer Zählung werden muss, eine Rekursion
zu einer gemerkten, eine Suche zu einer über dem richtigen Zustand. Das sind
die Tage, an denen der zweite Bau-Durchgang sichtbar etwas anderes tut als der
erste.

Zur Ehrlichkeit gehört: berühmte Tage stehen als Lösung auf GitHub, und ein
Modell hat sie gesehen. Was es nicht gesehen hat, ist dein Input, und
auswendig gelernt wird auch keine Laufzeit. Ein erinnerter Ansatz, der zu
langsam ist, fällt hier trotzdem durch.

## Vierundzwanzig auf einmal

Geht, aber nicht hier. Das Lab ist eine Kette in einem Raum mit einer Stunde
Zeit. Der Fan-out über viele unabhängige Tage ist die Topologie von
[Workshop 15](../../../15-sandbox-factory/): eine Box je Tag, ein Worktree je
Box, ein Judge am Ende. `node nuts/aoc.js 2024 1-25` füllt den Cache dafür in
einem Zug.

Dann ist die Fabrik nicht mehr nur vorgeführt, sondern gemessen: *achtzehn von
vierundzwanzig grün, zu diesem Preis*. Das ist eine Zahl, und Zahlen schlagen
Behauptungen.
