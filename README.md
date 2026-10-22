# Wo ist die Kuh?

Wimmelspiel auf Zeit: Finde die eine echte Kuh zwischen Schafen, Dalmatinern und Leuten im Kuhkostüm.

- `src/game.html` – Quelle des Spiels (so wird es auch als claude.ai-Artifact veröffentlicht)
- `src/sw.template.js` – Vorlage für den Service Worker
- `scripts/build.mjs` – erzeugt `index.html` und `sw.js` für die installierbare Web-App (PWA)

Nach jeder Änderung an `src/`:

```sh
node scripts/build.mjs
```

Fairness-Test (prüft tausende Szenen, ob die Kuh sichtbar, frei und groß genug ist):

```sh
npm install
npm run fairness   # mit vorinstalliertem Chromium: CHROMIUM_PATH=/pfad/zu/chrome npm run fairness
```

Eine gemeldete Szene nachspielen: `index.html?szene=<Level>-<Seed>` in gleicher Fenstergröße (die Kennung steht im Pause- und im Endbildschirm).

Die Web-App läuft auf jedem statischen Host (z. B. GitHub Pages) direkt aus dem Repo-Stamm.
