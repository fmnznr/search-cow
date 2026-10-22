# Roadmap: Wo ist die Kuh?

Vier Phasen, jede für sich veröffentlichbar. Leitlinie: **Sicherheit geht vor Wachstum** – erst ein stabiler, getesteter Unterbau, dann neue Spielinhalte, dann Reichweite.

| Phase | Ziel | Aufwand | Server |
|---|---|---|---|
| 1 Soft Launch | Öffentlich, rechtlich sauber, faire Szenen, auf itch.io | 1–2 Tage | nein |
| 2 Umbau und Spielmodi | Modularer Code mit Sicherheitsnetz; Chill- und Challenge-Modus | 3–5 Wochen | nein |
| 3 Kuh des Tages | Grund zum Wiederkommen und Teilen, Englisch | 1–2 Wochen | nein |
| 4 Community | Globale Bestenliste, Spieleportale | 2–3 Wochen | ja |

Am Ende jeder Phase steht eine Go/No-go-Entscheidung für die nächste.

---

## Phase 1: Soft Launch (detailliert)

Reihenfolge einhalten: 1.1 ist Voraussetzung für 1.2, 1.7 setzt 1.1 bis 1.3 voraus.

### 1.1 Szenen per Seed reproduzierbar machen ✅

**Umgesetzt:** `rnd` statt `Math.random` in der Szenen-Erzeugung, `genScene(lv, { seed })`, `levelScene` würfelt neu, bis die Kuh einen fairen Platz hat und sich ab Level 13 die Welt ändert. Szenen-Kennung „Szene 14-777“ in Pause- und Endbildschirm; `index.html?szene=14-777` spielt sie nach (zählt nicht für Rekord und Bestenliste).

**Warum:** Fairness-Test (1.2), Fehlerberichte („Szene 48213 ist kaputt“), die Schnappschuss-Tests in Phase 2 und die Kuh des Tages brauchen deterministische Szenen.

**Ist-Zustand:** `R`, `RI`, `pick`, `wpick`, `mkBlob`, `mkSpots`, alle `init()`-Funktionen der Typen und `genScene` nutzen direkt `Math.random`. Nur der Hintergrund ist schon geseedet (`mulberry(sc.seed)` in `paintBg`).

**Umsetzung in `src/game.html`:**
1. Eine austauschbare Quelle einführen, direkt bei den Helfern (ca. Zeile 382):
   ```js
   let rnd = Math.random;
   const R = (a, b) => a + rnd() * (b - a);
   const RI = (a, b) => Math.floor(a + rnd() * (b - a + 1));
   const pick = a => a[Math.floor(rnd() * a.length)];
   ```
2. Alle `Math.random()` in Szenen-relevantem Code durch `rnd()` ersetzen: `wpick`, `mkBlob`, Typ-`init`s, `personInit`, `initClouds`/`initAmb`, `planFor`, `makeEnt`, `genScene`.
   **Nicht** ersetzen (bleibt `Math.random`, damit Effekte den Seed-Strom nicht verschieben): Rauschen im Audio (Z. 549), Screenshake (Z. 1978), Übergangs-Blobs (Z. 2043), Fehlklick-Texte (Z. 2164), Laufzeit-Verhalten in der Update-Schleife (Z. 2381, 2386).
3. `genScene(lv, opts)` bekommt `opts.seed`. Ablauf: `const seed = opts.seed ?? (Math.random() * 2 ** 31) | 0; rnd = mulberry(seed); … ; rnd = Math.random;` (in `try/finally`). `sc.seed = seed`, `planFor` läuft innerhalb des geseedeten Blocks.
4. URL-Parameter für Reproduktion: `?szene=7-12345` startet direkt dieses Level mit diesem Seed (nur Einstiegspunkt, kein UI).
5. Seed sichtbar machen: im Pause-Dialog klein „Szene 7-12345“ (Level-Seed), damit Spieler Fehler melden können.

**Hinweis:** Die Szene hängt weiterhin von der Fenstergröße ab (`W`, `H`, `U` bestimmen Anzahl und Position). Gleicher Seed + gleiche Fenstergröße = gleiche Szene. Das reicht für Phase 1; Phase 3 (Kuh des Tages) muss das lösen.

**Fertig, wenn:** Zwei Aufrufe von `genScene(5, { seed: 42 })` bei gleicher Fenstergröße identische `ents` (Typ, Position, Farben) liefern.

### 1.2 Automatischer Fairness-Test ✅

**Umgesetzt:** `npm run fairness` (5 Fenstergrößen × 20 Level × 50 Seeds, feste Seed-Folge). Ergebnis des ersten Laufs: Platzierung, HUD, Radar-Knopf und Verdeckung waren schon in Ordnung; einziges Problem waren winzige Kühe auf Handys (bis 11 px). Behoben: Die Kuh steht nur noch dort, wo sie mindestens 22 px groß ist (Mini-Kuh 16 px), und bei Touch ist die Trefferfläche mindestens 40 px.

**Ist-Zustand:** `genScene` schützt die Kuh schon teilweise: Figuren vor der Kuh, die ihren Kern überlappen, werden entfernt; die Kuh meidet HUD und Radar-Knopf. Ungeprüft ist, ob das immer greift. Insbesondere nutzt die Platzierungsschleife (400 Versuche) nach dem letzten Fehlversuch trotzdem die letzte Position.

**Umsetzung:**
1. In `genScene` die Platzierung prüfbar machen: `sc.cowPlaced = true` nur bei `break`. Falls `false`: Szene mit neuem Seed (abgeleitet: `seed + 1`) neu erzeugen, maximal 5-mal.
2. Test-Hook nur mit `?test`: `window.__WDK__ = { genScene, entBox, resize: … , get W(), get H() }`.
3. Neues Skript `scripts/fairness.mjs` (Playwright, Chromium unter `/opt/pw-browsers` bzw. Standard):
   - Viewports: 360×640, 390×844, 768×1024, 1366×768, 1920×1080
   - Level 1–20 und für jedes Level die Modifikatoren `night`, `move`, `twins`, `tiny` erzwingen (über `opts.plan`)
   - je Kombination 50 Seeds (lokal; in CI 10)
   - Prüfungen pro Szene:
     - **Platziert:** `sc.cowPlaced === true`
     - **Sichtbar:** Kuh-Box liegt komplett im Fenster, unterhalb der HUD-Höhe, nicht im Radar-Bereich unten rechts
     - **Nicht verdeckt:** Fläche der Kuh-Box, die von Boxen später gezeichneter Figuren (Index in `ents` nach der Kuh) bedeckt ist, ≤ 35 %
     - **Treffbar:** kürzere Seite der Kuh-Box ≥ 36 CSS-px (Touch-Ziel; bei `tiny` ≥ 28)
   - Ausgabe: Tabelle der Verstöße mit `viewport, lv, mods, seed` plus Exit-Code ≠ 0
4. Gefundene Verstöße beheben (vermutlich Schwellen in `genScene` nachziehen), bis der Test grün ist.
5. Optional, wenn Box-Heuristik zu grob ist: Pixeltest – Szene einmal mit und einmal ohne Kuh rendern, Anteil geänderter Pixel im Kuh-Bereich messen.

Der `move`-Modus wird nur zum Startzeitpunkt geprüft; dass laufende Figuren die Kuh kurz verdecken, ist gewollt.

**Fertig, wenn:** `node scripts/fairness.mjs` lokal mit 50 Seeds ohne Verstoß durchläuft.

### 1.3 Schriften selbst ausliefern ✅

**Umgesetzt:** `npm run fonts` lädt die Schriften nach `fonts/`; `build.mjs` ersetzt die Google-Einbindung, der Service Worker cached sie. Der Smoke-Test prüft, dass keine fremden Hosts angefragt werden.

**Warum:** Google Fonts direkt einzubinden überträgt IP-Adressen an Google; in Deutschland wurde das abgemahnt (LG München I, 20.01.2022). Außerdem funktionieren die Schriften dann sicher offline.

**Rahmen:** Das claude.ai-Artifact darf Stylesheets nur von Google Fonts laden. Deshalb bleibt `src/game.html` unverändert, und nur `build.mjs` tauscht die Einbindung für die Web-App.

**Umsetzung:**
1. Neues Skript `scripts/fetch-fonts.mjs` (einmalig ausführen, Ergebnis einchecken): lädt die CSS von `fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap` mit Chrome-User-Agent, lädt nur die Subsets `latin` und `latin-ext` als woff2 nach `fonts/`, schreibt `fonts/fonts.css` mit lokalen `url(...)`.
2. Lizenz: beide Schriften stehen unter SIL OFL 1.1 → `fonts/OFL.txt` beilegen.
3. `scripts/build.mjs`: die zwei `preconnect`-Zeilen und den Google-Fonts-`<link>` aus dem Body entfernen und `<link rel="stylesheet" href="fonts/fonts.css">` in den Head setzen.
4. `src/sw.template.js`: `fonts/fonts.css` und alle woff2 in `SHELL`, den `FONT_HOSTS`-Zweig entfernen. Die Font-Dateien auch in den Versions-Hash in `build.mjs` aufnehmen.

**Fertig, wenn:** Beim Laden von `index.html` keine Anfrage an einen fremden Host geht (wird in 1.7 automatisch geprüft) und die Schriften im Flugmodus nach dem ersten Besuch korrekt erscheinen.

### 1.4 Impressum und Datenschutz ✅ (Adresse fehlt noch)

**Umgesetzt:** Quellen in `src/legal/`, gebaut nach `impressum.html` und `datenschutz.html`. **Offen:** Platzhalter `[Vorname Nachname]`, `[Straße Hausnummer]`, `[PLZ Ort]`, `[E-Mail]` in beiden Dateien ersetzen, dann `npm run build`. Der Build warnt, solange Platzhalter drin sind.

*Keine Rechtsberatung; bei Unsicherheit Generator (z. B. e-recht24) oder Anwalt.*

1. `impressum.html` und `datenschutz.html` als schlichte statische Seiten im Repo-Stamm, gleiche Schriften und Farben.
2. **Impressum** (§ 5 DDG): Name, ladungsfähige Anschrift, E-Mail. Wer die Privatadresse nicht veröffentlichen will: Impressum-Service mit c/o-Adresse.
3. **Datenschutz**, Inhalte:
   - Verantwortlicher (wie Impressum)
   - Hosting bei GitHub Pages: Server-Logs mit IP-Adresse, Übermittlung in die USA (EU-US Data Privacy Framework), Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO
   - Lokaler Speicher auf dem Gerät, ohne Übertragung: `wdk-sound`, `wdk-music`, `wdk-record`, `wdk-board`, `wdk-nick`; nötig für vom Nutzer gewünschte Funktionen (§ 25 Abs. 2 TDDDG)
   - Service Worker / Offline-Cache
   - Keine Cookies, kein Tracking, keine Fremdanbieter (gilt erst nach 1.3)
   - Betroffenenrechte, Beschwerderecht bei der Aufsichtsbehörde
4. Links „Impressum · Datenschutz“ klein unten auf dem Startbildschirm, nur wenn `STANDALONE_HOST` (im claude.ai-Artifact nicht).
5. Beide Seiten in die `SHELL` des Service Workers.

**Fertig, wenn:** Beide Seiten erreichbar sind, vom Startbildschirm verlinkt und alle tatsächlich genutzten Speicher-Schlüssel genannt sind.

### 1.5 Vorschau beim Teilen ✅

1. In `build.mjs` (Head) ergänzen: `og:title`, `og:description`, `og:url` (`https://fmnznr.github.io/search-cow/`), `og:image`, `og:locale=de_DE`, `twitter:card=summary_large_image`.
2. `icons/og.png` (1200×630): per Playwright-Skript `scripts/og-image.mjs` aus dem Startbildschirm in 1200×630 rendern, ggf. von Hand nachbearbeiten.

**Fertig, wenn:** Ein geteilter Link in Messenger oder Social Media Bild, Titel und Beschreibung zeigt.

### 1.6 itch.io-Version ✅ (Upload offen)

**Umgesetzt:** `npm run build:itch` → `dist/itch.zip`. Im fremden iframe (`EMBEDDED`) gibt es keinen Service Worker, keine Installation und keine Rechtslinks. **Offen:** Seite auf itch.io anlegen und hochladen.

itch.io bettet HTML-Spiele in einen iframe auf einer eigenen Domain ein. Service Worker und App-Installation sind dort sinnlos oder verwirrend.

**Umsetzung:**
1. `build.mjs --itch` erzeugt `dist/itch/` mit `index.html`, `fonts/`, `icons/` und daraus `dist/itch.zip`. `dist/` in `.gitignore`.
2. In dieser Variante: keine Service-Worker-Registrierung, keine Manifest-Einbindung, kein Impressum-Link (itch hat eigene Seiten; Impressum gehört dann ins itch-Profil).
3. Im Spiel: Install-Knopf und iOS-Hinweis ausblenden, wenn `window.top !== window` (gilt für jeden iframe, also auch generisch).
4. Bei itch.io anlegen:
   - Kind of project: HTML
   - Embed: „Embed in page“, Viewport 960×640, Optionen: Mobile friendly, Fullscreen button, Orientation: Default
   - Klassifikation: Game, Genre Puzzle, Tags u. a. `hidden-object`, `casual`, `cute`, `german`
   - Screenshots von 3–5 Welten (gleiches Playwright-Skript wie 1.5)
   - Sichtbarkeit zunächst „Restricted“ zum Testen, dann „Public“

**Fertig, wenn:** Das ZIP auf itch.io im Browser und auf dem Handy läuft, inkl. Ton nach dem ersten Tippen.

### 1.7 CI auf GitHub Actions ✅

Datei `.github/workflows/ci.yml`, läuft bei Push und Pull Request:
1. `node scripts/build.mjs` und `git diff --exit-code` – stellt sicher, dass `index.html` und `sw.js` zu `src/` passen.
2. Smoke-Test `scripts/smoke.mjs` (Playwright): Seite laden, Spiel starten, 3 s laufen lassen; prüfen: keine Konsolenfehler, keine Anfragen an fremde Hosts.
3. `node scripts/fairness.mjs --seeds 10`.
4. `package.json` mit `playwright` als devDependency und Skripten `build`, `test`, `fairness` anlegen.

GitHub Pages veröffentlicht weiter direkt aus dem Repo-Stamm von `master`. Sinnvoll: Branch-Schutz auf `master` mit Pflicht-Check `ci`.

### 1.8 Gerätetest und Veröffentlichung ✅ (v1.0.0)

**Checkliste (echte Geräte):**
- [ ] iPhone Safari: Ton nach erstem Tippen, Stummschalter, „Zum Home-Bildschirm“, Safe Area (Notch), Querformat
- [ ] Android Chrome, möglichst älteres Gerät: flüssig in Level 14+ mit `move`; App installieren
- [ ] Desktop: Chrome, Firefox, Safari; Tastatur (Leertaste, P, M, Esc)
- [ ] Update-Pfad: neue Version deployen, installierte App öffnen → spätestens beim zweiten Start neue Version
- [ ] Offline: Flugmodus, App startet mit Schriften
- [ ] itch.io-Einbettung auf Handy und Desktop

**Veröffentlichung:**
1. Tag `v1.0.0`, kurze `CHANGELOG.md`.
2. README um Live-Link, itch.io-Link und Screenshot ergänzen.
3. Erste Spieler: Freundeskreis, dann gezielt (z. B. r/WebGames, itch.io-Devlog). Feedback per GitHub-Issues oder E-Mail aus dem Impressum.

### Zu klären vor Phase 1
- ~~Name und Anschrift fürs Impressum~~ → eigene Adresse, trägt der Betreiber selbst ein
- itch.io-Account vorhanden?
- ~~Seed sichtbar?~~ → klein in Pause- und Endbildschirm

---

## Phase 2: Umbau und Spielmodi

**Warum zuerst:** Die Technik (Canvas 2D, Web Audio) ist nicht die Grenze; sie trägt deutlich mehr Figuren, Effekte und Modi. Die Grenze ist die Struktur: Regeln, Punkte, Ablauf, Zeichnen und Oberfläche stecken verflochten in einer Datei mit 2.400 Zeilen. Jede neue Spielidee würde dort Risiko und Aufwand vervielfachen. Deshalb: erst umbauen, ohne dass Spieler etwas merken, dann darauf die Modi bauen.

**Voraussetzung:** Phase 1 ist abgeschlossen und als `v1.0.0` getaggt. Das ist der Referenzstand, gegen den der Umbau geprüft wird.

### 2.1 Sicherheitsnetz vor dem ersten Umbau-Schritt

**Umgesetzt (Stand v1.0.0):** `npm run snapshots` mit 120 Szenen (Hash + Zusammenfassung), 8 Bildern (Pixelvergleich, Toleranz 8/255, max. 0,2 % abweichende Pixel) und 3 Spielrunden (Desktop/Maus, Handy/Touch, Zeitablauf) auf manueller Uhr (`?test&clock=manual`). Gegenprobe: andere Schafsfarbe → 38 Szenen und 3 Bilder rot; Serien-Multiplikator 0,5 → 0,6 → 2 Spielrunden rot. Playwright auf 1.56.1 festgelegt, damit lokal und CI gleich rendern. Test-Schnittstelle `testHooks()` in `src/game.html` bleibt während des Umbaus stabil. **Offen:** Branch-Schutz auf `master` (GitHub → Settings → Branches, Pflicht-Check `ci`) – nur durch den Repo-Besitzer einstellbar.

Bevor Code verschoben wird, wird das heutige Verhalten eingefroren, sodass jede Abweichung automatisch auffällt.

- **Szenen-Schnappschüsse:** Für feste Seeds × Level × Fenstergrößen die erzeugte Szene (Typ, Position gerundet, Farben, Modifikatoren) als JSON einchecken. Nach dem Umbau müssen sie identisch sein.
- **Bild-Schnappschüsse:** Ausgewählte Szenen bei Zeit 0 als PNG rendern und mit kleiner Toleranz vergleichen. Fängt Fehler beim Zeichnen.
- **Simulierte Spielrunden:** Spieluhr per Test steuerbar machen; vorgegebene Abfolge (Kuh nach 2 s, Fehlklick, Radar, Zeitablauf) durchspielen und Punkte, Zeit und Serie mit einem Schnappschuss vergleichen.
- **Arbeitsweise:** Ab hier nur noch über Branches und Pull Requests; Branch-Schutz auf `master` mit Pflicht-Check `ci`. Während des Umbaus keine neuen Funktionen.

**Fertig, wenn:** Alle drei Prüfungen in der CI laufen und eine absichtlich eingebaute kleine Änderung (z. B. andere Schafsfarbe) sie rot macht.

### 2.2 Umbau in Module (ohne sichtbare Änderung)

- **Build:** esbuild bündelt `src/**/*.js` wieder zu einer einzigen HTML-Datei. Artifact, Web-App und itch-Version bleiben so wie heute.
- **Aufteilung:**
  ```
  src/
    core/      rng, Geometrie, Zeit
    content/   entities/* (je Tierart/Figur: Daten + Zeichnen), worlds/*
    scene/     plan, generate – rein, ohne DOM und Canvas
    render/    Hintergrund, Figuren, Effekte, Lupe/Taschenlampe
    audio/     Effekte, Musik, Mischpult (getrennte Lautstärken)
    modes/     Regelwerk-Schnittstelle + Modi
    game/      Ablauf als Zustandsmaschine (Titel → Intro → Spiel → Fund → … → Ende)
    ui/        Bildschirme, HUD, Einstellungen
    store/     Einstellungen, Rekorde, Bestenliste (localStorage + Artifact-Datenbank)
  ```
- **Schritte:** zuerst die reinen Teile (`rng`, `scene`, `content`), dann `audio`, `render`, zuletzt `game` und `ui`. Nach jedem Schritt CI grün und veröffentlichbar.
- **Unit-Tests** (`node --test`) für `rng`, Szenen-Plan, Punkteberechnung und Zustandsmaschine.

**Fertig, wenn:** Alle Schnappschüsse aus 2.1 unverändert sind und keine Quelldatei länger als ca. 400 Zeilen ist.

### 2.3 Regelwerk pro Modus

Kern des Umbaus. Alles, was ein Modus anders machen kann, steckt in einem Objekt; der Spielablauf fragt nur noch das Regelwerk.

```js
// modes/endless.js – das heutige Spiel als erstes Regelwerk
export default {
  id: 'endless', name: 'Klassisch',
  timer: { start: 45, max: 99 },            // null = keine Uhr
  nextLevel(run) {},                        // Level-Plan inkl. Boss-Level
  onFound(run, { secs, misses, radar }) {}, // → Punkte, Zeitbonus, Effekte
  onMiss(run) {},                           // → Zeitstrafe, Serie zurücksetzen?
  between(run) {},                          // optionale Wahl zwischen Leveln
  isOver(run) {},
  hud: ['score', 'timer', 'cows'],
  records: 'wdk-record', leaderboard: true
};
```

- Das heutige Spiel wird zum Modus „Klassisch“ und muss die Schnappschüsse aus 2.1 bestehen.
- Neue Modi, Boss-Level und Regeln sind danach Konfiguration statt Umbau.

### 2.4 Einstellungen und Mischpult

- Getrennte Lautstärke für Musik und Effekte (vom Notizzettel), dazu Modus-Auswahl auf dem Startbildschirm.
- Einstellungen zentral in `store/settings` mit Versionsnummer, damit spätere Änderungen alte Speicherstände sauber übernehmen.

### 2.5 Chill-Modus

Erster neuer Nutzer des Regelwerks – bewusst einfach, damit er die Schnittstelle prüft.

- Keine Uhr, keine Punkte, kein Druck; endlos, ruhigere Musik.
- **Kuh-Album:** Jede gefundene Kuh-Variante (Fellmuster, Glocke, Accessoire, Welt) wird gesammelt. Fortschritt „23 von 60“ als Motivation ohne Zeitdruck.
- Kein Eintrag in die Bestenliste.

### 2.6 Challenge-Modus

Ziel: Können lohnt sich spürbar, Raten wird bestraft, gutes Spiel bringt hohe Multiplikatoren.

- **Kein Raten:** Fehlklicks werden in Folge teurer (3 s → 5 s → 8 s); erst ein Fund setzt zurück.
- **Multiplikatoren:** Serie ohne Fehlklick und Tempo multiplizieren sich stärker als heute; eine fehlerfreie, schnelle Serie ist um ein Vielfaches mehr wert als ein langsames Durchkommen.
- **Medaillen pro Level:** Gold/Silber/Bronze nach Zeit und Fehlklicks, als klares Feedback.
- **Entscheidungen zwischen Leveln** (`between`, nur nach Boss-Leveln, siehe unten): z. B. „Doppelt oder nichts“ (nächstes Level schwerer, Multiplikator ×2), Radar gegen Zeit tauschen, einen Modifikator abwählen gegen weniger Punkte.
- **Boss-Level alle 5 Level** (vom Notizzettel), z. B.:
  - *Kuhbande:* drei Kühe nacheinander in derselben Szene
  - *Ausreißerin:* die Kuh flieht nach jedem Fehlklick an eine neue Stelle
  - *Steckbrief:* lauter Doppelgänger, nur eine passt zur Beschreibung (Glocke, Fleck, Accessoire)
- Bestenliste nur für diesen Modus (und Klassisch).
- **Entschieden: beides, verzahnt in einem Rhythmus.** 4 normale Level → Boss-Level → Belohnung. Entscheidungen gibt es nicht nach jedem Level, sondern als Beute nach einem besiegten Boss:
  1. **Medaillen** zuerst: klares Feedback pro Level, kleinster Schritt, nötig für alles Weitere.
  2. **Boss-Level** alle 5 Level: Höhepunkt mit eigener Regel.
  3. **Glocken-Wahl** nach dem Boss: drei Karten, eine davon nehmen (z. B. „Doppelt oder nichts“, „+1 Radar“, „Nacht abwählen“, „Fehlklick-Schutz für ein Level“). Je mehr Gold-Medaillen im Abschnitt, desto bessere Karten.
  Warum so: Die Spannung im Level bleibt der Kern, die Entscheidungen bleiben selten und bedeutsam, und gutes Spielen wird doppelt belohnt (Punkte und bessere Karten).

### 2.7 Balancing mit Werkzeug

- Simulierte Runden aus 2.1 mit „Bot-Spielern“ unterschiedlicher Stärke (Trefferquote, Suchzeit) laufen lassen und Punkteverteilung pro Modus auswerten.
- Ziel: Ein starker Spieler soll deutlich mehr Punkte holen als ein mittlerer, und kein Modus darf durch Dauerklicken schlagbar sein.

### Go/No-go für Phase 3
Phase 3 erst, wenn Klassisch, Chill und Challenge stabil laufen, die Schnappschuss- und Fairness-Tests grün sind und Testspieler die Modi als klar unterschiedlich erleben.

---

## Phase 3: Kuh des Tages (Grobplan)

Baut auf dem Regelwerk aus Phase 2 auf: Die Kuh des Tages ist ein weiterer Modus.

### 3.1 Gleiche Szene auf allen Geräten
Größtes technisches Thema: Heute hängt die Szene von der Fenstergröße ab.
- **Empfehlung:** Tagesszene in fester virtueller Fläche erzeugen, je eine für Hoch- und Querformat (z. B. 400×800 und 1280×720), und aufs Fenster skalieren, Ränder mit Hintergrund füllen.
- Hoch- und Querformat sind dann zwei Layouts derselben Tageskuh; die Bestenliste trennt sie nicht, die Schwierigkeit muss aber vergleichbar sein (Fairness-Test aus 1.2 auf beide anwenden).

### 3.2 Tagesmodus
- Seed = Hash aus Datum; Tageswechsel um 00:00 Europe/Berlin (oder UTC – entscheiden).
- Schwierigkeit nach Wochentag (Mo leicht → So schwer).
- Ein gewerteter Versuch pro Tag, danach Übungsmodus. Ergebnis: Zeit, Fehlklicks, Radar ja/nein.
- Teilen: `navigator.share`, sonst Zwischenablage. Text z. B. „Wo ist die Kuh? #127 🐄 3,2 s · ❌❌ · wo-ist-die-kuh.de“.
- Lokale Statistik: Serie, Verteilung der Zeiten, Countdown bis zur nächsten Kuh.

### 3.3 Englisch
- Alle Texte in ein `STR`-Objekt pro Sprache; Sprache aus `navigator.language`, umschaltbar.
- Witze und Ränge übertragen statt übersetzen (Wortspiele neu schreiben).
- Titel: „Where's the Cow?“; eigene `og`-Tags pro Sprache.

### 3.4 Eigene Domain (optional)
- Kurze Domain für den Teilen-Text; GitHub Pages mit Custom Domain und HTTPS.
- Impressum/Datenschutz anpassen.

### 3.5 Messen (optional)
- Ohne Messung ist die Go/No-go-Entscheidung für Phase 4 Bauchgefühl. Wenn überhaupt: cookielos und datensparsam (z. B. Plausible oder selbst gehostetes Umami), Datenschutz ergänzen.

### Go/No-go für Phase 4
Phase 4 nur, wenn nach ca. 4 Wochen Tagesmodus zum Beispiel ≥ 100 tägliche Spieler oder spürbares Teilen ohne eigenes Zutun. Sonst bei Phase 3 bleiben – das Spiel ist dann trotzdem rund.

---

## Phase 4: Community (Grobplan)

### 4.1 Backend
- Cloudflare Workers + D1 (kostenloser Plan reicht lange). Alternative: Supabase.
- Endpunkte: `POST /score`, `GET /board/day/:date`, `GET /board/alltime`, getrennt nach Modus.
- Identität: zufällige Geräte-ID im `localStorage` plus Spitzname; kein Login.
- Rate-Limit pro IP und Geräte-ID.
- Das claude.ai-Artifact behält seine eigene Bestenliste über `window.claude`; die Web-App nutzt das Backend.

### 4.2 Schummeln eindämmen
- Der Server kennt den Tages-Seed und kann mit dem reinen `scene`-Modul aus 2.2 die Szene nachrechnen: Lag der gemeldete Klick (Position + Zeitpunkt) in der Kuh-Box?
- Plausibilität: Mindestzeit, maximale Punkte pro Kuh je Modus.
- Restliches Schummeln akzeptieren; Ausreißer manuell löschen können.

### 4.3 Spitznamen
- Sperrliste (de/en), Länge und Zeichen begrenzen, „Melden“-Knopf, einfache Admin-Ansicht zum Löschen.

### 4.4 Datenschutz
- Neu: Server verarbeitet IP und Geräte-ID (pseudonym), Speicherdauer festlegen, Cloudflare als Auftragsverarbeiter nennen, Löschmöglichkeit anbieten.

### 4.5 Spieleportale
- CrazyGames (Einstieg über „Basic Launch“, Ausbau abhängig von Kennzahlen), alternativ GameDistribution; Poki ist sehr selektiv.
- Voraussetzungen: Englisch, Portal-SDK (Lade-Events, Werbepausen), oft keine externen Links, teils Exklusivität.
- Eigenes Build-Ziel `--portal`; Werbung nur dort, nicht in der eigenen Web-App.
- Erwartung: Einnahmen eher klein; Hauptnutzen ist Reichweite.

### 4.6 Betrieb
- Fehler-Logging minimal (Worker-Logs), Backup der D1-Datenbank, Kostenalarm.

---

## Notizzettel: Ideen für später

- ~~Lautstärke getrennt einstellen~~ → Phase 2.4
- ~~Boss-Level~~ → Phase 2.6
