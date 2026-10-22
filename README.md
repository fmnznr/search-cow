# Wo ist die Kuh?

Wimmelspiel auf Zeit: Finde die eine echte Kuh zwischen Schafen, Dalmatinern und Leuten im Kuhkostüm.

Spielen: https://fmnznr.github.io/search-cow/

## Aufbau

- `src/shell.html`, `src/style.css` – Markup und Gestaltung
- `src/main.js` – Einstieg; importiert alle Module in fester Reihenfolge
- `src/core/` – Zufall (seedbar), Hilfsfunktionen, Canvas und Bildgröße, Plattform-Erkennung
- `src/content/` – Figuren (`entities/`, je Gruppe eine Datei) und Welten
- `src/scene/` – Szenen-Erzeugung
- `src/modes/` – Regelwerke der Spielmodi (Zeit, Punkte, Levelplan); ohne DOM, per Unit-Test geprüft
- `src/render/` – Zeichnen: Welt, Effekte, Bild pro Frame, Übergang
- `src/audio/` – Geräusche und Musik, alles synthetisiert
- `src/game/` – Spielzustand, Ablauf, Aktionen, Eingabe, Schleife, Test-Schnittstelle
- `src/ui/` – HUD, Endbildschirm, Knöpfe, Installation
- `src/store/` – Rekord und Bestenliste
- `src/legal/` – Impressum und Datenschutz
- `src/sw.template.js` – Vorlage für den Service Worker
- `fonts/` – selbst ausgelieferte Schriften (`npm run fonts` lädt sie neu)
- `scripts/build.mjs` – bündelt mit esbuild zu `dist/artifact.html` (fürs claude.ai-Artifact) und `index.html`, baut `impressum.html`, `datenschutz.html` und `sw.js` für die installierbare Web-App (PWA)

Die Web-App läuft auf jedem statischen Host (z. B. GitHub Pages) direkt aus dem Repo-Stamm.

## Befehle

```sh
npm install
npm run build        # nach jeder Änderung an src/ oder fonts/
npm run lint         # findet u. a. fehlende Importe
npm run build:itch   # zusätzlich dist/itch.zip für itch.io
npm test             # Lint, Unit-, Smoke-, Fairness- und Schnappschuss-Test
npm run og-image     # Vorschaubild icons/og.png neu rendern
```

Playwright ist auf 1.56.1 festgelegt, damit lokal und in der CI dieselbe Chromium-Version rendert (wichtig für die Bildvergleiche). Mit anderem Chromium: `CHROMIUM_PATH=/pfad/zu/chrome npm test`.

- **Unit-Tests** (`test/unit/`): Zufall, Regelwerke „Klassisch“ und „Chill“ (Levelplan, Punkte, Zeit, Fehlklicks) und Einstellungen (inkl. Übernahme alter Schlüssel) direkt in Node.
- **Smoke-Test:** keine Fehler, keine Anfragen an fremde Server, Schriften geladen, Lautstärke wird gespeichert, Rechtsseiten erreichbar, startet offline.
- **Fairness-Test:** prüft tausende Szenen, ob die Kuh sichtbar, frei und groß genug ist.
- **Schnappschuss-Test:** friert das Verhalten ein – 120 erzeugte Szenen, 8 gerenderte Bilder und 3 durchgespielte Runden auf manueller Uhr (`test/snapshots/`). Jede Abweichung schlägt an; Bild-Abweichungen landen in `test/snapshots/out/`.
  Ist eine Änderung gewollt (neue Farbe, andere Punkte), Referenzen neu schreiben und im selben Commit einchecken: `npm run snapshots -- --update`.

GitHub Actions führt Build-Prüfung und alle Tests bei jedem Push auf jeden Branch aus.

Eine gemeldete Szene nachspielen: `index.html?szene=<Level>-<Seed>` in gleicher Fenstergröße (die Kennung steht im Pause- und im Endbildschirm).

## itch.io

`npm run build:itch`, dann `dist/itch.zip` hochladen: Kind of project „HTML“, „This file will be played in the browser“, Embed in page, Viewport 960×640, Mobile friendly und Fullscreen button an.
