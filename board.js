#!/usr/bin/env node
import { createServer } from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { readdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const DIR = resolve(process.argv[2] ?? '.runs/journal');
const APP = resolve(process.argv[3] ?? resolve(DIR, '..', 'app'));
const PORT = Number(process.env.PORT) || 4174;

function runs() {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(resolve(DIR, f), 'utf8')))
    .sort((a, b) => Number(b.run) - Number(a.run));
}

const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>mini-factory · Läufe</title>
<style>
  :root { --edge: #ddd; --agent: #1a1a1a; --code: #bdbdbd; --rot: #b00020; --gruen: #1b5e20; }
  body { font: 14px/1.5 system-ui, sans-serif; margin: 32px; max-width: 72rem; color: #1a1a1a; }
  h1 { font-size: 17px; margin: 0; }
  .kopf { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 0 0 20px; }
  .steuer { display: flex; align-items: baseline; gap: 8px; }
  .steuer button { font: inherit; font-size: 12px; padding: 4px 14px; border: 1px solid #1a1a1a; background: #1a1a1a; color: #fff; cursor: pointer; }
  .steuer button:disabled { background: #fff; color: #bbb; border-color: var(--edge); cursor: default; }
  .steuer #stoppen, .steuer #leeren { background: #fff; color: #1a1a1a; }
  .steuer #stoppen:disabled { color: #bbb; border-color: var(--edge); }
  .sagt { font-size: 11.5px; color: #666; max-width: 34rem; text-align: right; }
  h2 { font-size: 15px; margin: 28px 0 2px; }
  .sub { color: #666; font-size: 12px; margin: 0 0 12px; }
  .run { border-top: 2px solid #1a1a1a; padding-top: 10px; margin-bottom: 34px; }
  .meta { display: flex; gap: 18px; flex-wrap: wrap; font-size: 12px; color: #666; margin-bottom: 14px; }
  .meta b { color: #1a1a1a; font-weight: 600; }
  .cand { border: 1px solid var(--edge); border-left: 4px solid var(--code); padding: 10px 12px; margin-bottom: 10px; }
  .cand.sieger { border-left-color: var(--gruen); background: #f6fbf6; }
  .cand.tot { border-left-color: var(--rot); }
  .cand h3 { font-size: 14px; margin: 0 0 6px; display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
  .badge { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; padding: 2px 7px; border: 1px solid var(--edge); }
  .badge.ok { border-color: var(--gruen); color: var(--gruen); }
  .badge.no { border-color: var(--rot); color: var(--rot); }
  /* Die Kette, wie sie in „Was ein ADW ist" steht: wer vorschlägt, wer
     entscheidet — und wo der Lauf gerade steht. */
  .flow { display: flex; align-items: stretch; gap: 4px; margin: 8px 0 10px; }
  .knoten { flex: 1 1 0; min-width: 0; border: 1px solid var(--edge); padding: 4px 10px 3px; font-size: 12px; line-height: 1.25; background: #fff; }
  .pfeil, .rueck { flex: 0 0 auto; }
  @media (max-width: 700px) { .flow { flex-wrap: wrap; } .knoten { flex: 1 1 8rem; } }
  .knoten .hak { margin-right: 5px; }
  .knoten em { display: block; font-style: normal; font-size: 9.5px; letter-spacing: .07em; text-transform: uppercase; color: #999; }
  .knoten.fertig { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
  .knoten.fertig em { color: #bdbdbd; }
  .knoten.laeuft { border-color: #1a1a1a; box-shadow: inset 0 -3px 0 #1a1a1a; animation: pochen 1.1s ease-in-out infinite; }
  @keyframes pochen { 50% { box-shadow: inset 0 -3px 0 #bdbdbd; } }
  .pfeil { align-self: center; color: #bdbdbd; font-size: 12px; }
  .rueck { align-self: center; font-size: 11px; color: #666; margin-left: 6px; }
  .lane { display: grid; grid-template-columns: 6rem 9rem 1fr 5rem 4rem; gap: 6px; align-items: center; font-size: 12px; padding: 1px 0; }
  .lane .role { font-weight: 600; }
  .lane .model { color: #666; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .track { position: relative; height: 11px; background: linear-gradient(to right, var(--edge) 1px, transparent 1px) repeat-x; background-size: 25% 100%; }
  .bar { position: absolute; top: 1px; height: 9px; background: var(--agent); min-width: 2px; }
  .bar.code { background: var(--code); }
  .bar.rot { background: var(--rot); }
  .bar.laeuft { background: repeating-linear-gradient(90deg, #1a1a1a 0 6px, #bdbdbd 6px 12px); }
  @keyframes wandern { to { background-position: 12px 0; } }
  .bar.laeuft { animation: wandern 700ms linear infinite; }
  .axis { display: grid; grid-template-columns: 6rem 9rem 1fr 5rem 4rem; gap: 6px; font-size: 10px; color: #666; margin-top: 4px; }
  .axis .ticks { display: flex; justify-content: space-between; border-top: 1px solid var(--edge); padding-top: 2px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; color: #444; }
  table.dod { border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  table.dod td { border-bottom: 1px solid var(--edge); padding: 3px 14px 3px 0; }
  .verdict { font-size: 13px; margin: 6px 0 0; }
  .verdict .seit { color: #666; }
  .leer { color: #666; }
  details.run > summary { cursor: pointer; list-style: none; padding: 8px 0; }
  details.run > summary::-webkit-details-marker { display: none; }
  details.run > summary h2 { display: inline; }
  details.run > summary .zu { color: #666; font-size: 12px; margin-left: 10px; }
  details.run[open] > summary .zu { display: none; }
  .tabs { display: flex; gap: 6px; margin-top: 12px; }
  .tabs button { font: inherit; font-size: 12px; padding: 3px 12px; border: 1px solid var(--edge); background: #fff; cursor: pointer; color: #444; }
  .tabs button:hover { background: #f4f4f4; }
  .tabs button[aria-pressed="true"] { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
  .pane:empty { display: none; }
  div.chat { max-height: 460px; overflow: auto; border: 1px solid var(--edge); margin: 8px 0 2px; }
  .turn { border-bottom: 1px solid var(--edge); padding: 8px 12px; }
  .turn:last-child { border-bottom: 0; }
  .turn .kopf { display: flex; gap: 10px; align-items: baseline; font-size: 12px; margin-bottom: 4px; }
  .turn .rolle { font-weight: 600; }
  .turn .wer { font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: #999; }
  .turn pre { margin: 2px 0 0; font-size: 11.5px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 190px; overflow: auto; padding: 6px 8px; }
  .turn pre.prompt { background: #f4f4f4; color: #333; }
  .turn pre.antwort { background: #fff; border: 1px solid var(--edge); }
  pre.stdout { background: #1a1a1a; color: #eee; border: 1px solid #1a1a1a; padding: 10px 12px; margin: 8px 0 2px; max-height: 420px; overflow: auto; font-size: 11.5px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
  /* Der Diff ist die eine Stelle, die nicht die Farben der Seite benutzt:
     Grün heißt hier dazugekommen, Rot heißt weg. So liest die Welt Diffs. */
  .diffwrap { display: grid; grid-template-columns: 240px 1fr; border: 1px solid var(--edge); margin: 8px 0 2px; }
  @media (max-width: 860px) { .diffwrap { grid-template-columns: 1fr; } }
  .tree { border-right: 1px solid var(--edge); background: #fafafa; padding: 8px 0; max-height: 420px; overflow: auto; }
  .tree .dir { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #999; padding: 8px 12px 2px; }
  .tree button { display: flex; align-items: baseline; gap: 8px; width: 100%; text-align: left; font: inherit; font-size: 12px; cursor: pointer; background: none; border: 0; padding: 4px 12px; color: inherit; }
  .tree button:hover { background: #f0f0f0; }
  .tree button[aria-pressed="true"] { background: #ececec; box-shadow: inset 3px 0 0 #1a1a1a; }
  .tree .st { font-size: 10px; width: 1.4em; flex: none; text-align: center; border: 1px solid #1a1a1a; line-height: 1.5; }
  .tree .st.add { background: var(--gruen); color: #fff; }
  .tree .st.del { background: var(--rot); color: #fff; }
  .tree .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tree .cnt { margin-left: auto; font-size: 10px; white-space: nowrap; }
  .tree .cnt .a { color: var(--gruen); }
  .tree .cnt .d { color: var(--rot); }
  .patch { max-height: 420px; overflow: auto; background: #fff; }
  .patch pre { margin: 0; font-size: 12px; line-height: 1.5; }
  .patch .ln { display: block; padding: 0 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .patch .ln.add { background: color-mix(in srgb, var(--gruen) 14%, transparent); }
  .patch .ln.del { background: color-mix(in srgb, var(--rot) 12%, transparent); }
  .patch .ln.hunk { background: #f0f0f0; color: #666; }
  .patch .ln.meta { color: #999; }
  .patch .empty { padding: 16px; font-size: 13px; color: #666; }
  code { font-size: 12px; }
</style>
<header class="kopf">
  <h1>mini-factory · Läufe</h1>
  <div class="steuer">
    <span class="sagt" id="sagt"></span>
    <button id="starten">Lauf starten</button>
    <button id="stoppen">Stoppen</button>
    <button id="leeren">Läufe leeren</button>
  </div>
</header>
<div id="board" class="leer">lädt …</div>
<script>
  const eur = (n) => n == null ? '—' : '$' + n.toFixed(4);
  const sec = (ms) => ms == null ? '' : (ms / 1000).toFixed(1) + 's';

  // Die Kette ist fest: fünf Stationen, zwei davon entscheiden. Wiederholt sich
  // eine, zählt der Knoten mit — der Rücksprung ist kein neuer Kasten.
  const KETTE = [['plan', 'Agent'], ['build', 'Agent'], ['test', 'Code'], ['review', 'Agent'], ['commit', 'Code']];

  function flow(c) {
    const zahl = {};
    for (const p of c.phases) zahl[p.role] = (zahl[p.role] || 0) + 1;
    const laufend = c.phases.find((p) => p.läuft);
    const fertig = new Set(c.phases.filter((p) => !p.läuft).map((p) => p.role));
    const knoten = KETTE.map(([rolle, wer]) => {
      const stand = laufend && laufend.role === rolle ? 'laeuft' : fertig.has(rolle) ? 'fertig' : '';
      const n = zahl[rolle] > 1 ? ' ×' + zahl[rolle] : '';
      const hak = stand === 'fertig' ? '<span class="hak">✓</span>' : '';
      return '<span class="knoten ' + stand + '">' + hak + rolle + n + '<em>' + wer + '</em></span>';
    }).join('<span class="pfeil">→</span>');
    const rueck = (zahl.build || 0) > 1 ? '<span class="rueck">↩ ' + (zahl.build - 1) + '× zurück an Build</span>' : '';
    return '<div class="flow">' + knoten + rueck + '</div>';
  }

  // Drei Lenses laufen gleichzeitig, nicht nacheinander. Sie teilen sich den
  // Startpunkt, und die Uhr rückt erst weiter, wenn die langsamste fertig ist.
  function zeitachse(c) {
    const phasen = c.phases || [];
    let at = 0;
    const start = [];
    for (let i = 0; i < phasen.length; i++) {
      const p = phasen[i];
      start.push(p.par && i > 0 && phasen[i - 1].par ? start[i - 1] : at);
      const weiter = !(p.par && i + 1 < phasen.length && phasen[i + 1].par);
      if (weiter) {
        const gruppe = phasen.slice(0, i + 1).filter((_, j) => start[j] === start[i]);
        at = start[i] + Math.max(...gruppe.map((x) => x.ms || 0), 0);
      }
    }
    return { start, ende: at };
  }

  function lanes(c, axis) {
    const { start } = zeitachse(c);
    return c.phases.map((p, i) => {
      const code = p.model === 'code';
      const rot = p.role === 'test' && c.gate && !c.gate.pass;
      const at0 = start[i];
      const left = (at0 / axis) * 100;
      const w = p.läuft ? Math.max(6, 100 - left) : Math.max(0.6, ((p.ms || 0) / axis) * 100);
      return \`<div class="lane">
        <span class="role">\${p.role}</span>
        <span class="model">\${code ? '—' : p.model}</span>
        <span class="track"><span class="bar \${code ? 'code' : ''} \${rot ? 'rot' : ''} \${p.läuft ? 'laeuft' : ''}" data-at="\${at0}" data-ms="\${p.läuft ? 'läuft' : (p.ms || 0)}" style="left:\${left.toFixed(2)}%;width:\${w.toFixed(2)}%"></span></span>
        <span class="num">\${p.läuft ? '…' : p.usd ? eur(p.usd) : 'frei'}</span>
        <span class="num">\${p.läuft ? 'läuft' : sec(p.ms)}</span>
      </div>\`;
    }).join('');
  }

  function ticks(axis) {
    const at = [0, 0.25, 0.5, 0.75, 1].map((f) => sec(axis * f));
    return \`<div class="axis"><span></span><span></span>
      <span class="ticks">\${at.map((s) => '<span>' + s + '</span>').join('')}</span>
      <span></span><span></span></div>\`;
  }

  function dod(c) {
    if (!c.dodItems || !c.dodItems.length) return '';
    return '<table class="dod">' + c.dodItems.map((d) =>
      \`<tr><td>\${d.ok ? '✓' : '✗'}</td><td>\${d.item}</td><td><code>\${d.test ?? 'kein Test'}</code></td></tr>\`).join('') + '</table>';
  }

  function candidate(c, winner, axis, r) {
    const sieger = c.name === winner;
    const abgebrochen = c.ok === false && !c.gate;
    const gate = c.gate ? \`\${c.gate.tests.pass} grün\${c.gate.tests.fail ? ' · ' + c.gate.tests.fail + ' rot' : ''}\`
      : abgebrochen ? 'abgebrochen' : (c.ok == null ? '—' : c.ok ? 'grün' : 'rot');
    return \`<div class="cand \${sieger ? 'sieger' : (c.ok == null ? '' : c.ok && c.dod ? '' : 'tot')}">
      <h3>\${c.name}\${sieger ? ' · Sieger' : ''}
        <span class="badge \${c.ok == null ? '' : c.ok ? 'ok' : 'no'}">Gate \${gate}</span>
        <span class="badge \${c.dod == null || abgebrochen ? '' : c.dod ? 'ok' : 'no'}">DoD \${c.dod == null || abgebrochen ? '—' : c.dod ? 'erfüllt' : 'verfehlt'}</span>
        <span class="badge">\${eur(c.usd)}</span>
        <span class="badge">\${sec(zeitachse(c).ende)}</span>
        \${c.branch ? \`<span class="badge">\${c.branch}</span>\` : ''}
      </h3>
      \${flow(c)}
      \${lanes(c, axis)}
      \${ticks(axis)}
      \${dod(c)}
      <div class="tabs" data-cand="\${r}:\${c.name}" data-branch="\${c.branch || ''}" data-log="\${c.log || ''}" data-dir="\${c.dir || ''}">
        \${c.branch ? '<button data-kind="chat" aria-pressed="false">Verlauf</button>' : ''}
        \${c.log ? '<button data-kind="log" aria-pressed="false">Ausgabe</button>' : ''}
        \${c.branch ? '<button data-kind="diff" aria-pressed="false">Diff</button>' : ''}
      </div>
      <div class="pane"></div>
    </div>\`;
  }

  // Was gerade passiert, in einem Satz. Die Rolle sagt, wer dran ist; das
  // Modell sagt, wer arbeitet; das Gate sagt, wer entscheidet.
  const SATZ = {
    plan: (m) => 'plant — <b>' + m + '</b> legt die Struktur fest',
    build: (m) => 'baut — <b>' + m + '</b> schreibt die Dateien',
    test: () => 'am Gate — <b>npm test</b> entscheidet',
    review: (m) => 'im Review — <b>' + m + '</b> liest, was gebaut wurde',
    commit: () => 'committet — der Branch entsteht',
    crap: () => 'misst die Komplexität',
  };

  function narration(r) {
    const teile = [];
    let start = null;
    for (const c of r.candidates) {
      const p = (c.phases || []).find((x) => x.läuft);
      if (!p) {
        teile.push(c.name + ' ' + ((c.phases || []).length ? 'ist fertig' : 'startet'));
        continue;
      }
      const vor = (c.phases || []).filter((x) => !x.läuft).reduce((s, x) => s + (x.ms || 0), 0);
      if (start === null || vor < start) start = vor;
      teile.push(c.name + ' ' + (SATZ[p.role] ? SATZ[p.role](p.model) : p.role));
    }
    return '<span data-seit="' + (start ?? 0) + '">' + teile.join(' · ') + '<span class="seit"></span></span>';
  }

  function run(r, open) {
    const total = r.candidates.reduce((s, c) => s + (c.usd || 0), 0);
    const axis = Math.max(20000, ...r.candidates.map((c) => zeitachse(c).ende));
    const verdict = r.status === 'läuft'
      ? narration(r)
      : r.winner
        ? \`Sieger: <b>\${r.winner}</b> — billigster grüner Kandidat, der das DoD erfüllt.\`
        : r.candidates.every((c) => !c.gate)
          ? 'Kein Kandidat ist bis zum Gate gekommen. Die Ausgabe sagt, woran es lag.'
          : r.candidates.some((c) => c.gate && c.gate.pass)
            ? 'Kein Kandidat, der das DoD erfüllt.'
            : 'Kein Kandidat, der durchs Gate gekommen ist.';
    const fertig = r.candidates.reduce((m, c) => Math.max(m, zeitachse(c).ende), 0);
    return \`<details class="run" data-key="run:\${r.run}" data-run="\${r.run}" data-status="\${r.status || ''}" data-base="\${fertig}" \${open ? 'open' : ''}>
      <summary>
        <h2>\${r.goal}</h2>
        <span class="zu">\${new Date(Number(r.run)).toLocaleString()} · \${r.candidates.length} Kandidaten · \${eur(total)}\${r.winner ? ' · Sieger ' + r.winner : ''}\${r.status === 'läuft' ? ' · läuft gerade' : ''}</span>
      </summary>
      <p class="sub">\${new Date(Number(r.run)).toLocaleString()} · Lauf \${r.run}\${r.status === 'läuft' ? ' · <b>läuft gerade</b>' : ''}</p>
      <div class="meta">
        <span><b>\${r.candidates.length}</b> Kandidaten</span>
        <span>Summe <b>\${eur(total)}</b>\${r.cap ? ' von $' + r.cap : ''}</span>
        <span>DoD: <b>\${(r.dodPlan || []).length}</b> Kriterien</span>
      </div>
      \${r.candidates.map((c) => candidate(c, r.winner, axis, r.run)).join('')}
      <p class="verdict">\${verdict}</p>
    </details>\`;
  }

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  // Ein Patch, viele Dateien: einmal holen, hier aufteilen. Der Server bleibt
  // ein git-Aufruf, die Seite bleibt eine Ansicht.
  function parsePatch(text) {
    const files = [];
    let cur = null;
    for (const line of text.split('\\n')) {
      if (line.startsWith('diff --git ')) {
        cur = { path: line.split(' b/').pop(), add: 0, del: 0, st: 'M', lines: [] };
        files.push(cur);
      }
      if (!cur) continue;
      cur.lines.push(line);
      if (line.startsWith('new file mode')) cur.st = 'A';
      else if (line.startsWith('deleted file mode')) cur.st = 'D';
      else if (line.startsWith('+') && !line.startsWith('+++')) cur.add++;
      else if (line.startsWith('-') && !line.startsWith('---')) cur.del++;
    }
    return files;
  }

  function paintPatch(pane, file) {
    if (!file) { pane.innerHTML = '<div class="empty">Kein Diff — dieser Kandidat hat nichts hinterlassen.</div>'; return; }
    pane.innerHTML = '<pre>' + file.lines.map((l) => {
      const k = l.startsWith('+') && !l.startsWith('+++') ? 'add'
        : l.startsWith('-') && !l.startsWith('---') ? 'del'
        : l.startsWith('@@') ? 'hunk'
        : /^(diff |index |\\+\\+\\+|---|new file|deleted file)/.test(l) ? 'meta' : '';
      return '<span class="ln ' + k + '">' + (esc(l) || ' ') + '</span>';
    }).join('') + '</pre>';
  }

  // Der Lauf hinterlässt zweierlei: Code, und die Papiere dazu. Der Plan steht
  // als PLAN.md im Commit, der DoD-Beleg im Journal — beides gehört hierhin.
  function beleg(branch) {
    const b = BELEG[branch];
    if (!b) return null;
    if (!b.items.length) {
      if (!b.plan || !b.plan.length) return null;
      return {
        path: 'DoD (geplant)',
        st: '=', add: 0, del: 0, artefakt: true,
        lines: ['Definition of Done — steht im Plan, geprüft wird nach dem Gate.', '']
          .concat(b.plan.map((d) => '·  ' + d))
          .concat(['', 'Noch nicht geprüft.']),
      };
    }
    return {
      path: 'DoD-Beleg',
      st: '=', add: 0, del: 0, artefakt: true,
      lines: ['Definition of Done — geprüft, nachdem das Gate grün war.', '']
        .concat(b.head ? ['Commit: ' + b.head, ''] : [])
        .concat(b.items.map((d) => (d.ok ? '✓' : '✗') + '  ' + d.item + '   →   ' + (d.test || 'kein Test')))
        .concat(['', b.items.filter((d) => d.ok).length + ' von ' + b.items.length + ' Kriterien getragen.']),
    };
  }

  function paintTree(tree, pane, files) {
    if (!files.length) { tree.innerHTML = '<div class="empty">nichts geändert</div>'; paintPatch(pane, null); return; }
    const zeile = (f, i) => '<button data-i="' + i + '" aria-pressed="' + (i === 0) + '">'
      + '<span class="st ' + (f.st === 'A' ? 'add' : f.st === 'D' ? 'del' : '') + '">' + f.st + '</span>'
      + '<span class="nm">' + esc(f.path) + '</span>'
      + '<span class="cnt">' + (f.artefakt ? '' : '<span class="a">+' + f.add + '</span> <span class="d">−' + f.del + '</span>') + '</span>'
      + '</button>';
    const code = files.filter((f) => !f.artefakt);
    const papier = files.filter((f) => f.artefakt);
    tree.innerHTML = '<div class="dir">gebaut</div>' + code.map((f) => zeile(f, files.indexOf(f))).join('')
      + (papier.length ? '<div class="dir">Papiere des Laufs</div>' + papier.map((f) => zeile(f, files.indexOf(f))).join('') : '');
    paintPatch(pane, files[0]);
    tree.onclick = (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      tree.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      paintPatch(pane, files[Number(b.dataset.i)]);
    };
  }

  const BELEG = {};
  const OFFEN = new Set();
  const DIFFS = {};
  const CHATS = {};
  const LOGS = {};
  const ANSICHT = {};
  let letzter = '';

  // Ein Kandidat, drei Ansichten, eine Fläche. Derselbe Knopf noch einmal
  // schließt sie wieder — der Zustand hängt am Kandidaten, nicht am DOM.
  async function zeige(tabs) {
    const pane = tabs.parentElement.querySelector('.pane');
    const btn = tabs.querySelector('button[aria-pressed="true"]');
    if (!btn) { pane.innerHTML = ''; return; }
    const branch = tabs.dataset.branch;
    const dir = tabs.dataset.dir || '';
    const spur = '?branch=' + encodeURIComponent(branch) + (dir ? '&dir=' + encodeURIComponent(dir) : '');
    if (btn.dataset.kind === 'log') {
      const name = tabs.dataset.log;
      pane.innerHTML = '<pre class="stdout">' + esc(LOGS[name] ?? 'lädt …') + '</pre>';
      const text = await (await fetch('/log?name=' + encodeURIComponent(name))).text();
      LOGS[name] = text;
      const pre = tabs.parentElement.querySelector('.pane pre');
      if (pre && pre.textContent !== text) pre.textContent = text;
      return;
    }
    if (btn.dataset.kind === 'chat') {
      const male = (turns) => turns.length === 0
        ? '<div class="empty">kein Verlauf im Commit</div>'
        : turns.map((x) => '<div class="turn">'
            + '<div class="kopf"><span class="rolle">' + String(x.n).padStart(2, '0') + '  ' + x.role + '</span>'
            + '<span class="wer">' + (x.model || 'code') + '</span>'
            + '<span class="wer">' + (x.usd ? '$' + x.usd.toFixed(4) : 'frei') + '</span></div>'
            + (x.prompt ? '<pre class="prompt">' + esc(x.prompt) + '</pre>' : '')
            + (x.answer ? '<pre class="antwort">' + esc(String(x.answer)) + '</pre>' : '')
          + '</div>').join('');
      pane.innerHTML = '<div class="chat">' + (!dir && CHATS[branch] ? male(CHATS[branch]) : 'lädt …') + '</div>';
      const turns = await (await fetch('/chat' + spur)).json();
      if (!dir) CHATS[branch] = turns;
      const feld = tabs.parentElement.querySelector('.pane .chat');
      if (feld) feld.innerHTML = male(turns);
      return;
    }
    pane.innerHTML = '<div class="diffwrap"><div class="tree">' + (!dir && DIFFS[branch] ? '' : 'lädt …') + '</div><div class="patch"></div></div>';
    const roh = dir || !DIFFS[branch] ? await (await fetch('/diff' + spur)).text() : DIFFS[branch];
    if (!dir) DIFFS[branch] = roh;
    const files = parsePatch(roh);
    for (const f of files) if (f.path === 'PLAN.md') f.artefakt = true;
    const b = beleg(branch);
    if (b) files.push(b);
    paintTree(pane.querySelector('.tree'), pane.querySelector('.patch'), files);
  }

  function wiederherstellen() {
    for (const d of document.querySelectorAll('details[data-key]')) {
      if (OFFEN.has(d.dataset.key) && !d.open) d.open = true;
    }
    for (const tabs of document.querySelectorAll('.tabs')) {
      const kind = ANSICHT[tabs.dataset.cand];
      if (!kind) continue;
      const btn = tabs.querySelector('button[data-kind="' + kind + '"]');
      if (btn) { btn.setAttribute('aria-pressed', 'true'); zeige(tabs); }
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tabs button');
    if (!btn) return;
    const tabs = btn.closest('.tabs');
    const an = btn.getAttribute('aria-pressed') === 'true';
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    if (!an) btn.setAttribute('aria-pressed', 'true');
    ANSICHT[tabs.dataset.cand] = an ? null : btn.dataset.kind;
    zeige(tabs);
  });

  document.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!d.matches('details[data-key]')) return;
    if (d.open) OFFEN.add(d.dataset.key); else OFFEN.delete(d.dataset.key);
  }, true);

  async function draw() {
    const text = await (await fetch('/runs')).text();
    const kern = text.replace(/"at":\s*"[^"]*"/g, '');
    if (kern === letzter) return;
    letzter = kern;
    const rs = JSON.parse(text);
    knöpfe(rs);
    document.getElementById('board').innerHTML = rs.length === 0
      ? '<p class="leer">Noch kein Lauf. <code>node fleet.js plan.json</code></p>'
      : rs.map((r, i) => run(r, OFFEN.size === 0 && i === 0)).join('');
    for (const r of rs) for (const c of r.candidates) BELEG[c.branch] = { items: c.dodItems || [], head: c.head, plan: r.dodPlan || [] };
    wiederherstellen();
  }

  // Die Achse wächst mit dem Lauf: alle vier Sekunden eine neue Phase, aber die
  // Zeit vergeht dazwischen. Das hier zeichnet nicht neu, es rechnet nur um.
  function wachsen() {
    for (const el of document.querySelectorAll('.run[data-status="läuft"]')) {
      const seit = Date.now() - Number(el.dataset.run);
      const axis = Math.max(5000, Number(el.dataset.base || 0), seit);
      for (const bar of el.querySelectorAll('.bar')) {
        const at = Number(bar.dataset.at || 0);
        const ms = bar.dataset.ms === 'läuft' ? Math.max(0, seit - at) : Number(bar.dataset.ms || 0);
        bar.style.left = ((at / axis) * 100).toFixed(2) + '%';
        bar.style.width = Math.max(0.6, (ms / axis) * 100).toFixed(2) + '%';
      }
      const satz = el.querySelector('.verdict [data-seit]');
      if (satz) {
        const vor = Number(satz.dataset.seit || 0);
        const s = Math.max(0, (seit - vor) / 1000);
        satz.querySelector('.seit').textContent = ', seit ' + s.toFixed(0) + ' s';
      }
      el.querySelectorAll('.ticks').forEach((row) => {
        [...row.children].forEach((s, i) => { s.textContent = ((axis * (i / 4)) / 1000).toFixed(1) + 's'; });
      });
    }
  }

  const knopfStart = document.getElementById('starten');
  const knopfStop = document.getElementById('stoppen');
  const sagt = document.getElementById('sagt');

  async function schicken(pfad) {
    sagt.textContent = '';
    const a = await (await fetch(pfad, { method: 'POST' })).json();
    if (!a.ok) sagt.textContent = a.warum;
    letzter = '';
    draw();
  }
  knopfStart.onclick = () => schicken('/run');
  knopfStop.onclick = () => schicken('/stop');
  document.getElementById('leeren').onclick = () => schicken('/clear');

  function knöpfe(rs) {
    const läuft = rs.some((r) => r.status === 'läuft');
    knopfStart.disabled = läuft;
    knopfStop.disabled = !läuft;
    document.getElementById('leeren').disabled = läuft;
  }

  draw();
  setInterval(draw, 1000);
  setInterval(wachsen, 250);
</script>
`;

// Nur Branches, die in einem Journal stehen. Das Board liest Läufe, es ist
// keine Fernbedienung für git.
function known(branch) {
  return runs().some((r) => r.candidates.some((c) => c.branch === branch));
}

function knownLog(name) {
  return runs().some((r) => r.candidates.some((c) => c.log === name));
}

function knownDir(dir) {
  return dir !== '' && runs().some((r) => r.candidates.some((c) => c.dir === dir));
}

// Vor dem Commit gibt es nichts zu diffen — außer dem, was schon im Worktree
// liegt. Genau das will man sehen, während gebaut wird.
function diffLive(dir) {
  const teile = [];
  // -uall, sonst meldet git nur `src/` statt der Dateien darin — und ein
  // Verzeichnis lässt sich nicht diffen.
  const status = execFileSync('git', ['-C', dir, 'status', '--porcelain', '-uall'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const zeile of status) {
    const pfad = zeile.slice(3);
    if (/^(factory|util)\.js$|prompt$|^package\.json$|^\.adw/.test(pfad)) continue;
    try {
      teile.push(zeile.startsWith('??')
        ? execFileSync('git', ['-C', dir, 'diff', '--no-index', '--', '/dev/null', pfad], { encoding: 'utf8' })
        : execFileSync('git', ['-C', dir, 'diff', '--', pfad], { encoding: 'utf8' }));
    } catch (e) { teile.push(e.stdout ?? ''); }
  }
  // Der Plan steht erst beim Commit als PLAN.md auf der Platte. Er existiert
  // aber, sobald die erste Phase fertig ist — also zeigen wir ihn von dort.
  const planText = planAus(dir);
  if (planText) {
    const zeilen = planText.trimEnd().split('\n');
    teile.unshift([
      'diff --git a/PLAN.md b/PLAN.md',
      'new file mode 100644',
      '--- /dev/null',
      '+++ b/PLAN.md',
      `@@ -0,0 +1,${zeilen.length} @@`,
      ...zeilen.map((z) => '+' + z),
      '',
    ].join('\n'));
  }
  return teile.join('');
}

function planAus(dir) {
  const adwRoot = resolve(dir, '.adw');
  if (!existsSync(adwRoot)) return null;
  const adw = readdirSync(adwRoot).map((r) => resolve(adwRoot, r))[0];
  if (!adw) return null;
  const datei = readdirSync(adw).find((f) => /^\d+-plan\.json$/.test(f));
  if (!datei) return null;
  try { return JSON.parse(readFileSync(resolve(adw, datei), 'utf8')).answer ?? null; }
  catch { return null; }
}

function chatLive(dir) {
  const adwRoot = resolve(dir, '.adw');
  if (!existsSync(adwRoot)) return [];
  const adw = readdirSync(adwRoot).map((r) => resolve(adwRoot, r))[0];
  if (!adw) return [];
  const turns = new Map();
  for (const f of readdirSync(adw).sort()) {
    const m = f.match(/^(\d+)-([a-z]+)\.(json|prompt\.md)$/);
    if (!m) continue;
    const [, n, role, kind] = m;
    if (!turns.has(n)) turns.set(n, { n: Number(n), role });
    const turn = turns.get(n);
    const body = readFileSync(resolve(adw, f), 'utf8');
    if (kind === 'json') {
      const j = JSON.parse(body);
      turn.model = j.model ?? 'code';
      turn.usd = j.usd ?? 0;
      turn.answer = j.answer ?? j.output ?? (j.pass === undefined ? null : (j.pass ? 'grün' : 'rot'));
    } else {
      turn.prompt = body;
    }
  }
  return [...turns.values()].sort((a, b) => a.n - b.n);
}

// Ein Klon aus dem Bundle legt nur main als lokalen Branch an, der Rest steht
// unter origin/. Das Journal kennt aber den Namen ohne Präfix.
function ref(branch) {
  for (const kandidat of [branch, `origin/${branch}`]) {
    try {
      execFileSync('git', ['-C', APP, 'rev-parse', '--verify', '--quiet', `${kandidat}^{commit}`], { encoding: 'utf8' });
      return kandidat;
    } catch { /* weiter */ }
  }
  return branch;
}

function chat(branch) {
  const files = execFileSync('git', ['-C', APP, 'ls-tree', '-r', '--name-only', ref(branch), '--', '.adw'], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  const turns = new Map();
  for (const f of files) {
    const m = f.match(/(\d+)-([a-z]+)\.(json|prompt\.md)$/);
    if (!m) continue;
    const [, n, role, kind] = m;
    if (!turns.has(n)) turns.set(n, { n: Number(n), role });
    const turn = turns.get(n);
    const body = execFileSync('git', ['-C', APP, 'show', `${ref(branch)}:${f}`], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if (kind === 'json') {
      const j = JSON.parse(body);
      turn.model = j.model ?? 'code';
      turn.usd = j.usd ?? 0;
      turn.answer = j.answer ?? j.output ?? (j.pass === undefined ? null : (j.pass ? 'grün' : 'rot'));
    } else {
      turn.prompt = body;
    }
  }
  return [...turns.values()].sort((a, b) => a.n - b.n);
}

function diff(branch) {
  // Die Fabrik reist mit: factory.js, util.js, die Prompts, package.json. Sie
  // stehen im Commit, sind aber nicht das, was der Kandidat gebaut hat.
  const mitgereist = ['.adw', 'factory.js', 'util.js', 'planner.prompt', 'builder.prompt', 'reviewer.prompt', 'package.json'];
  return execFileSync('git', ['-C', APP, 'diff', `main..${ref(branch)}`, '--', '.', ...mitgereist.map((f) => `:!${f}`)], { encoding: 'utf8', maxBuffer: 1 << 26 });
}

// Ein Lauf zur Zeit, und er hängt nicht am Board: `detached` gibt ihm eine
// eigene Prozessgruppe, damit `stop` auch die Kandidaten erwischt.
let kind = null;
const läuftNoch = () => kind !== null && kind.exitCode === null && kind.signalCode === null;

function starten() {
  if (läuftNoch()) return { ok: false, warum: 'Es läuft schon einer.' };
  // Ohne Schlüssel ist kein Fehler: dann zahlt die Anmeldung in ~/.claude. Ein
  // Gateway ohne Token dagegen kann nicht gutgehen — das fängt der Lauf sonst
  // erst in der ersten Phase, und dann hat er schon einen Worktree angelegt.
  if (process.env.ANTHROPIC_BASE_URL && !process.env.ANTHROPIC_AUTH_TOKEN && !process.env.ANTHROPIC_API_KEY) {
    return { ok: false, warum: 'Gateway gesetzt, aber kein Token. Entweder: set -a; . ./.env.openrouter; set +a — oder ANTHROPIC_BASE_URL unsetzen und die Subscription zahlen lassen.' };
  }
  // Über ein Gateway ist eine Anthropic-Abkürzung kein Sparmodell, sondern der
  // Frontier-Preis mit Umweg. Der Lauf würde starten und teuer werden.
  if (process.env.ANTHROPIC_BASE_URL) {
    const roh = [['PLANNER_MODEL', process.env.PLANNER_MODEL], ['BUILDER_MODEL', process.env.BUILDER_MODEL], ['REVIEWER_MODEL', process.env.REVIEWER_MODEL]]
      .filter(([, m]) => !m || !m.includes('/'));
    if (roh.length) {
      return { ok: false, warum: `Gateway gesetzt, aber ${roh.map(([n]) => n).join(', ')} ohne Slug — das fährt Anthropic-Modelle zum Frontier-Preis. Roster setzen, etwa PLANNER_MODEL=google/gemini-3.6-flash.` };
    }
  }
  kind = spawn('node', ['fleet.js', 'plan.json'], { cwd: process.cwd(), detached: true, stdio: 'ignore', env: process.env });
  kind.unref();
  return { ok: true, pid: kind.pid };
}

// Wegräumen heißt: die Journale und die Ausgaben. Die Branches der Kandidaten
// bleiben — das Ergebnis eines Laufs gehört nicht dem Board.
function leeren() {
  if (läuftNoch()) return { ok: false, warum: 'Erst stoppen, dann leeren.' };
  let weg = 0;
  for (const f of existsSync(DIR) ? readdirSync(DIR) : []) {
    if (f.endsWith('.json') || f.endsWith('.log')) { rmSync(resolve(DIR, f)); weg++; }
  }
  return { ok: true, weg };
}

function stoppen() {
  if (!läuftNoch()) return { ok: false, warum: 'Es läuft keiner.' };
  try { process.kill(-kind.pid, 'SIGTERM'); } catch { /* schon weg */ }
  return { ok: true };
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/diff') {
    const branch = url.searchParams.get('branch') ?? '';
    const dir = url.searchParams.get('dir') ?? '';
    const live = knownDir(dir) && existsSync(dir);
    res.writeHead(live || known(branch) ? 200 : 404, { 'content-type': 'text/plain; charset=utf-8' });
    if (!live && !known(branch)) return res.end(`unbekannter Branch: ${branch}`);
    try { return res.end((live ? diffLive(dir) : diff(branch)) || '(noch nichts geschrieben)'); }
    catch (e) { return res.end(`git sagt: ${String(e.message).split('\n')[0]}`); }
  }
  if (req.method === 'POST' && url.pathname === '/clear') {
    const antwort = leeren();
    res.writeHead(antwort.ok ? 200 : 409, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(antwort));
  }
  if (req.method === 'POST' && (url.pathname === '/run' || url.pathname === '/stop')) {
    const antwort = url.pathname === '/run' ? starten() : stoppen();
    res.writeHead(antwort.ok ? 200 : 409, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(antwort));
  }
  if (url.pathname === '/chat') {
    const branch = url.searchParams.get('branch') ?? '';
    const dir = url.searchParams.get('dir') ?? '';
    const live = knownDir(dir) && existsSync(dir);
    res.writeHead(live || known(branch) ? 200 : 404, { 'content-type': 'application/json' });
    if (!live && !known(branch)) return res.end('[]');
    try { return res.end(JSON.stringify(live ? chatLive(dir) : chat(branch))); }
    catch { return res.end('[]'); }
  }
  if (url.pathname === '/log') {
    const name = url.searchParams.get('name') ?? '';
    res.writeHead(knownLog(name) ? 200 : 404, { 'content-type': 'text/plain; charset=utf-8' });
    if (!knownLog(name)) return res.end(`unbekanntes Log: ${name}`);
    const file = resolve(DIR, name);
    return res.end(existsSync(file) ? readFileSync(file, 'utf8') || '(noch nichts geschrieben)' : '(kein Log)');
  }
  if (req.url === '/runs') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(runs()));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(PAGE);
}).listen(PORT, '127.0.0.1', () => console.log(`  board: http://127.0.0.1:${PORT}  (${DIR})`));
