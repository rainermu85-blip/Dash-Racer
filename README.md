# Dash Racer

Ein Arcade-Rennspiel im Retro-Neonstil mit vier Strecken, fünf Gegnern und
Boosts. Es läuft vollständig im Browser mit Canvas 2D. Vite dient zum
Entwickeln und Erstellen der statischen Ausgabe. Es gibt aktuell keinen
Anwendungsserver und keine Gemini-Integration.

## Lokal starten

Node.js und npm werden benötigt. Der Ausgangsstand wurde mit Node.js 24.19.0
und npm 11.9.0 geprüft; eine verbindliche Node-Version ist noch nicht festgelegt.

```sh
npm ci
npm run dev -- --strictPort
```

Der Entwicklungsserver verwendet Port 3000. Statische Ausgabe erstellen und prüfen:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Keine API-Schlüssel oder `.env.local` sind für das aktuelle Spiel nötig. Die
Schriftart wird von Google Fonts geladen; ohne Zugriff erscheint eine
Ersatzschrift. `DISABLE_HMR=true` schaltet HMR und Dateibeobachtung aus.

## Steuerung

| Aktion | Tastatur | Touch / Maus |
| --- | --- | --- |
| Lenken | Pfeile links/rechts oder A/D | Pfeilflächen unten halten |
| Boost | Leertaste, Pfeil hoch oder W | Boost-Anzeige rechts antippen |
| Pause | Escape | Noch keine Pause-Schaltfläche vorhanden |

Das Auto beschleunigt automatisch. Blitze geben Boost-Ladungen, maximal drei.
Im Space-Level geben fünf Energiekugeln eine Ladung; Pfeilfelder auf der Strecke
lösen einen zusätzlichen Turbo aus.

## Im Browser über GitHub Pages spielen

Der Workflow `.github/workflows/pages.yml` baut das Spiel bei jedem Push auf
`main` und veröffentlicht ausschließlich die statische Ausgabe aus `dist`.
Er verwendet den von GitHub Pages gemeldeten Basis-Pfad. Zusätzliche
API-Schlüssel oder Deployment-Secrets sind dafür nicht nötig.

Einmalig im Repository **Settings → Pages → Build and deployment → Source**
auf **GitHub Actions** stellen. Falls der erste Lauf vorher fehlgeschlagen ist,
unter **Actions → Deploy game to GitHub Pages → Run workflow** erneut starten.
Die bestätigte Spieladresse erscheint nach erfolgreicher Veröffentlichung in
den Pages-Einstellungen und im Deployment des Workflows.

## Ausgangspunkt für die Weiterentwicklung

- [Architektur und Spielregeln](docs/architecture.md)
- [Bestandsaufnahme, Prüfungen und priorisierte Aufgaben](docs/assessment.md)
- [Messdaten des Ausgangsstands](docs/evidence/baseline-2026-10-08.json)

Die Bestandsaufnahme verändert das Spielverhalten nicht. Bekannte Probleme
bleiben sichtbar, damit die Stabilisierung gezielt und überprüfbar erfolgt.
Es gibt noch keinen CI-Testlauf. Die Browser-Prüfskripte und ihre zusätzlichen
Voraussetzungen sind in der Bestandsaufnahme beschrieben.
