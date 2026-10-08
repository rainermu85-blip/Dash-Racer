# Bestandsaufnahme und nächster Entwicklungsschritt

Stand: 8. Oktober 2026. Untersucht wurde der importierte Spielcode von
`af1c28b7951d1b6f9d46526a27ad40ce3147cc85`.

## Einschätzung und Umfang

Der Spielkern funktioniert: Alle vier Strecken lassen sich vollständig bis
zur Ergebnisanzeige fahren. Das größte Risiko für neue Funktionen liegt in
überlappenden Zuständen und gemeinsam genutzten Menüelementen. Zuerst diese
Abläufe stabilisieren, bevor neue Mechaniken oder größere Umbauten beginnen.

Diese Arbeit ergänzt Dokumentation und Browser-Prüfskripte und korrigiert die
README. Spielcode, Assets, Abhängigkeiten und Lockdatei bleiben unverändert.
Die untenstehenden Probleme sind noch nicht behoben.

Nachtrag vom 8. Oktober: Der anschließend gemeldete Weltwechsel nach dem Ziel
von Level 3 ist korrigiert. Welt, Straßenumgebung, Portale und Wetter verwenden
jetzt die durchgehende Streckenposition. Der Auslauf und die Ergebnisanzeige
bleiben in der Unterwasserwelt. Zwei neue Regressionprüfungen scheitern am
Importstand und bestehen mit der Korrektur; der aktuelle Mechaniklauf besteht
15/15 Prüfungen. Der normale Browser-Zieleinlauf wurde zusätzlich visuell
geprüft. Die historischen Messdaten unten beziehen sich weiterhin auf den
ursprünglichen Stand; die beiden Menüfehler sind davon unabhängig.

Weiterer Nachtrag vom 8. Oktober: Das Kollisionsmodell prüft jetzt den gesamten
zurückgelegten Weg, einschließlich seitlicher Bewegungen, in Rechenschritten
von höchstens 1/120 Sekunde. Blitze, Energiekugeln und Baustellen werden damit
auch bei maximalem Chevron-Turbo und 30 FPS erfasst. Die Glastunnelwände in
Level 3 begrenzen weiterhin nur den Unterwasserabschnitt und seinen Auslauf.

Wandkontakt verursacht einen einmaligen, nach seitlicher Annäherung abgestuften
Stoß und anschließend Reibung pro Sekunde. Streifer kosten weniger Tempo als
harte Auffahrunfälle; Fahrzeugkontakte berücksichtigen die tatsächliche
Annäherung statt Tastendruck oder sichtbarer Neigung. Auffahren überträgt
Geschwindigkeit zwischen den Fahrzeugen. Eine kurze Schutzzeit und die
Freigabe erst nach Trennung verhindern wiederholte Aufprallstrafen beim
gleichen Kontakt. Fahrzeugpositionen werden getrennt, auch neben den Glaswänden.
Baustellen bremsen stark und beenden Boosts, ohne Rückwärtsfahrt auszulösen.

Der aktuelle kurze Browserlauf besteht 20 Mechanik- und 29 zusätzliche
Kollisionsprüfungen. Diese vergleichen unter anderem 30/60/120 FPS, schnelle
Pickups, Streifer/Auffahren, anhaltenden Kontakt, erneuten Kontakt nach Trennung,
Glaswände, Rundengrenzen und Zieleinlauf. Die historischen Messdaten und die
unabhängigen Menü- und Bedienungsprobleme unten bleiben als Ausgangspunkt erhalten.
Zusätzlich liefen alle vier Rennen mit dem neuen Modell vollständig bis zur
Ergebnisanzeige, ohne JavaScript-Fehler. Wandkontakt wurde links und rechts
bei 390 und 480 Pixel Breite visuell geprüft; der Produktionsbuild besteht.

## Prüfungen und Grenzen

Umgebung: Node.js 24.19.0, npm 11.9.0, Vite 6.4.3, Playwright 1.62.1 und
headless Chromium 151.0.7922.173 auf Linux. Lange Rennen verwendeten
480 × 800 Pixel; die Ablaufprüfungen emulierten Touch bei 390 × 844.

| Prüfung | Ergebnis |
| --- | --- |
| Installation, Build, HTML und Bild per HTTP | Erfolgreich |
| Vier vollständige Rennen | Alle beendet, positive Rundenzeiten, Ergebnisanzeige, keine JavaScript-Abstürze |
| 13 Mechanikprüfungen | Bestanden: Beschleunigung, Boost, Ladungsgrenze, Energie, Turbo, Hindernisse, Offroad, Rundenwechsel, Level-3-Zonen und Distanz-Rangfolge |
| Pause/Fortsetzen | Position und Rundenzeit stehen während Pause |
| Ergebnis → Level 3/4 wechseln → Neustart | Strecke, Runden, Energie und Zeiten korrekt initialisiert |
| Zieleinlauf → Pause → Exit | Fehler: alter Timer öffnet Ergebnis erneut |
| Ergebnis → Race Again → Pause → Exit | Fehler: alte Ergebnisse statt Hauptmenü |
| Fokusverlust | Eingaben werden gelöst, Rennen läuft weiter; UX-Verbesserung vorgeschlagen |
| Mobile Pause | Keine sichtbare Schaltfläche; Bedienungslücke |
| Google Fonts | Proxyzugriff scheitert; Spiel läuft mit Ersatzschrift weiter |
| `npm audit` | Ein hoher Befund in `source-map-js@1.2.1`, einer Entwicklungsabhängigkeit |

Die vollständigen Läufe steuern per Tastaturereignissen automatisch zur
Mitte. Sie verändern weder Geschwindigkeit, Distanz noch Rundenstand und
nutzen den echten Browser-Frame-Takt. Sie sammeln Boosts nicht gezielt.
Die ersten Messwerte sind deshalb **keine Bewertung der Spielbalance**:

| Level | Rundenzeiten in Sekunden | Platz |
| --- | --- | --- |
| Neon City | 55,85 / 50,42 / 51,33 | 4 |
| Coastal Highway | 57,52 / 51,34 / 54,72 | 4 |
| Arctic Tunnel | 136,28 | 5 |
| Space Wave | 67,28 / 63,75 / 62,64 | 6 |

Mechanikprüfungen setzen kontrollierte Spielstände und führen Frames manuell
mit 60 Hz aus. Die kurzen Zieleinlaufprüfungen springen bewusst an die Ziellinie.
Sie ersetzen die vollständigen Rennen nicht. Das synthetische `blur`-Ereignis
prüft den Handler, nicht die Hintergrund-Drosselung eines mobilen Betriebssystems.

Nicht geprüft: Safari/Firefox, echte Telefone und Mehrfinger-Gesten,
leistungsarme Geräte, statistische Gegner-Fairness und präzise Übereinstimmung
aller visuellen Kontaktpunkte. Keine FPS- oder Akku-Zusage aus Headless-Läufen
ableiten. Es gibt aktuell keine Bestzeiten- oder Spielstandspeicherung.

Die [Messdaten](evidence/baseline-2026-10-08.json) erhalten den ersten Lauf.
Die gespeicherten Skripte wurden anschließend erneut ausgeführt: `races`
4/4 und `mechanics` 13/13 bestanden; `edges` 2/6 bestanden, mit denselben
zwei Fehlern und zwei offenen UX-Anforderungen. Rennzeiten und Platzierungen
dürfen wegen Zufall und Echtzeitsteuerung bei Wiederholungen variieren.

## Priorisierte Aufgaben

### P1 — Menü und Rennende stabilisieren

**B01: Ausstieg nach erneutem Rennen zeigt alte Ergebnisse.**
Reproduktion: Rennen beenden → `RACE AGAIN` → Escape → `EXIT RACE`.
`showResult` ersetzt das Overlay, `showMainMenu` baut es nicht zurück.
Erwartung: Levelmenü mit Startknopf, keine alten Rennwerte.
Prüfung: `finish-restart-exit-main-menu`.

**B02: Alter Zieleinlauf-Timer greift in späteren Ablauf ein.**
Reproduktion: unmittelbar nach der Ziellinie Escape → `EXIT RACE`, bevor
die Ergebnisanzeige erscheint. Der 1,5-Sekunden-Timer öffnet trotzdem das
Ergebnis. Ursache: unverwaltetes `setTimeout(() => showResult(finalPlace), 1500)`.
Erwartung: Ein verlassener Lauf darf Menü oder neuen Lauf nicht beeinflussen.
Timer beim Ausstieg/Neustart abbrechen oder an eine Renn-ID binden.
Prüfung: `finish-exit-pending-timer`; ergänzend Neustart und Pause während
der Zielverzögerung absichern.

Beides in einer kleinen Änderung mit explizitem Menüaufbau und kontrolliertem
Rennende beheben. Kein umfassendes State-Machine-Framework erforderlich.

### P2 — Bedienung und Entwicklungsbasis

**U01: Mobile Pause und Steuerung erklären.** Pauseknopf ergänzen und vor dem
Rennen knapp automatische Beschleunigung, Lenken und Boost/Energie erklären.
Escape weiterhin unterstützen.

**U02: Fokusverlust bewusst behandeln.** Vorgeschlagene Regel: aktive Rennen
bei Fokusverlust/unsichtbarem Dokument pausieren; explizit fortsetzen lassen.
Das ist eine neue UX-Regel, kein Nachweis eines falsch implementierten
Blur-Handlers. Auf echten Geräten separat prüfen.

**D01: Veraltete Vorlagen entfernen.** README ist bereits korrigiert.
Gemini/APP_URL in `.env.example` und die Gemini-Capability in `metadata.json`
werden vom Spiel nicht verwendet. Vor Entfernung klären, ob AI Studio als
Zielplattform erhalten werden soll. Keine API nur wegen alter Metadaten anbinden.

**D02: Entwicklungsabhängigkeit aktualisieren.** Der Audit-Befund
[GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)
betrifft `source-map-js` vor 1.2.2 über PostCSS. Gezielt Lockdatei aktualisieren,
danach Build und Browserprüfungen wiederholen. Ein ausnutzbarer Fehler des
laufenden Spiels wurde damit nicht nachgewiesen. Kein pauschales
`npm audit fix --force`.

**D03: Prüfwerkzeuge regulär aufnehmen.** Node-Version festlegen, Playwright
sauber als Entwicklungswerkzeug deklarieren und CI für die kurzen Prüfungen
einrichten. Bekannte Fehler nicht als erfolgreiche Tests kaschieren. Lange
Rennen benötigen mehrere Minuten und müssen nicht in jeden kurzen Check.

### P3 — Schrittweise aufteilen

Zuerst Eingaben, Menü und Rennzustand, danach Leveldaten und Simulation,
zuletzt Grafikbereiche. Je Änderung nur eine Grenze verschieben. Gemeinsamer
Zufall, Zustandsänderungen in `render`, gemischte Zeitmodelle und uneinheitliche
Gegner-Koordinaten sind konkrete Stellen zur Entkopplung, keine Begründung
für einen Komplettneubau. Details: [Architektur](architecture.md).

Akzeptanz für die erste Stabilisierung: B01/B02 bestehen, Pause/Levelwechsel
und die 13 Mechanikprüfungen bleiben erfolgreich, alle vier Rennen lassen sich
weiter beenden. Optik und Fahrparameter dabei nicht gleichzeitig neu abstimmen.

## Prüfungen wiederholen

Zusätzlich zum Entwicklungsserver benötigt man Playwright und Chromium.
Diese Prüfwerkzeuge sind noch keine Projektabhängigkeiten; in der Cloud
sind sie vorhanden. Optional außerhalb des Checkouts installieren:

```sh
npm install --prefix /tmp/dash-racer-browser-tools --no-save playwright@1.62.1
```

Vorhandenen Chromium über `BROWSER_PATH` angeben. Alternativ den
Playwright-Browser installieren und anschließend `BROWSER_PATH` weglassen:

```sh
/tmp/dash-racer-browser-tools/node_modules/.bin/playwright install chromium
```

Aus dem Repository in einem separaten Terminal:

```sh
npm ci
npm run dev -- --strictPort
```

Danach aus dem Repository; bei vorhandenem Playwright ist `NODE_PATH` unnötig:

```sh
NODE_PATH=/tmp/dash-racer-browser-tools/node_modules BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs mechanics
NODE_PATH=/tmp/dash-racer-browser-tools/node_modules BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs collisions
NODE_PATH=/tmp/dash-racer-browser-tools/node_modules BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs edges
NODE_PATH=/tmp/dash-racer-browser-tools/node_modules BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs races
```

`BASE_URL` erlaubt einen anderen lokalen Server. `ASSESSMENT_DIR` bestimmt
den Ausgabeordner; ohne Angabe entsteht ein neuer temporärer Ordner.
Berichte und Ergebnisbilder liegen damit standardmäßig außerhalb des Checkouts.
Exitcode 1 bedeutet mindestens eine fehlgeschlagene Prüfung. Im Ausgangsstand
hat `edges` zwei bestätigte Fehler und zwei nicht erfüllte vorgeschlagene
UX-Anforderungen; dieser rote Lauf ist zu erwarten und wird nicht übersprungen.
