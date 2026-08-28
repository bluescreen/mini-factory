# mini-factory

Eine Software-Fabrik, klein genug, um sie in 35 Minuten selbst zu bauen: ein
Satz auf der Kommandozeile wird zu einem Branch, den ein Mensch mergt. Fünf
Dateien, gut 130 Zeilen, keine Abhängigkeit.

```bash
git clone git@github.com:bluescreen/mini-factory.git && cd mini-factory
```

Was du dann vor dir hast, ist ein leeres Node-Projekt und diese Anleitung —
**nicht** die fertige Fabrik. Die baust du. Aus der Workshop-Serie
*Agent Roster*, Modul 12: die Software-Fabrik.

## Das Lab: von leerem Git zur laufenden Fabrik

Von leerem Git zur laufenden Fabrik — in sieben Stücken, jedes für sich lauffähig.
Du baust nichts nach; du lässt **Claude Code** bauen und prüfst nach jedem Stück
mit einem Befehl, ob es hält. Am Ende macht ein Satz auf der Kommandozeile einen
Branch:

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
macht — fünf Dateien, gut 130 Zeilen, keine Abhängigkeit.

## Bevor es losgeht

| Voraussetzung | Prüfen mit |
|---|---|
| Node ≥ 20 | `node --version` |
| Git | `git --version` |
| Claude Code, eingeloggt | `claude -p --tools "" "sag ok"` |

Der letzte Befehl ist der wichtige: das Lab läuft von der ersten Minute an
gegen echte Modelle. `--tools ""` nimmt dem Agenten die Hände — er antwortet mit
Text, schreiben tut die Fabrik. Wer das weglässt, bekommt irgendwann den Satz
„Awaiting permission to write…" in seine Datei geschrieben.

| # | Stück | Zeit | Danach kannst du |
|---|---|---|---|
| 1 | [Das leere Projekt](#1-das-leere-projekt) | 3 min | `npm test` — und es gibt nichts zu testen |
| 2 | [Der Planner](#2-der-planner) | 6 min | einen Plan erzeugen und nachlesen |
| 3 | [Der Builder](#3-der-builder) | 6 min | Dateien entstehen lassen — ungeprüft |
| 4 | [Die Übergabe](#4-die-übergabe) | 4 min | sehen, wie der Plan beim Builder ankommt |
| 5 | [Das Gate und der Rücksprung](#5-das-gate-und-der-rücksprung) | 6 min | rot → zurück an Build → grün |
| 6 | [Die zwei Prüfungen vor dem Commit](#6-die-zwei-prüfungen-vor-dem-commit) | 5 + 3 min | ein zweites Gate gegen das Ziel — und optional eine Zahl gegen den Wildwuchs |
| 7 | [Der Commit und die Rechnung](#7-der-commit-und-die-rechnung) | 5 min | einen Branch und den Preis des Laufs |
| 8 | [Der Review fächert auf](#8-der-review-fächert-auf-optional) | +8 min | **optional** — drei Lenses gleichzeitig, Mehrheit entscheidet |

Stücke 1–5 plus Commit sind der 30-Minuten-Kern, der Review die zusätzlichen
fünf. Wer knapp in der Zeit ist, hängt ihn hinterher an — die Kette läuft ohne
ihn.

**Stück 8 gehört nicht zum Lab.** Die Fabrik ist mit Stück 7 fertig und
lauffähig; acht ist die Kür, die die Graph-Achse anprobiert. Wer nach sieben
aufhört, hat nichts verpasst.

Steckst du fest: [`solution/`](solution/) ist der fertige Stand der Kette,
[`panel/`](panel/) der von Stück 8.

**Im Kurs-Repo liegt jedes Stück als Tag.** Die Teilnehmer klonen
[bluescreen/mini-factory](https://github.com/bluescreen/mini-factory) und
bekommen `main` — das leere Projekt und diese Anleitung, nicht die Lösung. Wer
den Anschluss verliert, zieht einen Schritt nach, ohne die eigene Arbeit
anzufassen:

```bash
git tag -n                          # das Inhaltsverzeichnis: sieben Schritte
git diff step-3 step-4              # genau das, was ein Stück hinzufügt
git restore --source=step-4 -- .    # den Stand in den eigenen Baum holen
git switch --detach step-4          # ihn nur anschauen
```

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
npm pkg set scripts.reset="rm -rf .adw src test && echo 'weg: .adw src test'"
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

planner.prompt — ein Prompt-Template auf Englisch mit dem Platzhalter {{goal}}.
Es verlangt eine kurze Spezifikation und einen Implementierungsplan: öffentliche
API, Datenstrukturen, Schritte, Randfälle und welche Dateien geschrieben werden.
Höchstens 20 Zeilen, kein Code.

util.js — die Mechanik, sprechende Namen:
- beim Import ein Lauf-Verzeichnis .adw/<timestamp>/ anlegen und einen
  Schrittzähler führen (01, 02, …)
- prompt(file, vars): Template laden, {{key}} ersetzen, übrige Platzhalter leeren
- phase(role, model, text): den kompilierten Prompt als NN-<role>.prompt.md
  ablegen, dann `claude -p --tools "" --output-format json --model <model>
  <text>` per spawnSync aufrufen, aus der JSON-Antwort result nehmen, das Ganze
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

```text
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

util.js — phase() schreibt die Dateien selbst: alle Blöcke mit Pfad-Label aus
der Antwort schneiden, Verzeichnisse anlegen, schreiben und die Pfade loggen.
Vorher löscht sie, was die vorige Runde geschrieben hat. Eine Antwort ohne
Pfad-Label schreibt nichts — die Planner-Phase läuft also unverändert durch.
Lag beim Start schon eine Suite da, werden Blöcke unter test/ verworfen und
gezählt gemeldet.

factory.js — nach dem Planner den Builder aufrufen.
```

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

Beachte, was hier **nicht** passiert: die Fabrik druckt kein Etikett, in
welchem der drei Fälle du bist. `hasTests()` sieht nur `test/*.js` — ein Repo
mit `__tests__/` würde falsch beschriftet. Der verworfene Block dagegen ist
eine Tatsache und wird gemeldet.

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

reviewer.prompt — englisches Template mit {{goal}}, {{plan}} und {{files}}. Es
lässt gegen Ziel und Plan prüfen, ausdrücklich nicht gegen die Tests: dieselbe
Phase hat Code und Tests geschrieben, die Suite beweist also Konsistenz, nicht
Korrektheit. Gesucht sind fehlende Anforderungen aus dem Ziel, ungedeckte
Randfälle und falsche Annahmen. Die Antwort beginnt mit einer Zeile
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

### 6.2 Der CRAP-Check (optional)

Die Fabrik hat vier Kräfte, die alle in dieselbe Richtung ziehen: der Builder
liefert jedes Mal den *vollständigen* Dateisatz, der Rücksprung fügt hinzu statt
umzudenken, der Reviewer fragt „fehlt etwas?", die Coverage-Decke belohnt mehr
Tests. Nichts in der Kette sagt jemals **zu viel** — die Slop-Kanone.

Deshalb ein fünfter Handgriff, ausgeschaltet, solange du ihn nicht einschaltest:

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
util.js — commit(goal): einen Branch factory/<lauf-id> auschecken, alles
stagen, mit "feat: <goal>" committen, als NN-commit.json ablegen und
"NN  CODE  commit  <branch>" loggen.

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

Was du ändern *willst*, sind die drei Modell-Konstanten oben in `factory.js`.
Jetzt darf da auch etwas stehen, das nicht von Anthropic ist:

```js
const PLANNER  = 'anthropic/claude-sonnet-4.5';
const BUILDER  = 'openai/gpt-4o-mini';
const REVIEWER = 'anthropic/claude-sonnet-4.5';
```

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
