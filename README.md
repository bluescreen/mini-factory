# mini-factory

Eine Software-Fabrik, klein genug, um sie in einer Stunde selbst zu bauen: ein
Satz auf der Kommandozeile wird zu einem Branch, den ein Mensch mergt. Fünf
Dateien, gut 130 Zeilen, keine Abhängigkeit.

```bash
git clone git@github.com:bluescreen/mini-factory.git && cd mini-factory
```

Was du dann vor dir hast, ist ein leeres Node-Projekt und diese Anleitung —
**nicht** die fertige Fabrik. Die baust du. Aus der Workshop-Serie
*Agent Roster*, Modul 12: die Software-Fabrik.

## Das Lab: von leerem Git zur laufenden Fabrik

Von leerem Git zur laufenden Fabrik, in zweiundzwanzig Stücken, jedes für sich lauffähig. Du baust nichts nach. Du lässt Claude Code bauen und prüfst nach jedem Stück mit einem Befehl, ob es hält. Die Stunde im Titel sind die ersten sieben Stücke. Danach steht eine Fabrik, die einen Satz in einen Branch verwandelt: 193 Zeilen in zwei Dateien. Alles danach ist kein Kursstoff für dieselbe Stunde, sondern der Weg nach draußen, in fünf Etappen: der Review fächert auf, die Abrechnung wechselt vom Abo auf ein Gateway und bekommt einen Deckel, die Fabrik verlässt den Laptop, aus einer Fabrik werden n mit Judge und DoD und Board, und zuletzt löst ein Commit den Lauf aus. Am Ende sind es 592 Zeilen, und die Aufgabe ist keine Kata mehr, sondern ein Tag aus Advent of Code.

**Der Kursstoff endet bei Stück 13.** Dort ist die Fabrik vom Laptop weg und
läuft auf einem Rechner, der dir nicht gehört. Zwei Termine teilen sich den Weg
dorthin: **Modul 12** baut die Kette, Stück 1 bis 7, eine Stunde. **[Die Fabrik
zieht um](../../15-sandbox-factory/)** nimmt sie dort auf und stellt sie auf den
Cluster — die Gruppe baut 9 und 10, dann 11 bis 13, das sind 39 Minuten. Stück 8
bleibt beide Male liegen; es ist optional und kostet zwölf.

Alles ab Stück 14 ist der Stoff danach. Es steht hier, damit es nachlesbar ist,
nicht damit es im Termin drankommt.

Ein Satz auf der Kommandozeile macht daraus einen Branch:

```bash
node factory.js "Implement the tennis kata"
```

```
planner → builder → gate → review → commit
 Urteil   Ausführung  Code   Urteil    Vorschlag
```

Zwei Prüfungen vor dem Commit: das **Gate** fragt „läuft es?", der **Review**
fragt „ist es das, was verlangt war?". Beide enden im selben Rücksprung.

Das Gesetz dahinter ist das von Workshop 12: **Agenten schlagen vor, Code
entscheidet.** Alles andere ist die kleinste Verkabelung, die es lauffähig
macht — fünf Dateien, keine 200 Zeilen, keine Abhängigkeit.

## Bevor es losgeht

| Voraussetzung | Prüfen mit |
|---|---|
| Node ≥ 20 | `node --version` |
| Git | `git --version` |
| GitHub per SSH | `ssh -T git@github.com` — muss dich beim Namen nennen |
| Claude Code, eingeloggt | `claude -p "sag ok" --tools ""` |

Der letzte Befehl ist der wichtige: das Lab läuft von der ersten Minute an
gegen echte Modelle. `--tools ""` nimmt dem Agenten die Hände — er antwortet mit
Text, schreiben tut die Fabrik. Wer das weglässt, bekommt irgendwann den Satz
„Awaiting permission to write…" in seine Datei geschrieben.

### Zwischen den Stücken springen

Jedes Stück liegt als Tag im Kurs-Repo, und `step.sh` blättert darin. Wer den
Anschluss verliert, schreibt nichts ab und überspringt nichts — er springt.

```bash
./step.sh nav        # blättern mit den Pfeiltasten, [d] zeigt den Diff, q beendet
./step.sh 5          # auf Stück 5 springen
```

Der Sprung checkt detached aus: eine Ansicht, kein Zweig. `git switch main`
bringt dich zu deinem eigenen Stand zurück.

`step.sh` ist dabei nur bequemer, nicht nötig — die Stücke sind gewöhnliche
Tags. `git switch --detach step-5` tut dasselbe, `git tag -n` ist das
Inhaltsverzeichnis, und `git diff step-4 step-5` zeigt, was ein Stück
hinzufügt.

| # | Stück | Technik | Zeit | Danach kannst du |
|---|---|---|---|---|
| 1 | [Das leere Projekt](#1-das-leere-projekt) | **Setup** | 5 min | `npm test` — und es gibt nichts zu testen |
| 2 | [Der Planner](#2-der-planner) | **Prompt** | 10 min | einen Plan erzeugen und nachlesen |
| 3 | [Der Builder](#3-der-builder) | **Ausführung** | 10 min | Dateien entstehen lassen — ungeprüft |
| 4 | [Die Übergabe](#4-die-übergabe) | **Envelope** | 5 min | sehen, wie der Plan beim Builder ankommt |
| 5 | [Das Gate und der Rücksprung](#5-das-gate-und-der-rücksprung) | **Gate** | 12 min | rot → zurück an Build → grün |
| 6 | [Der Review](#61-der-review) | **Urteil** | 10 min | ein zweites Gate — gegen das Ziel statt gegen den Lauf |
| 7 | [Der Commit und die Rechnung](#7-der-commit-und-die-rechnung) | **Kosten** | 8 min | einen Branch und den Preis des Laufs |
| 8 | [Der Review fächert auf](#8-der-review-fächert-auf-optional) | **Fan-out** | +12 min | **optional** — drei Lenses gleichzeitig, Mehrheit entscheidet |
| 9 | [Von der Subscription zur API-Abrechnung](#9-von-der-subscription-zur-api-abrechnung) | **Gateway** | 6 min | über ein Gateway zahlen und das Roster wechseln, ohne den Code anzufassen |
| 10 | [Der Deckel](#10-der-deckel) | **Budget** | 8 min | einen Lauf ansehen, der sich selbst anhält |
| 11 | [Die Box](#11-die-box) | **Isolation** | 8 min | die Fabrik in einem Container laufen lassen — und sehen, was dabei bricht |
| 12 | [Der Fahrer](#12-der-fahrer) | **Lebenszyklus** | 12 min | säen, laufen lassen, ernten, abreißen — als ein Befehl |
| 13 | [Die fremde Maschine](#13-die-fremde-maschine) | **Remote** | 5 min | denselben Befehl auf einem Rechner, der dir nicht gehört |
| | **— bis hier reicht der Kursstoff: die Fabrik ist umgezogen —** | | | ab hier: [Workshop 15](../../15-sandbox-factory/) |
| 14 | [Der Plan als Datei, und der Linter davor](#14-der-plan-als-datei-und-der-linter-davor) | **Linter** | 8 min | einen Plan schreiben, den der Linter ablehnt |
| 15 | [Das App-Repo draußen, ein Worktree je Kandidat](#15-das-app-repo-draußen-ein-worktree-je-kandidat) | **Worktree** | 8 min | jedem Kandidaten seinen eigenen Arbeitsplatz geben |
| 16 | [n Kandidaten statt einem](#16-n-kandidaten-statt-einem) | **Best-of-N** | 10 min | dieselbe Aufgabe mehrfach lösen lassen |
| 17 | [Ein Kandidat, ein Prozess](#17-ein-kandidat-ein-prozess) | **Parallelität** | 6 min | dieselben Kandidaten nebeneinander fahren |
| 18 | [Der Judge](#18-der-judge) | **Auswahl** | 8 min | den billigsten grünen Kandidaten küren lassen |
| 19 | [Das DoD-Gate](#19-das-dod-gate) | **Alignment** | 10 min | grün heißen lassen, was der Plan verlangt hat |
| 20 | [Das Board](#20-das-board) | **Observability** | 10 min | einem Lauf zusehen und ihn danach noch nachlesen |
| 21 | [Die Fabrik verlässt die Maschine](#21-die-fabrik-verlässt-die-maschine) | **GitOps** | 8 min | einen Lauf per Commit auslösen |
| 22 | [Die harte Nuss](#22-die-harte-nuss) | **Orakel** | 15 min | eine Aufgabe lösen lassen, die niemand auswendig kann — mit dem Orakel von der Seite |

Gemessen sind die ersten sieben Stücke, im Kurs, mit echten Modell-Läufen.
Was danach kommt, ist geschätzt — und steht hier, damit niemand es für
gemessen hält.

Die Zahlen sind nach dem ersten Kurs korrigiert. Vorher stand 35 Minuten hier,
und das war zu knapp: jeder Schritt endet mit einem echten Modell-Lauf, und
zwei Minuten Latenz plus ein Blick in den Envelope sind pro Stück realistischer
als eine. Der [CRAP-Check](#62-der-crap-check-nach-dem-kurs) steht bewusst
nicht mehr im Budget — er ist Lesestoff für danach.

Stücke 1–5 plus Commit sind der 30-Minuten-Kern, der Review die zusätzlichen
fünf. Wer knapp in der Zeit ist, hängt ihn hinterher an — die Kette läuft ohne
ihn.

**Stück 8 gehört nicht zum Lab.** Die Fabrik ist mit Stück 7 fertig und
lauffähig; acht ist die Kür, die die Graph-Achse anprobiert. Wer nach sieben
aufhört, hat nichts verpasst.

## Wenn du hängst oder den Anschluss verlierst

Jedes Stück liegt als Tag im Repo. Du musst nichts abschreiben und nichts
überspringen:

```bash
./step.sh nav                       # blättern mit den Pfeiltasten, [d] zeigt den Diff
git tag -n                          # das Inhaltsverzeichnis: 22 Schritte
git diff step-2 step-3              # genau das, was Stück 3 hinzufügt
git switch --detach step-3          # den Stand anschauen
git switch main                     # zurück zu deinem eigenen
```

Und der wichtigste, wenn dein Stand nicht läuft und die Gruppe weiterzieht —
er holt die Dateien eines Schrittes in deinen Baum, ohne deine eigene Arbeit
oder deinen Branch anzufassen:

```bash
git restore --source=step-4 -- .
```

`main` steht auf Stück 1. Die volle Kette liegt auf dem Branch `solution` —
derselbe Stand wie `step-22`, aber als Branch, den man auschecken und
weiterbauen kann:

```bash
git switch solution
```

Sie ist erreichbar, aber sie liegt dir nicht im Weg.
Steckst du fest: [`solution/`](solution/) ist der fertige Stand der Kette,
[`panel/`](panel/) der von Stück 8. Und wenn die Kette steht und die Kata zu
leicht war: [`nuts/`](nuts/) richtet sie auf [einen Tag aus Advent of
Code](#22-die-harte-nuss).

**Im Kurs-Repo liegt jedes Stück als Tag.** Die Teilnehmer klonen
[bluescreen/mini-factory](https://github.com/bluescreen/mini-factory) und
bekommen `main` — das leere Projekt und diese Anleitung, nicht die Lösung. Wer
den Anschluss verliert, zieht einen Schritt nach, ohne die eigene Arbeit
anzufassen:

```bash
git tag -n                          # das Inhaltsverzeichnis: acht Schritte
git diff step-3 step-4              # genau das, was ein Stück hinzufügt
git restore --source=step-4 -- .    # den Stand in den eigenen Baum holen
git switch --detach step-4          # ihn nur anschauen
git switch solution                 # die volle Kette, als Branch
```

Der Branch `solution` steht auf Stück 8. Ein Tag lädt zum Anschauen ein, ein
Branch zum Weiterbauen — wer nach dem Kurs etwas Eigenes durch die Fabrik
schicken will, startet dort und nicht auf `main`.

Gebaut wird das Repo aus diesem Verzeichnis — die Zwischenstände stehen in
[`build-steps.py`](build-steps.py), der fertige Stand kommt aus `solution/`, und
[`verify-steps.sh`](verify-steps.sh) lässt jeden Tag gegen ein gefälschtes
`claude` laufen.

```bash
python3 build-steps.py ~/dev/mini-factory
./verify-steps.sh ~/dev/mini-factory
```

---

## 1. Das leere Projekt

**Ziel:** ein leeres Node-Projekt. Mehr nicht — es gibt noch keine Aufgabe, kein
`src/`, keinen Test. Die Fabrik bringt beides selbst hervor.

```bash
mkdir mini-fabrik && cd mini-fabrik
git init && npm init -y && npm pkg set type=module
npm pkg set scripts.factory='node factory.js'
npm pkg set scripts.reset="rm -rf .adw src test PLAN.md && echo 'weg: .adw src test PLAN.md'"
npm pkg set scripts.test='grep -q "node:assert" test/*.js 2>/dev/null || { echo "no test with an assertion — a gate without cases is not a gate"; exit 1; }; node --test --experimental-test-coverage --test-coverage-lines=60'
printf '.adw/\n.env*\n' > .gitignore
claude
```

Die Reihenfolge im `package.json` ist die Reihenfolge des Labs: `factory`
startet einen Lauf, `reset` macht den Tisch leer, `test` **ist** das Gate.

```bash
npm run factory -- "Implement a FizzBuzz function"    # die zwei Bindestriche gehören dazu
npm run reset
```

Zwei Dinge, die `reset` **nicht** tut, und beide sind Absicht. Es räumt `src/`
und `test/` weg — nur hier vertretbar, in einem echten Repo eine Katastrophe.
Und es lässt dich auf dem `factory/<lauf>`-Branch stehen, auf dem der letzte
Lauf committet hat — Branches wirft man nicht mit weg. Vor dem nächsten Lauf
also `git switch main`.

**Verify:**

```bash
npm test            # nichts zu tun — noch existiert kein Test
```

**Warum:** der ehrliche Startpunkt. Die Fabrik bekommt einen Satz und liefert
einen Branch; alles dazwischen entsteht unterwegs.

---

## 2. Der Planner

**Ziel:** die erste Agent-Phase. Sie schreibt keinen Code, sie schreibt ein
Urteil — und legt es als typisierte Übergabe ab.

Prompt:

```text
Bau die erste Phase einer Mini-Fabrik, zwei Dateien:

planner.prompt — ein Prompt-Template auf Englisch mit den Platzhaltern {{goal}}
und {{binding}}. Es verlangt eine kurze Spezifikation und einen
Implementierungsplan: öffentliche API, Datenstrukturen, Schritte, Randfälle und
welche Dateien geschrieben werden. JavaScript ESM only, ausdrücklich keine
andere Sprache — derselbe Satz wie im builder.prompt, sonst plant der Planner
etwas, das der Builder nie baut. Höchstens 20 Zeilen, kein Code, keine
Rückfragen und kein Schlusssatz: der Plan wird als PLAN.md committet, niemand
antwortet darauf.

util.js — die Mechanik, sprechende Namen:
- beim Import ein Lauf-Verzeichnis .adw/<timestamp>/ anlegen und einen
  Schrittzähler führen (01, 02, …)
- prompt(file, vars): Template laden, {{key}} ersetzen, übrige Platzhalter leeren
- phase(role, model, text): den kompilierten Prompt als NN-<role>.prompt.md
  ablegen, dann `claude -p <text> --tools "" --output-format json --model
  <model>` per spawnSync aufrufen, aus der JSON-Antwort result nehmen, das Ganze
  als NN-<role>.json ablegen, eine Zeile "NN  AGENT  <role>  <model>" loggen und
  den Text zurückgeben. Exit-Code ungleich 0 wirft.

factory.js — Ziel aus process.argv[2], Modelle als Konstanten oben im File
(Planner claude-sonnet-5, Builder claude-haiku-4-5), ruft den Planner auf.
Sonst nichts.
```

**Verify:**

```bash
node factory.js "Implement the tennis kata"
cat .adw/*/01-plan.json          # der Plan als Envelope
cat .adw/*/01-plan.prompt.md     # und was tatsächlich gesendet wurde
```

**Warum:** zwei Dinge liegen jetzt auf der Platte. Der **Envelope** — eine
Phase, die man `cat`en kann, kann man debuggen. Und der **kompilierte Prompt**
daneben: was gesendet wurde. Der Prompt liegt als Datei im Git und ist damit im
Review sichtbar wie jede andere Änderung.

---

## 3. Der Builder

**Ziel:** die zweite Agent-Phase. Sie liefert Code und Tests — und niemand
prüft sie.

Prompt:

````text
Ergänze die Build-Phase:

builder.prompt — englisches Template mit {{goal}}, {{plan}}, {{feedback}} und
{{tests}}. Es verlangt JavaScript ESM und jedes Mal den vollständigen
Dateisatz. Jede Datei kommt als Codeblock mit Pfad-Label zurück, also
```js path=src/foo.js, und ohne Prosa außerhalb der Blöcke.

util.js — hasTests(): liegt unter test/ schon eine .js-Datei? Das Ergebnis
einmal beim Import in eine Konstante, denn nach dem ersten Bau ist die Antwort
eine andere. Daraus TESTS: der Satz, der in {{tests}} wandert — „schreib keine
Tests, die Suite steht schon und du siehst sie nicht" oder „schreib die Tests,
die es beweisen".

Liegt eine Suite da, hängt TESTS deren Schnittstelle an: aus jedem test/*.js
die Namen, die aus ../src/ importiert werden, und zu jedem der erste Aufruf,
klammerbalanciert ausgeschnitten — also upTo(3), nicht die Zeile drumherum.
Nur die Signatur, keine Erwartung. Dazu SUITE: eine Zeile für die Kopfzeile,
die sagt, dass der Builder blind baut.

util.js — phase() schreibt die Dateien selbst: alle Blöcke mit Pfad-Label aus
der Antwort schneiden, Verzeichnisse anlegen, schreiben und die Pfade loggen.
Vorher löscht sie, was die vorige Runde geschrieben hat. Eine Antwort ohne
Pfad-Label schreibt nichts — die Planner-Phase läuft also unverändert durch.
Lag beim Start schon eine Suite da, werden Blöcke unter test/ verworfen und
gezählt gemeldet.

factory.js — nach dem Planner den Builder aufrufen.
````

**Verify:**

```bash
node factory.js "Implement the tennis kata"
ls src test                      # beide sind eben entstanden
npm test                         # … und ob es stimmt, weiß bisher nur du
```

**Warum:** genau hier hört die Prompt-Ebene auf. Das Ergebnis liegt im Baum —
der einzige Prüfer bist du, jedes Mal, von Hand. Diesen Zustand schaffen die
nächsten beiden Stücke ab.

Zwei Details, die teurer sind, als sie aussehen:

- **Der Builder hat keine Tools.** Er schlägt Text vor, die Fabrik schreibt die
  Dateien — nur die, deren Pfad er im Label genannt hat. Es gibt genau einen
  Weg in den Baum, und er führt durch `phase()`.
- **Eine Phase besitzt ihre Ausgabe.** Was die vorige Runde geschrieben hat,
  fliegt vorher weg. Ohne das: Runde 3 legt `src/tennisGame.ts` an, der Test
  importiert weiterhin die `.js` von Runde 2, und das Gate benotet eine Datei,
  die niemand mehr baut — der Loop konvergiert nie.

---

## 4. Die Übergabe

**Ziel:** aus zwei Phasen eine Kette machen. Der Plan wandert in den
Builder-Prompt.

Prompt:

```text
Reich den Plan weiter: das Ergebnis der Planner-Phase füllt {{plan}} im
builder.prompt.
```

**Verify:**

```bash
node factory.js "Implement the tennis kata"
cat .adw/*/02-build.prompt.md    # der Plan steht jetzt im Builder-Prompt
```

**Warum:** der Unterschied zwischen zwei Phasen und zwei Prompts. Eine Phase
liest die **typisierte Übergabe** der vorigen — ein Artefakt auf der Platte,
nicht deren Kontextfenster. Deshalb kannst du jede Phase einzeln austauschen,
einzeln preisen und einzeln nachlesen.

Und deshalb steht der Planner auf `claude-sonnet-5` und der Builder auf
`claude-haiku-4-5`: Urteil kostet mehr als Ausführung.

---

## 5. Das Gate und der Rücksprung

**Ziel:** Code entscheidet. Und wenn er nein sagt, geht die Arbeit zurück.

Prompt:

```text
Ergänze das Gate:

util.js — gate(command): den Befehl per spawnSync mit shell:true laufen lassen,
stdout und stderr einsammeln, als NN-test.json ablegen (die letzten 2000 Zeichen
reichen), "NN  CODE  test  grün|rot" loggen und { pass, output } zurückgeben.
Dazu redGate(output): die Gate-Ausgabe in einen Satz für den Builder verpacken.

factory.js — Gate-Befehl aus process.argv[3], Standard "npm test". Nach dem Bau
läuft das Gate; bei rot geht seine Ausgabe als {{feedback}} zurück an den
Builder, höchstens MAX_REPAIR_TRIES (3) Runden. Exit-Code 0 bei grün, 1 bei rot.

```

**Die Frage, die dieses Stück stellt: wovon ist dein Gate unabhängig?** Die
Fabrik entscheidet das nicht für dich — sie richtet sich danach, was sie
vorfindet:

| Was du hinlegst | Was das Gate dann beweist |
|---|---|
| unter `test/` liegt schon eine Suite | **Korrektheit** gegen eine Erwartung, die der Builder nie sieht |
| es liegt keine, der Builder schreibt sie mit | **Konsistenz** mit seinen eigenen Annahmen |
| du gibst als zweites Argument einen Befehl mit | was auch immer der Befehl prüft — deine Verantwortung |

Der Mechanismus dahinter ist eine Zeile: lag die Suite vorher da, verwirft
`writeFiles()` jeden Block, dessen Pfad mit `test/` beginnt, und sagt wie viele.
Unabhängigkeit entsteht daraus, dass der Builder nicht drankommt.

Die Kopfzeile sagt, in welchem Fall du bist — aber sie meldet nur, was die
Fabrik selbst entschieden hat. `Suite: already on disk` heißt: `hasTests()` war
wahr, und der Builder-Prompt ist danach gebaut. Es ist keine Diagnose deines
Repos. Wer seine Tests unter `__tests__/` liegen hat, bekommt die Zeile nicht
und der Builder schreibt seine eigenen — falsch beschriftet wird trotzdem
nichts, weil die Zeile über die Entscheidung spricht und nicht über dein Repo.

**Blind heißt nicht ahnungslos.** Ein Builder, der die Suite nicht sieht, muss
ihre Schnittstelle trotzdem treffen — und daneben zu greifen ist mit der
Gate-Ausgabe allein nicht reparierbar. Ein echter Lauf hat das viermal
vorgeführt:

| | |
|---|---|
| die Suite ruft | `fizzbuzzSequence(15)` |
| der Builder schrieb | `fizzbuzzSequence(start, end)` |
| Ergebnis | `end` ist `undefined`, der Loop läuft nie, `actual: []` |

Zurück wandert die Assertion: erwartetes Array, tatsächlich `[]`. Die
*Aufrufstelle* steht da nicht — also lernte keine der drei Reparatur-Runden,
dass die Funktion ein Argument nimmt. Viermal derselbe Fehler, dann war das
Budget leer.

Deshalb hängt `TESTS` die Schnittstelle an, `fizzbuzzSequence(15) from
src/fizzbuzz.js`, klammerbalanciert aus der Suite geschnitten. Die Erwartung
bleibt unsichtbar, die Unabhängigkeit steht — das Raten hört auf. Eine Suite,
die als Spezifikation gelten will, muss ihre Schnittstelle veröffentlichen;
sonst ist sie ein Rätsel mit Punktabzug.

**Und wer die Rangfolge nicht kennt, verhandelt gegen sie.** Derselbe Lauf ist
danach eine Ebene höher hängengeblieben: die Suite verlangt `fizzbuzz(1) === 1`
— eine Zahl. Der Reviewer las das Ziel, hielt kanonisches FizzBuzz für
String-liefernd und sagte `revise`. Der Builder baute für den Reviewer, das
Gate wurde rot; er baute für das Gate, der Reviewer sagte dasselbe nochmal.

| Runde | gebaut für | Ergebnis |
|---|---|---|
| 2 | die Suite | Gate **grün** → Reviewer: revise |
| 3 | den Reviewer | Gate **rot** — `actual: '1', expected: 1` |
| 4 | die Suite | Gate **grün** → Reviewer: revise, wortgleich |

Kein Modell hatte unrecht — die Fabrik hatte zwei Judges mit zwei Maßstäben.
Nur der Builder wusste, dass die Suite bindet.

Die Rangfolge nachzureichen genügte nicht. `GRADING` sagte dem Reviewer
wörtlich, die Suite gewinne und er dürfe nie eine Änderung verlangen, die sie
rot macht — er sagte trotzdem revise und begründete es mit *„violates spec item
2/4"*. Denn der Planner hatte inzwischen geschrieben: *`fizzbuzz(n)` returns a
string per classic rules*. Gegen einen ausformulierten Plan verliert eine
Anweisung, die ihn überstimmen soll.

Der Plan durfte diesen Satz gar nicht enthalten. Liegt eine Suite da, ist die
Spezifikation bereits geschrieben — der Planner plant dann **Struktur**: welche
Dateien, welche Funktionen, welche Datenstrukturen. Rückgabetypen, Werte und
Randfälle regelt die Suite, und was er nicht sehen kann, spezifiziert er nicht.
Genau das steht jetzt in `BINDING`. `GRADING` bleibt als zweite Sicherung, muss
aber nichts mehr überstimmen. Liegt keine Suite da, sagt `GRADING` weiterhin das
Gegenteil — *urteile nicht gegen die Tests* —, denn dann hat dieselbe Phase Code
und Tests geschrieben.

**Ein Gate, das über einem Plan steht, braucht jeden Judge im Bilde.** Sonst
tauscht der Loop nur ein Rot gegen ein anderes.

Aus derselben Familie stammt ein dritter Fehlschlag, und er ist der billigste
von allen: der Planner war auf keine Sprache festgelegt, plante `fizzbuzz.py`,
und der Reviewer verglich den JavaScript-Code mit einem Python-Plan — *Wrong
language*, in jeder Runde. `planner.prompt` schreibt jetzt dieselbe Sprache
fest wie `builder.prompt`. Ein Plan, den niemand einlösen kann, ist ein Loop,
der nie terminiert.

**Eine Messung, die eine Annahme umgeworfen hat.** „Keine Tests, also rotes
Gate" ist falsch: `node --test` beendet mit **0**, wenn es nichts findet — ein
grünes Gate ohne einen einzigen Fall. Eine leere Test-Datei meldet sogar
`tests 1 · pass 1`.

Das gehört in das `test`-Script aus Stück 1, dorthin, wo definiert ist, was
„fertig" heißt. Zwei Handgriffe, beide deterministisch:

| Fall | Was ihn rot macht |
|---|---|
| keine Test-Datei | `grep -q "node:assert" test/*.test.js` findet nichts und beendet mit 1 |
| leere Test-Datei | dieselbe Zeile — ohne `node:assert` steht da kein Fall |
| Tests, die den Code kaum anfassen | `--test-coverage-lines=60`; bei 16% Coverage endet der Lauf mit 1 |
| echte Suite | nichts — sie läuft durch |
| importiert `node:assert` und ruft es nie | **nichts.** Das bleibt offen. |

Die letzte Zeile ist die ehrliche Grenze: dass ein Test etwas *ausführt*, kann
man von außen prüfen; dass er etwas *behauptet*, nicht. Vier von fünf Löchern
zu, eines bleibt — und die Fabrik bleibt dafür frei von Test-Logik.

**Verify:**

```bash
node factory.js "Implement the tennis kata"; echo "exit=$?"
cat .adw/*/03-test.json          # was das Gate gesehen hat
```

**Warum:** drei Dinge auf einmal.

- **Der Loop terminiert.** Am grünen Gate oder an der Obergrenze — nie am
  Gefühl. Gebaut wird immer mindestens einmal, geprüft nach jedem Bau; ein
  Bau-Aufruf im Code, nicht zwei.
- **Zurück wandert die Gate-Ausgabe, sonst nichts.** Kein zweiter Agent, der
  rät, warum die Tests rot sind: erwartet-vs-tatsächlich steht im Text.
- **Die Fabrik ist selbst gate-bar.** Ein Exit-Code macht sie zum Baustein in
  einer größeren Kette.

Tennis ist ein guter Prüfstein: die Deuce/Advantage-Ecke reißt regelmäßig die
erste Runde, und der Rücksprung holt sie zurück. Ein Lauf, der nach drei Runden
rot bleibt, sagt: dieses Modell schafft diese Aufgabe nicht — samt Preis.

---

## 6. Die zwei Prüfungen vor dem Commit

### 6.1 Der Review

**Ziel:** ein zweites Gate — das erste fragt, ob es läuft; dieses, ob es das
ist, was verlangt war.

Prompt:

```text
Ergänze die Review-Phase:

reviewer.prompt — englisches Template mit {{goal}}, {{plan}}, {{files}} und
{{grading}}. Der Maßstab selbst steht nicht im Template, sondern kommt aus
util.js: GRADING sagt „gegen Ziel und Plan, nicht gegen die Tests", solange der
Builder die Tests selbst geschrieben hat — und „die vorher liegende Suite
gewinnt, verlange nie eine Änderung, die sie rot macht", wenn sie vorher da lag.
Gesucht sind fehlende Anforderungen aus dem Ziel, ungedeckte Randfälle und
falsche Annahmen. Die Antwort beginnt mit einer Zeile
"VERDICT: ship" oder "VERDICT: revise", darunter bei revise die konkreten
Änderungen. Im Zweifel ship — Stil, Namen und Nice-to-haves sind kein Grund.

util.js — writtenFiles(): die zuletzt geschriebenen Dateien mit Pfad und Inhalt
zu einem Text zusammensetzen, den der Reviewer lesen kann. Dazu verdict(pass,
text): das Urteil als eine Zeile loggen.

factory.js — eine Funktion check(): erst das Gate, und nur wenn es grün ist der
Review. Sie gibt { pass, output } zurück, wobei pass false ist, sobald der
Reviewer revise sagt. Das do-while ruft check() statt gate() — damit schickt ein
revise die Arbeit auf demselben Weg zurück wie ein rotes Gate. Reviewer-Modell
als Konstante (claude-sonnet-5).
```

**Verify:**

```bash
node factory.js "Implement the tennis kata"
cat .adw/*/04-review.json        # das Urteil im Wortlaut
```

**Warum:** der Builder schreibt seine eigenen Tests, das Gate ist also selbst
benotet. Ein zweiter Agent mit frischem Kontext, der den Code gegen das *Ziel*
liest statt gegen die Tests, sieht genau das, was eine selbst geschriebene
Suite nie meldet.

Zwei Dinge daran sind Absicht:

- **Der Reviewer hat keine Hände und keine Tools.** Er bekommt die Dateien als
  Text in den Prompt und gibt ein Wort zurück — entschieden wird es von Code,
  `VERDICT: revise` ist ein Regex-Treffer.
- **„Im Zweifel ship" steht im Prompt.** Ein Modell findet immer etwas. Ohne
  diese Bremse sagt das Gate jede Runde revise, verbrennt das Reparatur-Budget
  und endet rot.

### 6.2 Der CRAP-Check (nach dem Kurs)

Die Fabrik hat vier Kräfte, die alle in dieselbe Richtung ziehen: der Builder
liefert jedes Mal den *vollständigen* Dateisatz, der Rücksprung fügt hinzu statt
umzudenken, der Reviewer fragt „fehlt etwas?", die Coverage-Decke belohnt mehr
Tests. Nichts in der Kette sagt jemals **zu viel** — die Slop-Kanone.

**Im Kurs baust du das nicht.** Es war im ersten Durchlauf der Punkt, an dem
die Gruppe abgehängt wurde — eine zweite Metrik, während die erste Fabrik noch
nicht rund lief. Der Code dafür liegt fertig in `step-6`; lies den Rest hier in
Ruhe nach und schalt ihn ein, wenn deine Kette steht.

Es ist ein fünfter Handgriff, ausgeschaltet, solange du ihn nicht einschaltest:

```bash
CRAP_MAX=30 node factory.js "Implement the tennis kata"
```

`CRAP = cc² · (1 − cov)³ + cc` — Komplexität mal Ungedecktheit, die Metrik aus
[Workshop 20](../../20-crap-metric/). Die Fabrik braucht dafür kein neues Tool:
die Coverage misst sie sich selbst, die Verzweigungen zählt eine Regex über die
geschriebenen Dateien. Reißt die Decke, gibt es keinen Commit.

Dass sie **selbst** misst und nicht die Gate-Ausgabe abliest, ist der
Unterschied zwischen einer Zahl und einer Vermutung. Gib einen eigenen
Gate-Befehl mit und es gibt keine Coverage-Tabelle zu lesen — dann hält jede
Datei für ungedeckt und rechnet `cc² + cc`: für unsere zwölf Zweige **756**
statt **27**.

```
  03  CODE   test    green
  05  CODE   crap    red     src/grade.js 27/10
  ✗
```

Drei Dinge, die dieser Lauf zeigt:

- **Die Suite war grün.** Zwölf `if`-Zweige, jeder getestet, 100% Coverage —
  nach jedem Maßstab des Gates fertige Arbeit.
- **Bei voller Coverage ist CRAP gleich der Komplexität.** `(1 − 1)³ = 0`, es
  bleibt `cc = 27`. Coverage kauft dich aus dem CRAP-Wert heraus, nicht aus der
  Komplexität.
- **Der Rücksprung greift.** CRAP steht *in* `check()`, hinter Gate und Review —
  ein Verstoß geht denselben Weg zurück wie ein rotes Gate:

  ```
    03  CODE   test    green
    04  AGENT  review  claude-sonnet-5
    05  CODE   crap    red     src/grade.js 25/10
    ↩  repair loop
    07  CODE   test    green
    09  CODE   crap    green    src/grade.js 5/10
    10  CODE   commit  factory/…
  ```

  Der naheliegende Einwand — ein Modell verteilt dieselben Zweige auf mehr
  Funktionen — trägt nicht: gezählt wird **pro Datei**. Das Aufteilen auf
  mehrere Dateien würde funktionieren und steht als neuer Pfad im Log.
  Gedeckelt ohnehin: nach `MAX_REPAIR_TRIES` ist Schluss, und dann bleibt es
  eine Nachricht an einen Menschen — der Plan war zu groß.

Und die ehrliche Grenze: **pro Datei**, nicht pro Funktion, und die
Verzweigungen zählt eine Regex, kein Parser. Was in Denkvis wirklich läuft —
Decke 8, pro Funktion, mit High-Water-Marke — steht in Workshop 20. Die
High-Water-Marke ist der eigentliche Trick: eine feste Decke wird *erreicht*,
und danach sitzt alles knapp darunter für immer.

---

## 7. Der Commit und die Rechnung

**Ziel:** das Ergebnis festhalten — auf einem eigenen Branch, nie auf `main` —
und am Ende sehen, was der Lauf gekostet hat.

Prompt:

```text
util.js — commit(goal, plan): PLAN.md schreiben, mit "# <goal>" als
Überschrift und dem Plan darunter. Dann einen Branch factory/<lauf-id>
auschecken, alles stagen, mit "feat: <erste Zeile des goal>" committen,
als NN-commit.json ablegen und "NN  CODE  commit  <branch>" loggen.

util.js — dazu eine Kostenrechnung. phase() liest aus der JSON-Antwort neben
result auch total_cost_usd, duration_ms und usage; jede Phase, auch die
deterministischen, schreibt eine Zeile in ein Ledger. costs() druckt daraus
eine Tabelle (Phase, Modell, Kosten, Dauer) mit Summe und legt sie als
costs.json im Lauf-Verzeichnis ab. Code-Phasen stehen mit "gratis" drin.

factory.js — nur bei grünem Gate committen, danach costs() aufrufen.
```

**Verify:**

```bash
node factory.js "Implement the tennis kata"
git branch --show-current        # factory/…
git log --oneline -1
git show --stat HEAD             # src/, test/ — und PLAN.md
cat .adw/*/costs.json            # dieselbe Rechnung als Daten
```

Ein echter Lauf sieht so aus:

```
  01  AGENT  plan    claude-sonnet-5
  02  AGENT  build   claude-haiku-4-5
      src/tennis.js, test/tennis.test.js
  03  CODE   test    green
  04  AGENT  review  claude-sonnet-5
      ship — Implementation matches the spec exactly — priority order, deuce/advantage
  05  CODE   commit  factory/1787703018807

  Phase          Model              Cost        Duration
  01 plan         claude-sonnet-5    $0.0930       8.0s
  02 build        claude-haiku-4-5   $0.0627      42.9s
  03 test         code                free       0.2s
  04 review       claude-sonnet-5    $0.1017       2.9s
  05 commit       code                free       0.1s
     total                          $0.2573      54.0s
```

Lies die Tabelle quer: **jede Zeile, die etwas entscheidet, ist gratis** — und
der Review kostet mehr als der Build. Diese Rechnung entscheidet, ob eine
Fabrik sich lohnt, und sie steht jetzt nach jedem Lauf auf deinem Schirm.

`PLAN.md` liegt aus einem Grund im Commit und nicht nur im Envelope: `.adw/`
ist ignoriert, also wäre der Plan nach dem Lauf nur noch auf dem Rechner, der
ihn erzeugt hat. Im Branch dagegen sieht der Mensch, der den Pull Request
öffnet, zuerst die Spezifikation und darunter den Code, der sie behauptet zu
erfüllen — und kann beides gegeneinander lesen. Ein Diff ohne die Absicht
daneben lässt nur eine Frage zu (*ist das richtig?*); mit dem Plan daneben
lässt er die zweite zu, auf die es ankommt: *war das die Aufgabe?*

Fertig. Eine Fabrik: **beobachtbar** (jede Phase ein Envelope), **anpassbar**
(ein Modell pro Rolle, ein Prompt pro Rolle als Datei), **wiederverwendbar**
(ein Gate, das das Ergebnis abnimmt).

---

## 8. Der Review fächert auf (optional)

> **Kür, nicht Pflicht.** Die Fabrik ist nach Stück 7 fertig. Dieses Stück
> beantwortet eine andere Frage — nicht „wie wird es wiederholbar?", sondern
> „was läuft gleichzeitig?". Das ist die Graph-Achse, hier nur, weil sie an
> *einem* Knoten fast gratis ist.

**Ziel:** aus einem Reviewer drei machen — je einen Blickwinkel, gleichzeitig,
und die Mehrheit entscheidet.

Warum genau hier: der Review liest nur, also kollidieren drei Reviewer nicht im
Dateibaum. Drei parallele *Builder* täten das sofort — die bräuchten je einen
eigenen Worktree.

Prompt:

```text
Mach aus dem Review ein Panel:

reviewer.prompt — bekommt einen Platzhalter {{lens}} und die Anweisung, nur
durch diese eine Lens zu urteilen.

util.js — ask(model, text): dasselbe claude -p, aber als Promise über spawn
statt spawnSync. Dazu panel(role, model, prompts): alle Prompts mit
Promise.all gleichzeitig laufen lassen und die Antworten zurückgeben. Erst
wenn alle da sind, wird nummeriert und abgelegt — die Envelopes stehen dann in
der Reihenfolge der Lenses, nicht in der der Antworten. phase() bleibt
synchron; async gehört nur an diesen einen Knoten.
verdict(ships, reviews) druckt die Zählung und, falls es einen gibt, den
überstimmten Einwand.

factory.js — drei LENSES als Konstante (Korrektheit, Randfälle, das Ziel).
check() wird async, ruft panel() statt phase(), zählt die ship-Stimmen und
gibt pass = Mehrheit zurück. Der Loop wartet mit await auf check().
```

**Verify:**

```bash
node factory.js "Implement the tennis kata"
ls .adw/*/0*-review.json         # drei Envelopes statt einem
```

Ein Lauf, in dem eine Lens widerspricht und überstimmt wird:

```
  03  CODE   test    green
  04  AGENT  review  claude-sonnet-5
  05  AGENT  review  claude-sonnet-5
  06  AGENT  review  claude-sonnet-5
      2/3 ship  ·  dissent: the suite never checks an empty input
  07  CODE   commit  factory/1787706778926
```

**Warum:** drei Dinge, und nur das erste ist offensichtlich.

- **Ein einzelner Einwand hält nichts mehr auf.** Ein Reviewer, der immer etwas
  findet, blockiert; drei mit Mehrheitsregel filtern das Rauschen heraus, ohne
  das echte Finding zu verlieren.
- **Der überstimmte Einwand wird trotzdem gedruckt.** Sonst ist die Abstimmung
  ein Weg, unbequeme Findings zu verlieren.
- **Es wird nicht schneller.** Review ~3s, Build 40–70s — drei Reviews parallel
  dauern weiterhin 3s. Du zahlst dreifache Review-Tokens und bekommst
  Urteilsqualität, keine Zeit.

Und der Preis im Diff: `phase()` läuft auf `spawnSync` und blockiert, die Kette
liest sich von oben nach unten. Breite braucht Promises — deshalb steht `async`
*neben* `phase()` und nicht darin. Die ausgebaute Graph-Achse liegt in
[`02-graph/`](../../02-graph/).

---

## 9. Von der Subscription zur API-Abrechnung

**Ziel:** die Fabrik zahlt pro Aufruf, nicht pro Anmeldung. Und ein Roster, das man wechseln kann.

Bis hier lief jede Phase über deine Anmeldung, also über die Subscription. Eine Fabrik, die ohne dich läuft, kann sich darauf nicht stützen. Ein Gateway dreht das um: eine andere Adresse, ein Token, und die Abrechnung läuft über die API. Damit wird auch das Roster zur Entscheidung: Wer je Rolle zahlt, wählt je Rolle, und die günstigen Modelle sind genau dafür da.

Prompt:

```text
factory.js — die drei Modell-Konstanten lesen ihren Wert aus der Umgebung,
PLANNER_MODEL, BUILDER_MODEL und REVIEWER_MODEL, und behalten den bisherigen
Wert als Vorgabe. Dazu eine Wache: steht ANTHROPIC_BASE_URL, muss jeder Sitz
einen Slug mit Schrägstrich tragen. Eine Anthropic-Abkürzung über ein Gateway
ist keine Ersparnis, sondern der Frontier-Preis mit Umweg — der Lauf bricht ab
und nennt die Sitze, die es betrifft. Sonst ändert sich an der Kette nichts.

env.openrouter.example — die Adresse des Gateways, ein Token, ein ausdrücklich
leeres ANTHROPIC_API_KEY, und das Roster als drei Zeilen. Kommentiert, warum
der leere Key dort steht.
```

**Verify:**

```bash
cp env.openrouter.example .env.openrouter   # Key eintragen
set -a; . ./.env.openrouter; set +a
node factory.js "Implement a FizzBuzz function"
```

Die Kostenspalte im Lauf bleibt eine Schätzung: der CLI rechnet aus seiner eigenen Tabelle, nicht aus der Abrechnung des Gateways. Die relative Lehre hält trotzdem, denn Code-Phasen kosten null und ein Urteil kostet mehr als eine Ausführung.

## 10. Der Deckel

**Ziel:** ein Lauf, der sich selbst anhält, bevor die Rechnung es tut.

Eine Rechnung nach dem Lauf ist ein Beleg, kein Schutz. Der Deckel steht deshalb an der einen Stelle, durch die jede Agent-Phase geht, und er wird geprüft, bevor die Phase startet. Ein Überlauf kostet damit höchstens eine Phase, ohne Deckel kostet er so viel, wie der Loop läuft.

Prompt:

```text
util.js — ein Deckel aus der Umgebung, BUDGET_CAP in Dollar. spent() summiert
das Ledger, capped(role) meldet true, sobald die Summe den Deckel erreicht,
und schreibt eine Zeile, die den Stand und die Rolle nennt. phase() und panel()
prüfen ihn als Erstes und beenden den Lauf, statt die Phase zu starten.
Ohne BUDGET_CAP ist der Deckel aus.
```

**Verify:**

```bash
BUDGET_CAP=0.005 node factory.js "Implement a FizzBuzz function"
node factory.js "Implement a FizzBuzz function"
```

Ohne `BUDGET_CAP` ändert sich nichts, der Deckel ist dann aus. Das ist Absicht: Ein Deckel, den man setzen muss, ist ein Deckel, über den jemand nachgedacht hat.

# Die Fabrik verlässt den Laptop

Bis hierhin läuft alles auf deinem Rechner: dein Node, deine Anmeldung, dein
`git`. Die drei folgenden Stücke stellen die Frage, mit der
[Workshop 15](../../15-sandbox-factory/) anfängt — **wo läuft das eigentlich?** —
und beantworten sie mit der kleinsten ehrlichen Antwort: einer Kiste, die nicht
dein Laptop ist.

An `factory.js` und `util.js` ändert sich dabei **nichts**. Das ist keine
Sparsamkeit, sondern der Vertrag: eine Box bekommt ein Repo und ein Ziel und
gibt einen grünen Branch zurück. Was in der Box läuft, geht der Box nichts an.

## 11. Die Box

**Ziel:** dieselbe Kette, in einem Container. Und der erste ehrliche Bruch.

Prompt:

```text
Dockerfile — ein Image, das die Laufzeit trägt und niemals die Arbeit. Basis
node:24.16.0-bookworm-slim, dazu git und ca-certificates, dazu claude-code in
einer festgenagelten Version. Ein Nutzer box mit einem Verzeichnis /box, das
ihm gehört, und das ist auch das WORKDIR. Eine Git-Identität als ENV, sonst
kann in der Box niemand committen. Kein Credential im Image, kein COPY der
Arbeit. Der Startbefehl hält die Kiste offen: sleep infinity.

.dockerignore — alles. Das Image kopiert nichts hinein, also braucht der Build
auch keinen Kontext.
```

**Verify:**

```bash
docker build -t mini-factory-box box/
docker run --rm mini-factory-box sh -c 'node --version; git --version; claude --version; id -un'
```

Und jetzt der Bruch, den man gesehen haben muss:

```bash
docker run --rm mini-factory-box claude -p "sag ok" --tools "" --output-format json
```

```
{"is_error":true, … ,"result":"Not logged in · Please run /login"}
```

**Deine Anmeldung ist nicht mitgekommen, und sie kann es nicht.** Sie liegt in
deinem Home, an dein Konto gebunden. Eine Box bekommt einen Credential
*übergeben* — zur Laufzeit, nie gebacken —, und wenn du keinen hast, hast du
keine Fabrik in der Box, egal wie gut das Image ist. Genau das nennt
Workshop 15 den `personal-credentials`-Blocker.

Der zweite Bruch ist kleiner und lehrreicher. Die Fehlermeldung, die dabei aus
`util.js` fällt, lautet `Error: plan:` — und dahinter nichts. `phase()` meldete
`stderr`, und der CLI schreibt seinen Fehler nach `stdout`, im JSON. Auf deinem
Rechner ist das nie aufgefallen, weil dort nie eine Phase gescheitert ist. Zwei
Zeilen später steht da, was wirklich los ist:

```js
if (status !== 0) {
  let said = '';
  try { said = JSON.parse(stdout).result ?? ''; } catch { said = ''; }
  throw new Error(`${role}: ${said || stderr.trim() || `claude exited ${status}`}`);
}
```

> **Eine Fabrik, die den Laptop nie verlassen hat, hat ihre Fehlerpfade nie
> benutzt.**

## 12. Der Fahrer

**Ziel:** die Box von außen bedienen — säen, laufen lassen, ernten, abreißen.
Und zwar so, dass du dazwischen weggehen darfst.

Prompt:

```text
box.js — ein Fahrer für genau eine Box, drei Befehle.

start "<ziel>": ein Bundle des eigenen Repos bauen (git bundle --all), eine
Box aus dem Image starten und dabei nur die Credential- und Roster-Variablen
aus der Umgebung durchreichen, das Bundle hineinkopieren, in der Box daraus nach /box
klonen, und die Fabrik detached starten — Ausgabe nach /tmp/run.log, Exit-Code
nach /tmp/run.exit. Beides ausdrücklich nach /tmp und nicht nach /box, sonst
committet git add -A die Ausgabe des Laufs mit. Dann den Namen der Box und den
Befehl zum Ernten ausgeben.

harvest <box>: gibt es /tmp/run.exit noch nicht, läuft der Lauf — die letzten
Zeilen des Logs zeigen und mit 2 enden. Sonst das ganze Log ausgeben, bei
Erfolg in der Box ein Bundle bauen, herauskopieren und die factory/*-Branches
daraus ins eigene Repo fetchen, das .adw-Verzeichnis herauskopieren, die Box
abreißen und mit dem Exit-Code des Laufs enden.

list: welche Boxen es gibt und in welchem Zustand.

Kein Kommentar im Code. Ausgabe auf Englisch.
```

**Verify:**

```bash
node box.js start "Implement the tennis kata"
node box.js list
node box.js harvest box-1787917765606
git branch --list 'factory/*'
```

Zwei Entscheidungen darin sind der eigentliche Inhalt des Stücks.

**Der Weg hinein und hinaus ist ein Bundle, kein Remote.** Die Box hat keinen
Zugang zu deinem GitHub und soll keinen bekommen. Ein `git bundle` ist ein
Repo in einer Datei; `docker cp` trägt sie in beide Richtungen. Was nach Hause
kommt, entscheidet dein Rechner — nicht die Box.

**Der Lauf hängt nicht am Fahrer.** `start` startet detached und ist danach
fertig. Zwischen `start` und `harvest` darfst du den Deckel zuklappen. Das ist
die Autonomy aus Workshop 15, und sie kostet hier keine Zeile Architektur,
sondern ein `-d`.

Der Preis steht in `list`: **eine Box, die niemand erntet, läuft weiter.** Auf
deinem Laptop ist das ein Prozess, auf einer Cloud-Maschine ist es eine
Rechnung. Autonomy ohne Teardown ist ein zweiter Laptop mit Miete.

## 13. Die fremde Maschine

**Ziel:** derselbe Befehl, auf einem Rechner, der dir nicht gehört.

Es gibt hier **keinen neuen Code.** Der Docker-Client spricht mit jedem Daemon,
den `DOCKER_HOST` ihm nennt, und `ssh://` ist eine gültige Adresse. Damit läuft
`box.js` unverändert gegen eine VM.

Prompt:

```text
env.remote.example — die drei Zeilen, die den Lauf von diesem Rechner
wegnehmen: DOCKER_HOST als ssh://-Adresse, der Image-Name, und Platz für den
Credential. .env* ist bereits ignoriert.
```

**Verify:**

```bash
ssh factory@dein-host docker version        # der Daemon dort muss dir gehören
cp box/env.remote.example .env.remote
$EDITOR .env.remote
set -a; . ./.env.remote; set +a

docker build -t mini-factory-box box/       # baut jetzt DORT
node box.js start "Implement the tennis kata"
node box.js list                            # „on ssh://factory@…"
```

Drei Dinge, die dabei anders sind, und alle drei sind der Punkt.

**Der Build wandert mit.** `docker build` spricht denselben Daemon an, also
entsteht das Image auf der VM. Keine Registry, kein Push — die Zeile, die du
schon kennst, baut jetzt woanders.

**Die Latenz wird sichtbar.** `docker cp` schiebt das Bundle durch SSH. Bei
einem Lab-Repo merkst du nichts; bei einem echten Repo ist das der Moment, in
dem `git bundle --all` gegen `--since` getauscht werden will.

**Der Credential ist jetzt eine Entscheidung.** Auf deinem Laptop war es dein
Konto. Auf einer Maschine, die auch anderen gehört, ist ein persönlicher Key
in der Umgebung genau der Blocker aus Workshop 15 — ein Lauf, der grün wird und
dessen Rechnung an das falsche Konto geht. Ein eigener Key mit Deckel, oder
eine Instanz-Rolle. Nichts davon ist Infrastruktur; es ist eine Frage, die man
beantwortet haben muss, bevor die erste Box startet.

> **Isolation bekommst du geschenkt. Scale und Autonomy musst du dir
> verdienen** — und der Unterschied heißt Teardown und Budget.

**Was hier bewusst fehlt: n Boxen.** Eine Box ist ein Umzug, nicht Scale. Zwölf
Boxen für dieselbe Aufgabe, ein Judge, der den billigsten grünen Kandidaten
nimmt, und ein Journal, das den Teardown überlebt — das ist
[Workshop 15](../../15-sandbox-factory/), und `costs()` aus Stück 7 ist schon
die halbe Antwort darauf.

**Und ab hier ein Makefile**, weil die vier Handgriffe sich nicht lohnen zu
merken:

```bash
make image                # einmal, dauert ein paar Minuten
make run                  # säen, starten, laufen lassen
make harvest              # die jüngste Box ernten und abreißen
make remote               # dasselbe auf der fremden Maschine
```

`box.js` bleibt der Fahrer. Das Makefile tippt nur, was du sonst tippen würdest,
und jedes Ziel zeigt seinen Befehl — der Weg ohne Makefile bleibt offen.

---

# Von einer Fabrik zu vielen

Bis hier hat eine Fabrik gearbeitet. Ab hier arbeiten n, und die Fragen ändern
sich: wer erzeugt sie, wer hält sie auseinander, wer entscheidet am Ende. Das
ist der Stoff von Workshop 15, hier in der kleinsten Fassung, die läuft.

## 14. Der Plan als Datei, und der Linter davor

**Ziel:** der Auftrag steht in einer Datei, und ein Plan mit Blockern startet nichts.

Bis hier war der Auftrag ein Satz auf der Kommandozeile. Sobald mehrere Kandidaten laufen, ist der Auftrag mehr als ein Ziel: wie viele, mit welchem Deckel, wo, und ob danach aufgeräumt wird. Das gehört in eine Datei, die man liest, bevor Geld fließt. Der Linter läuft zuerst, und ein Blocker startet nichts. Im selben Plan stehen die Abnahmekriterien, und der Linter weist einen Plan ohne sie ab. Prüfen kann er sie nicht, denn er läuft, bevor gebaut wird: Das erledigt Stück 19.

Prompt:

```text
plan.json — der Auftrag als Datei: goal, runs, cap, placement, teardown, und
dod als Liste der Abnahmekriterien.

lint.js — lint(plan) gibt Findings zurück, je eins mit level blocker oder warn:
kein Ziel, kein runs, kein Deckel, ein leeres dod, mehrere Runs ohne placement
box, und als warn ein abgeschaltetes teardown. report(findings) druckt sie und meldet, ob
ein Blocker dabei war. Direkt aufgerufen liest lint.js den Plan aus argv und
endet mit 1, wenn ein Blocker dabei ist.
```

**Verify:**

```bash
node lint.js plan.json
printf '{ "goal": "x", "runs": 4, "placement": "laptop" }\n' > kaputt.json
node lint.js kaputt.json   # endet mit 1
```

## 15. Das App-Repo draußen, ein Worktree je Kandidat

**Ziel:** jeder Kandidat arbeitet für sich, ohne Klon.

Vier Kandidaten am selben Verzeichnis sind ein Kandidat mit vier Meinungen. Jeder bekommt deshalb einen eigenen Worktree auf einem eigenen Branch, und die App liegt außerhalb der Läufe. Ein Worktree ist billiger als ein Klon und teilt trotzdem keine Arbeitskopie.

Prompt:

```text
repo.js — appRepo(dir) legt das App-Repo an, falls es fehlt: git init, ein
leerer Baseline-Commit auf main. addWorktree(repo, name) hängt einen Worktree
neben das Repo, auf einem eigenen Branch factory/<name>, und gibt sein
Verzeichnis zurück. dropWorktree(repo, dir) nimmt ihn wieder weg und schweigt,
wenn er schon fort ist.
```

**Verify:**

```bash
node -e "import('./repo.js').then(async (m) => {
  const r = m.appRepo('.runs/app');
  console.log(m.addWorktree(r, 'probe'));
})"
git -C .runs/app branch --list 'factory/*'
```

## 16. n Kandidaten statt einem

**Ziel:** dieselbe Aufgabe, n-mal, jeder Versuch für sich.

Dieselbe Aufgabe, n-mal, ohne dass die Kandidaten voneinander wissen. Würden sie voneinander lernen, wären es nicht n unabhängige Versuche, und Best-of-N misst nichts mehr. Hier laufen sie noch nacheinander. Das ist ehrlich und langsam, und der Grund steht im nächsten Stück.

Prompt:

```text
candidate.js — seed(home, dir) kopiert die Fabrik in einen Worktree: factory.js,
util.js, die drei Prompts, package.json. Direkt aufgerufen bekommt es
Verzeichnis und Ziel, seedet, startet dort node factory.js und endet mit dessen
Exit-Code.

fleet.js — liest den Plan, lintet ihn, legt für jeden der runs einen Worktree
an und fährt die Kandidaten nacheinander über candidate.js. Danach eine Zeile
je Kandidat mit grün oder rot, und ein Teardown, das die Worktrees abräumt und
die Branches stehen lässt.
```

**Verify:**

```bash
node fleet.js plan.json
```

## 17. Ein Kandidat, ein Prozess

**Ziel:** n Kandidaten kosten das Maximum, nicht die Summe.

Vier Kandidaten nacheinander kosten die Summe ihrer Zeiten, nebeneinander das Maximum. Der Grund für das Nacheinander war kein Design, sondern eine Sprache: ein synchroner Aufruf blockiert alles hinter sich. Die Antwort ist nicht, den Aufruf schneller zu machen, sondern ihm einen eigenen Prozess zu geben.

Prompt:

```text
fleet.js — runOne gibt ein Promise zurück und startet candidate.js mit spawn
statt spawnSync. Die Kandidaten laufen über Promise.all nebeneinander, alles
andere bleibt.
```

**Verify:**

```bash
time node fleet.js plan.json
```

## 18. Der Judge

**Ziel:** einer der Kandidaten geht nach Hause, und zwar begründet.

Jetzt liegen n Kandidaten da, und einer davon geht nach Hause. Der billigste grüne gewinnt: grün entscheidet das Gate, billig entscheidet die Kostenrechnung, die seit Stück 7 mitläuft. Bei Gleichstand gewinnt die Reihenfolge der Deklaration, damit dasselbe Ergebnis auch beim zweiten Lauf dasselbe bleibt. Ein roter Kandidat ist kein Fehler des Laufs, sondern sein Zweck.

Prompt:

```text
fleet.js — costOf(dir) liest die costs.json aus dem .adw-Verzeichnis eines
Kandidaten. Der Judge nimmt den billigsten grünen Kandidaten, bei Gleichstand
den zuerst deklarierten, und schreibt eine Zeile, die Namen und Preis nennt.
Ohne grünen Kandidaten sagt er das und endet mit 1.
```

**Verify:**

```bash
node fleet.js plan.json
git -C .runs/app branch --list 'factory/*'
```

## 19. Das DoD-Gate

**Ziel:** „grün" heißt, der Plan ist erfüllt — nicht, die eigene Suite lief.

Der Judge nimmt den billigsten grünen Kandidaten. Bis hier heißt grün nur: die Suite lief, und geschrieben hat diese Suite der Kandidat selbst. Damit belohnt Best-of-N den Kandidaten, der am wenigsten baut und trotzdem seine eigene Prüfung besteht. Das ist kein Modellfehler, das ist das Maß. Der berühmte Fall dazu: OpenAI, „Faulty reward functions in the wild", Jack Clark und Dario Amodei, 21. Dezember 2016. Ein Agent spielt das Bootrennen CoastRunners, das Punkte nicht fürs Ankommen vergibt, sondern für Ziele am Streckenrand. Der Agent findet eine abgelegene Lagune, fährt dort im Kreis und trifft drei Ziele genau dann wieder, wenn sie nachwachsen. Er fängt Feuer, rammt andere Boote, beendet keine einzige Runde, und liegt 20 Prozent über der Punktzahl eines Menschen, der ins Ziel fährt. Die Punktzahl war dabei nie falsch gemessen, sie war das falsche Maß. Eine Fabrik ohne DoD fährt dieselbe Lagune: Das Gate misst, was der Kandidat selbst als Ziel aufgestellt hat. Das DoD ist das einzige Kriterium in der Kette, das der Kandidat nicht selbst geschrieben hat, und es steht im Plan, bevor der erste Turn läuft. Deshalb muss jedes Kriterium auf einen Test zeigen, der wirklich grün lief, und das Ergebnis liegt als Datei am Commit statt als Behauptung im Log.

Prompt:

```text
dod.js — passedTests(output) zieht die Namen der bestandenen Tests aus der
Ausgabe von node --test. match(items, passed) ordnet jedem Kriterium den ersten
Test zu, dessen Name es enthält, oder null. dodCheck(dir, items) fährt die Suite
im Verzeichnis eines Kandidaten, bindet das Ergebnis an den Commit-Sha und legt
es als dod.json daneben. Direkt aufgerufen druckt es eine Zeile je Kriterium und
endet mit 1, wenn eines ohne Test dasteht.

fleet.js — jeder grüne Kandidat läuft durch dodCheck. Wer das DoD verfehlt,
zählt nicht als grün, und der Judge sieht ihn nicht. Die Zeile je Kandidat sagt,
welcher der beiden Fälle vorliegt.
```

**Verify:**

```bash
node fleet.js plan.json
node -e "const p=require('node:fs');const j=JSON.parse(p.readFileSync('plan.json'));
  j.dod=['gibt es nicht'];p.writeFileSync('verfehlt.json',JSON.stringify(j))"
node fleet.js verfehlt.json   # endet mit 1, kein Sieger
```

Die Belege liegen bei den Kandidaten: `dod.json` nennt den Commit, jedes
Kriterium und den Test, der es getragen hat. Dieselbe Regel wie in der
`mcp-moco`-Fabrik, in der eine Merge-Request-Beschreibung ohne Gate-Receipt
nicht geschrieben wird: ein grünes Gate ohne Beleg beweist dem Leser nichts.

## 20. Das Board

**Ziel:** ein Lauf, den man ansehen kann, nachdem er vorbei ist.

Bis hier stand alles, was ein Lauf wusste, in seinem Terminal, und war das Fenster zu, war der Lauf eine Erinnerung. Schlimmer: Die Belege lagen in den Worktrees, und der Abriss nimmt sie mit. Ein Beleg, der mit dem Abriss stirbt, ist keiner. Deshalb schreibt die Fleet ihr Journal, bevor sie abreißt: welcher Kandidat grün war, welcher das DoD erfüllt hat, was er gekostet hat, wer gewonnen hat. Das Board liest nur diese Dateien, es ist kein zweiter Wahrheitspfad, sondern eine Ansicht auf denselben. Es ist die billigste Antwort auf die Frage, die eine Fabrik ohne dich sofort stellt: Läuft das noch, und war der letzte Lauf gut.

Prompt:

```text
fleet.js — vor dem Teardown ein Journal schreiben: .runs/journal/<run>.json mit
Lauf-Id, Ziel, Zeitpunkt, Sieger und je Kandidat gate, dod und Kosten. Die Zeile
im Terminal nennt den Pfad.

board.js — ein Server ohne Abhängigkeiten, nur auf 127.0.0.1. GET /runs gibt die
Journale als JSON, neueste zuerst. GET / liefert eine Seite, die /runs alle zwei
Sekunden holt und je Lauf eine Tabelle zeichnet: Kandidat, Gate, DoD, Kosten,
Sieger hervorgehoben. Port aus PORT, sonst 4174.
```

**Verify:**

```bash
node fleet.js plan.json
node board.js            # http://127.0.0.1:4174
```

## 21. Die Fabrik verlässt die Maschine

**Ziel:** ein Lauf, den ein Commit auslöst und niemand startet.

In Stück 13 lief die Fabrik schon woanders, gestartet hast du sie trotzdem selbst, von deinem Rechner aus, mit einem Befehl. Hier wandert nicht die Ausführung, sondern der Auslöser: Ein Lauf entsteht durch einen Commit. Das ist der Unterschied zwischen „es läuft in einem Container" und „es fängt ohne mich an". Was hier liegt, ist eine Vorlage und kein fertiges Deployment, die einzige Bedienfläche ist `values.yaml`. Ein Lauf entsteht, indem du `runId` änderst und committest. Eine Id, die es schon gab, startet nichts: Ein Job ist unveränderlich, und das ist die billigste Art, Wiederholungen zu verhindern. Kein `kubectl`: Was im Cluster steht, steht im Repo, und was jemand von Hand anlegt, räumt der Sync wieder weg. Das Credential steht in keiner Datei dieses Repos, der Job zeigt auf ein Secret, das jemand außerhalb anlegt. `backoffLimit` 0 heißt, ein fehlgeschlagener Lauf wird nicht still wiederholt, sonst zahlst du zweimal für denselben Fehler. Und keine Registry: ein Standard-Node-Image, der CLI in einer festgenagelten Version beim Start, das kostet eine Minute und spart den ganzen Bauweg.

Prompt:

```text
chart/ — eine Helm-Vorlage für genau einen Lauf. Chart.yaml, values.yaml und
templates/job.yaml, sonst nichts. values.yaml trägt runId, goal, repoURL,
branch, budgetCap, image, claudeVersion und den Namen des Secrets, und
kommentiert, warum das Credential nicht daneben steht. Der Job heißt
<Release>-<runId>, läuft mit restartPolicy Never und backoffLimit 0, holt sich
git und den claude-code-CLI in der festgenagelten Version, klont den Branch und
startet node factory.js mit dem Ziel. Die beiden Credential-Variablen kommen
über secretKeyRef.

argocd/application.yaml — eine ArgoCD-Application, die auf den Pfad chart im
Repo zeigt, automatisch synct, prune und selfHeal an, und die Namespace bei
Bedarf anlegt.
```

**Verify:**

```bash
helm template probe chart/           # rendert ohne Cluster
helm lint chart/
grep -r secretKeyRef chart/          # das Credential kommt von außen
```

Ein Lauf danach ist zwei Zeilen: `runId` hochzählen, `goal` setzen, committen.
Was im Cluster passiert, steht danach im Board aus Stück 20 — vorausgesetzt,
jemand hat das Secret angelegt.

# Zum Schluss: die Fabrik, die schon läuft

Alles bis hier hast du auf deiner Maschine gebaut. Das letzte Stück baust du nicht in einer Stunde, und du musst es auch nicht: es läuft schon. Auf dem k3s-Cluster im Büro steht eine Queue, die Fabriken fährt. Ein Lauf kommt hinein, indem du ihn committest: ArgoCD zieht ihn, der Manager startet ihn als Job, erntet sein Journal, reißt ihn ab und nimmt den nächsten. Warum ein Manager und kein CronJob: es gibt GitOps, aber kein kubectl, und ein Pod, der unbeobachtet stirbt, ist ein Lauf, den niemand erklären kann. Deshalb liest der Manager das Log des Kindes über die API und schreibt es auf seinen eigenen Ausgang, bevor das Kind verschwinden darf. Das ist dieselbe Regel wie in Stück 20, eine Ebene höher. Offen ist, was liest: das Board und die Journale. Hinter einem Token bleibt, was Arbeit startet. Drei Dinge zeigt dieser Aufbau, die dein lokaler Lauf nicht zeigen kann: der Lauf überlebt das Zuklappen deines Laptops, niemand hat ihm zugesehen, und der Beleg hat den Pod überlebt.

```
manager/.helm/values.yaml   ein Eintrag in queue.runs, committet
        ↓ ArgoCD
Manager (concurrency 1)     startet den Job, liest sein Log, erntet, reißt ab
        ↓
Board · Journal             offen zum Lesen
POST /runs                  hinter einem Token
```

Zu sehen unter `factory-<branch>.ki.apps.kube.devnet.nil`, im VPN. Der Aufbau
steht in `sandbox-factory/manager/`, das Modul dazu ist
[Workshop 15](../../15-sandbox-factory/).

## Die Fabrik auf eigene Arbeit richten

Es gibt nichts zu konfigurieren — der Auftrag ist das Argument:

```bash
node factory.js "Implement a FizzBuzz function"          # 54s, $0.25, ship in Runde 1
node factory.js "Implement the tennis kata"              # 54s, $0.26, ship in Runde 1

# offene Aufgabe statt Kata — fünf Dateien, zwei Rücksprünge, 143s, $0,67
node factory.js "Write a playable CLI Tic-tac-toe game. The entry point must be src/cli.js and it must read moves from stdin, one per line, as numbers 1-9."

# und dasselbe mit einem Liveness-Gate statt einer Suite
node factory.js "…" "printf '1\n4\n2\n5\n3\n' | node src/cli.js" 
node factory.js "Parse a hotkey string like cmd+shift+K"
```

Zwei Bedingungen, damit es trägt: ein Gate, das schneller läuft als deine
Geduld, und ein Ziel, das ein Befehl mit 0 oder 1 beantworten kann.

## 22. Die harte Nuss

Alles oben löst ein gutes Modell im ersten Anlauf. Das beweist die Kette und
nicht die Fabrik: wo nichts reißt, holt auch kein Rücksprung etwas. Und die
Tennis-Kata steht tausendfach in den Trainingsdaten, das Modell kann sie
auswendig.

[`nuts/`](nuts/) richtet die Fabrik deshalb auf einen Tag aus **Advent of
Code**. Drei Dinge kommen mit, die sich sonst niemand ausdenken mag: der
Rätseltext als Spezifikation, dein Input als Aufgabe, und deine bereits
akzeptierte Antwort als Orakel.

```bash
git restore --source=step-22 -- nuts/   # die Werkzeuge dazuholen
node nuts/aoc.js 2025 1        # holen: Rätsel, Input, deine Antworten
nuts/use.sh 2025 1             # aufstellen: Suite, Input, Ziel
node factory.js "$(cat .aoc/goal.md)" "node --test"
```

Die Suite liegt vor dem Bau auf der Platte, also sieht der Builder sie nie, und
sie prüft zwei Dinge statt einem:

- **Richtig.** Gegen die Antwort, die die Seite für diesen Input schon
  akzeptiert hat. Kein Teilerfolg.
- **In der Zeit.** Zehn Sekunden je Teil. Fast jeder harte Tag hat eine Lösung,
  die am Beispiel im Rätseltext stimmt und am echten Input bis morgen früh
  rechnet. Ein Gate ohne Uhr kann die beiden nicht unterscheiden.

Beide Hälften laufen in einem Kindprozess, damit ein Bau, der nicht anhält, den
Lauf nicht mitnimmt. Deshalb steht hier `node --test` als Gate-Befehl und nicht
`npm test`: eine Nuss wird an der Antwort und an der Uhr gemessen, nicht an
einer Coverage-Schwelle. Damit ist das DoD aus Stück 19 nicht mehr selbst
gestellt, sondern kommt von außen.

### Gemessen

| Aufgabe | Orakel | Zeit | Kosten | Rücksprünge |
|---|---|---|---|---|
| 2025 Tag 1, Secret Entrance | 1076 / 6379 | 187 s | $1,14 | 0 |
| 2025 Tag 6, Trash Compactor | keins | 282 s | $0,44 | 0 |

Beides echte Läufe, beide grün in Runde 1, und genau das ist die Lehre daraus:
**ein Tag 1 ist ein Aufwärmen und beweist die Verkabelung, nicht die Fabrik.**
Nimm einen Tag, dessen Teil 2 die Bauform aus Teil 1 sprengt statt nur die
Zahlen zu vergrößern. Wo eine Liste zu einer Zählung werden muss, eine Rekursion
zu einer gemerkten, eine Suche zu einer über dem richtigen Zustand.

### Ein Tag ohne Orakel

Einen Tag, den du nie gelöst hast, kannst du trotzdem laufen lassen. Dann steht
das durchgerechnete Beispiel aus dem Rätsel im Gate, und du liest die Zahl
dafür selbst von der Seite ab:

```bash
nuts/use.sh 2025 6 --example ~/aoc/inputs/p6_example.txt --expect 4277556
```

Geprüft wird: das Beispiel liefert die Zahl, die im Rätsel steht; der echte
Input liefert zweimal dasselbe; beides bleibt im Budget. Am Ende druckt die
Suite die Antwort, die dabei herauskam, und den Satz dazu, dass nichts hier
sagt, ob sie stimmt.

Der Lauf oben endete so mit `7229350537438`. Zwanzig Zeilen daneben sagen mehr
als das grüne Gate: ein zweites Skript hat den Input mit einer anderen Lesart
der Spaltentrennung zerlegt (1000 Aufgaben, gleiches Ergebnis) und die Summe in
BigInt nachgerechnet (identisch, größte Einzelaufgabe 4,4·10¹¹, also keine
Rundung). Erst das ist ein Urteil. **Ein grünes Gate plus zwanzig Zeilen
unabhängiges Nachrechnen schlägt ein grünes Gate**, und das gilt eine Ebene
höher genauso wie hier.

Was offen bleibt, steht im Kopf der Suite: ein Bau, der das Beispiel als
Sonderfall abfängt, besteht alle drei Punkte. Diese Lücke schließt nur das
Einreichen, und Einreichen ist Handarbeit.

## Die Fabrik über OpenRouter

Es gibt **nichts am Code zu ändern**. OpenRouter spricht das
Anthropic-Messages-Format selbst, also genügt eine andere Adresse:

```bash
cp env.openrouter.example .env.openrouter   # Key eintragen
set -a; . ./.env.openrouter; set +a
node factory.js "Implement a FizzBuzz function"
```

Der dritte Eintrag in der Datei ist der wichtige: `ANTHROPIC_API_KEY=` bleibt
**leer**. Der CLI zieht ihn dem Token vor — steht dort noch ein persönlicher
Key, läuft der Lauf grün und die Rechnung geht an das falsche Konto.

Seit Stück 9 liest `factory.js` die drei Modelle aus der Umgebung, also ist ein anderes Roster eine Zeile in der Env-Datei und kein Eingriff in den Code.

```
PLANNER_MODEL=anthropic/claude-sonnet-4.5
BUILDER_MODEL=anthropic/claude-haiku-4.5
REVIEWER_MODEL=anthropic/claude-sonnet-4.5
```

Ohne diese Zeilen läuft alles wie vorher, weil die Vorgabe die alte Konstante ist. `box.js` reicht die drei Namen mit den Credentials in die Box durch, sonst gilt der Schalter draußen und in der Box läuft das alte Roster.

Zwei Dinge, die ein solcher Lauf gelehrt hat, und beide sind unangenehm.

**Die Kostenspalte wird zur Fiktion.** Der CLI rechnet den Preis aus seiner
eigenen Tabelle, nicht aus der Abrechnung des Gateways. Dieselbe Drei-Wort-
Antwort, dreimal gemessen:

| Modell-String | gemeldete Kosten |
|---|---|
| `claude-haiku-4-5` | $0,0168 |
| `anthropic/claude-haiku-4.5` | $0,1194 |
| `openai/gpt-4o-mini` | $0,0957 |

Identische Arbeit, drei Zahlen. Die **relative** Lehre hält weiterhin — Code-
Phasen kosten null, Urteil kostet mehr als Ausführung — die absoluten Dollar
nicht mehr. Wer sie braucht, liest sie bei OpenRouter ab.

**Ein anderes Modell bringt andere Gewohnheiten mit.** `gpt-4o-mini` nannte
seine Test-Datei `test/test_fizzbuzz.js` — Python-Schule. `node --test` findet
sie, der Glob `test/*.test.js` im Gate fand sie nicht, und der Lauf war vier
Runden rot mit der Meldung „kein Test gefunden", obwohl direkt daneben eine
Suite lag. Das ist kein Modell-Fehler, sondern eine arbiträre Konvention, die
nur in einem Glob stand. Deshalb prüft das Gate jetzt `test/*.js` — dieselbe
Definition, die `hasTests()` schon benutzte. Drei Stellen, eine Regel.

Es ist genau die Sorte Falle, um die es in diesem Modul geht.

## Optional: der Pull Request statt des Branches

Die letzte Phase committet auf `factory/<lauf>` und hört auf. Das ist die
ehrliche Grenze — eine Fabrik schlägt vor, ein Mensch mergt. Nur sieht sich
einen lokalen Branch niemand an.

```bash
FACTORY_PR=1 node factory.js "Implement the tennis kata"
```

Damit pusht die Fabrik den Branch und öffnet über `gh` einen Pull Request —
und zwar **in dem Repo, in das sie gepusht hat**. Das ist keine Kosmetik: bei
einem Fork setzt `gh` die Basis sonst auf das Upstream, und aus einem Kurs mit
zwölf Leuten würden zwölf Pull Requests in einem fremden Repo. Die Fabrik
leitet das Ziel aus `origin` ab und übergibt es als `--repo`.
Sie mergt weiterhin nichts. Der Vorschlag landet dort, wo Vorschläge
hingehören — in einem Review-Fenster mit einem Menschen davor.

Das ist ausgeschaltet, solange du es nicht einschaltest, und das ist Absicht:
das Lab läuft in einem leeren Verzeichnis ohne Remote, und ein Standard, der
nach draußen schreibt, wäre für einen Übungsraum die falsche Voreinstellung.
Fehlt der Remote oder ist `gh` nicht angemeldet, sagt der Lauf es und bleibt
lokal — rot wird er davon nicht:

```
      push failed — staying local: fatal: 'origin' does not appear to be a git repository
  05  CODE   commit  factory/1787874473909
```

Zwei Grade von „nach draußen", die man auseinanderhalten sollte: **pushen ist
ein Ergebnis ablegen, ein PR ist eine Wirkung auf andere Menschen.** Workshop 15
trennt beides in zwei Schalter, weil dort Boxen ohne Aufsicht laufen. Hier ist
es einer, weil hier jemand danebensitzt.

## Der Check, den die Fabrik nicht stellen kann

Im Kurs-Repo liegt ab Stück 1 eine Datei, die nicht zur Fabrik gehört:

```yaml
# .github/workflows/gate.yml
on: pull_request
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm test
```

Dasselbe `npm test` — und trotzdem etwas anderes. Das Gate im Lauf wird von
dem gestartet, der liefern will. **Grün heißt dort: der Kandidat sagt, er hat
bestanden.** Der Check auf GitHub läuft auf einer Maschine, die die Fabrik nicht
anfassen kann, gegen den **Merge-Stand** statt gegen die Branch-Spitze, mit einer
frisch installierten Node-Version.

Was er fängt, das dein lokales Gate nicht fangen kann:

| Fall | Warum lokal grün |
|---|---|
| Der Code importiert etwas, das nur bei dir liegt | Beim Lauf lagen `factory.js` und die Prompts daneben |
| Eine erzeugte Datei ist nie im Commit gelandet | Das Gate prüft den Arbeitsbaum, der Check den Commit |
| `main` ist inzwischen weitergelaufen | Die Fabrik hat gegen einen alten Stand geprüft |
| Andere Node-Version | Deine ist zufällig die passende |

**Und die Versuchung, die man auslassen sollte:** GitHub lässt sich über die API
auch von außen mit Check-Runs und Commit-Status befüllen. Die Fabrik *könnte*
ihr eigenes grünes Häkchen an den PR schreiben. Genau das nicht — das wäre
dieselbe Falle wie die selbst geschriebene Test-Suite, nur eine Ebene höher und
an der Stelle, der Menschen am meisten vertrauen. Ein Häkchen ist nur so viel
wert wie seine Unabhängigkeit von dem, der es setzt.

## Dieselbe Kette als Claude-Workflow

[`workflow/mini-factory.js`](workflow/mini-factory.js) ist die Fabrik noch
einmal, diesmal als Workflow-Script. Im Kurs-Repo liegt sie **ab `step-8`** —
davor nicht, denn sie ist die ganze Kette in einer Datei und würde auf `main`
die Lösung verraten. Verlinkt ist sie zusätzlich unter
`.claude/workflows/mini-factory.js`, also aufrufbar über ihren Namen:

```
Workflow({ name: "mini-factory",
           args: { dir: "/tmp/wf-demo", goal: "Implement a FizzBuzz function" } })
```

`args.dir` ist Pflicht und wirft ohne.

**Der Schlusspunkt.** Bau die Kette erst von Hand; dann lohnt die eine Frage,
die dieses Script stellt: ein Workflow hat `agent()`, `parallel()` und
JavaScript — aber kein Primitiv, das eine Shell startet. Das Gate kann also
nicht mehr der Code sein, der `npm test` ausführt.

Die Grenze verschiebt sich, das Gesetz bleibt: **ausgeführt wird delegiert,
entschieden wird im Script.** Loop, Vergleich, Mehrheitszählung und die
CRAP-Rechnung sind reines JavaScript; der messende Agent meldet `branches` und
`coverage` als Zahlen und urteilt nicht. Der Builder gibt die Dateien per
`schema` als Daten zurück, ein zweiter, mechanischer Agent schreibt sie.

Was der Workflow dazugewinnt, sieht man in einer Zeile: das Drei-Lenses-Panel
aus Stück 8 ist hier ein `parallel()`-Aufruf. In `panel/` brauchte dasselbe
`ask()`, `panel()` und rund 20 Zeilen async-Verkabelung.

Für den Raum reicht das Script auf der Leinwand. Ein echter Lauf kostet sieben
Agenten und macht einen Commit.

## Der Preis dieser Einfachheit

Schreibt der Builder seine eigenen Tests, prüft das Gate die Annahmen dessen,
der es bestehen soll — es ist **selbst benotet**. Als Warnung ist der Satz
richtig, aber zu grob.

**Der Tic-Tac-Toe-Lauf war korrekt.** Selbst benotet, zwei Rücksprünge, fünf
Dateien, grün. Danach von Hand durchprobiert: alle Ecken, in denen man Fehler
erwartet, verhalten sich richtig.

Der Hinweis ist, **wo** die Schwäche sitzt. Die Regeln von Tic-Tac-Toe stehen
in den Trainingsdaten tausendfach, also schreibt das Modell Tests, die sie
korrekt kodieren. Ein selbst benotetes Gate ist genau so gut, wie die Aufgabe
bekannt ist:

| Aufgabe | Selbst benotetes Gate |
|---|---|
| kanonisch (Tic-Tac-Toe, FizzBuzz, Roman Numerals) | überraschend belastbar — die Erwartung ist Allgemeinwissen |
| arbiträre Konvention (die kanonische Modifier-Reihenfolge eines Hotkeys, ein Alias-Satz) | rät, und die Tests raten mit |
| deine Geschäftsregel (Rabattstaffel, Abrechnungsgrenze, Vertragsstatus) | wertlos — die Erwartung steht in keinem Kopf außer in einem menschlichen |

Die dritte Zeile ist der Grund, warum das nicht die Bauform für echte Arbeit
ist. Und sie erklärt, warum die Kata im großen Workshop ein Hotkey-Parser ist:
dort liegt die Spezifikation **nur** in den Tests, und genau dort springen die
gemessenen 90% auf 100%.

Der Review federt das ab, er hebt es nicht auf. Ein zweiter Agent mit frischem
Kontext findet die fehlende Anforderung — aber auch er behauptet nur;
deterministisch ist nur der Regex, der `revise` erkennt.

Deshalb der eine Handgriff, der aus einer Prüfung ein Urteil macht: leg eine
Suite hin — von Hand, von einem Kollegen, aus dem Ziel-Repo — und der Builder
kommt nicht mehr an sie heran.

## Was das Lab weglässt

Die Auslassungen sind die Landkarte zurück in den großen Workshop:

| Hier | Im großen Workshop |
|---|---|
| eine feste Kette | ein **Katalog** von 11 ADWs, vom Scout bis zum vollen Lebenszyklus |
| ein Reviewer auf Sonnet | der Reviewer sitzt auf **Opus**, mit frischem Kontext und Effort high |
| Fan-out nur über den Review (Stück 8) | **Best-of-N über den Build**, jeder Kandidat in seinem Worktree |
| ein Lauf | **Sessions**: ein zweiter Workflow übernimmt die letzte Übergabe per `--adw-id` |
| `--tools ""` und ein Pfad-Label | pro Rolle deklarierte **Schreibgrenzen**, per `git status` erzwungen und zurückgerollt |
| selbst geschriebene Tests | eine **vorher feststehende** Suite, die der Builder nie sieht |
| Konsolenzeilen | **Ereignisstrom** und eine Live-Swim-Lane im Browser |
| „vermutlich besser" | ein **Benchmark** gegen `swift test`: 90% → 100% für 7% Mehrkosten |

Zwei Sätze zum Mitnehmen: eine Fabrik ist ein **Tail-Risk-Instrument** — sie
verhindert, dass der schlechte Lauf ausgeliefert wird. Und jede zusätzliche
Phase ist ein weiterer Weg, still falsch zu liegen. Nimm die kürzeste Kette,
die die Arbeit noch beweist.
