# Orbital Passage — spielbares Level 8

Ein lineares Rennen durch das Innere einer Raumstation, auf etwa **1:45 Minuten
mit eingesammelten Turbos** ausgelegt. Die Strecke umfasst 3080 Segmente und
200 zusätzliche Auslaufsegmente. Sie nutzt die fünf bestehenden Gegner,
gemeinsame Fahrzeugphysik, Turbo-Ladungen, Zeitnahme und das Scoreboard.

## Durchgehende Szenenfolge

1. **Arrival Dock:** abgestellter Frachttransporter, Container, Ladetechnik
   und kleine Technikergruppen. Ein Frachter ist bereits beim Countdown im
   Anflug, sinkt während der ersten 5,2 Rennsekunden auf eine markierte
   Landefläche und bleibt dort stehen. Ein Ladekran rahmt den Liegeplatz.
2. **Service Spine:** enger Wartungsgang mit Wandkonsolen, Türen, Leitungen
   und zwei verglasten Robotik-Arbeitsbuchten; warme bernsteinfarbene Beleuchtung.
3. **Earth Observation:** Glasbrücke mit Blick auf Erde, Sterne, Satelliten
   und eine große Antenne. Ein Astronaut arbeitet mit Sicherungsleine außerhalb
   der Verglasung. Die Fahrbahn windet sich durch die Außenverbindung.
4. **Active Launch Deck:** große Halle mit Fracht und Robotik. Ein Shuttle
   startet seitlich durch ein sich öffnendes Hangartor, mit lokalem Abgaslicht.
5. **Helios Reactor:** hohe Galerie mit zwei Reaktorkernen, langsamen
   Leuchtringen, Rohrgruppen und Wartungspersonal.
6. **Panorama Terminal:** Beobachtungskonsolen, kleine Biosphärenbeete,
   Techniker und ein nach links fliegender Transporter über dem Glasdach.
   Der Zielanlauf ist gerade.

Die Fahrbahn wird als zusammenhängendes Band durch **jeden** projizierten
Streckenpunkt gezeichnet, vollständig vor Fahrzeugen und Sammelobjekten.
Die frühere Bündelung des Bodens in Vierergruppen überschrieb Teile von
Autos und Turboblitzen in den mittleren Segmenten. Sie approximierte außerdem
deren Kurvenposition. Der neue Boden behält die volle Auflösung und erzeugt
mit wenigen zusammenhängenden Pfaden deutlich weniger Zeichenaufrufe.

Wände und Decke teilen dieselben Projektionspunkte. Die ersten 24 sichtbaren
Segmente verwenden volle Auflösung, danach werden ausschließlich die
Hüllenflächen in Vierer- beziehungsweise Achtergruppen gezeichnet. Die
Sichtweite beträgt 220 Segmente; Stationsobjekte blenden über die letzten
75 Segmente ein. Das Shuttle ist dadurch bereits vor seinem Start sichtbar.
Die Annäherung löst den Start jetzt bei Segment 1600 aus, statt unmittelbar
beim früheren Eintritt in die Sichtweite. Das Schiff bleibt Teil der Szene;
sein Abflug beendet sich durch die Bewegung aus dem Sichtfeld.

Hangartor, Shuttle, Landefrachter, Transporter und Außeneinsatz folgen der
Rennzeit und frieren beim Pausieren ein. Der Frachter startet beim Neustart
wieder im Anflug. Der Kurvenverlauf, das gemeinsame Fahrzeug- und
Kollisionsmodell, die Kamera und die geplante Fahrzeit bleiben erhalten.
Der erste Kurvenabschnitt wird weiterhin kontinuierlich über Segmentgrenzen
integriert, ebenso die Kollisionsposition des Spielerwagens.

Dock und Panoramahalle setzen rosa/violette Akzente; der Wartungsgang bleibt
bernsteinfarben, die Glasbrücke cyan und die Reaktorgalerie türkis. Energie-
leitungen bleiben außerhalb der Fahrspuren, Reaktorlicht bleibt lokal am Kern.
Die Außenmodule sind detaillierte, einmal erzeugte Grafiken mit Solarflügeln,
Verbindungen und beleuchteten Fenstern. Die neue Landung, der Abflug und die
Durchfahrt durch die verglaste Panoramahalle bilden erkennbare Höhepunkte.

## Prüfung

```sh
npm run build -- --base=/Dash-Racer/
BROWSER_PATH=/usr/bin/chromium BASE_URL=http://127.0.0.1:3007/Dash-Racer/ \
  node scripts/assess-game.cjs orbital
BROWSER_PATH=/usr/bin/chromium BASE_URL=http://127.0.0.1:3007/Dash-Racer/ \
  node scripts/assess-game.cjs orbital-visuals
BROWSER_PATH=/usr/bin/chromium BASE_URL=http://127.0.0.1:3007/Dash-Racer/ \
  node scripts/assess-game.cjs paradise
node scripts/assessment-level-loading.cjs
# Separat ausführen, ohne andere Browserjobs:
node scripts/profile-orbital.cjs
```

Playwright wird wie in den bestehenden Browserprüfungen separat benötigt.
`ASSESSMENT_DIR` legt das Ausgabeverzeichnis für JSON und Prüfbilder fest.

Der Mechaniklauf prüft echte Beschleunigung, Lenkung, eingesammelte
Ladungen und Zieleinläufe sowie Wandkontakt, Neustart, Scoreboard/Continue
und kontinuierliche Gegnerprojektion. Die saubere Fahrt bleibt bei
**109,18 s ohne Turbo** und **105,22 s mit eingesammelten Ladungen**.
Mit Gegnerkontakt variiert die Fahrzeit. Alle Gegnerzeiten entstehen aus
wirklichen Zieleinläufen im gemeinsamen Modell.

Die zusätzliche Prüfung `orbital-visuals` vergleicht die bemalten Fahrzeug-
und Blitzflächen an acht Stellen mit einer vollständig sichtbaren Referenz.
Die Referenz erhält dieselbe abschließende Vignette wie das Spielbild.
Die alte Version `731a9f5` dient als Gegenprobe:

```sh
ORBITAL_SOURCE_REF=731a9f5 node scripts/assess-game.cjs orbital-visuals
```

Für die Schiffe werden vollständige Bilder mit und ohne das jeweilige Objekt
**nach** dem Zeichnen der Wände, Decken und Rahmen verglichen. Die Prüfung
verwendet echte Fahrten mit und ohne eingesammelte Turbos. Sie verlangt einen
sichtbaren, kleinen Anfang des Shuttle-Bildes vor dem Start, sichtbaren
Sinkflug und Bodenkontakt des Frachters sowie einen sichtbaren Transporter
über dem Glasdach und den Außeneinsatz. Begrenzungsrahmen allein reichen
hier nicht als Nachweis. Prüfbilder werden zusätzlich visuell kontrolliert.

Der Ladeskript prüft sowohl die unbearbeiteten Repository-Dateien als auch
den Produktionsbuild, jeweils mit Live-Animation und echten Menüwechseln
zwischen allen acht Leveln. Die Stationsfunktionen liegen vollständig inline;
es gibt keine zusätzliche JavaScript-Datei, die beim einfachen Pages-Hosting
fehlen könnte. Der Paradise-Lauf deckt zusätzlich den bestehenden Rundkurs
und die Rundenzahl aller acht Strecken ab.

Die Stationsgrafiken verwenden **20** einmal erzeugte Canvas-Kacheln mit
insgesamt etwa **3,81 MiB** RGBA-Speicher. Die Grafiken werden beim normalen
Rendern nicht neu gezeichnet. Das sind automatisierte Chromium-Prüfungen;
die zusätzliche Render-Messung ist keine zugesicherte Geräte-Bildrate.

Die Belege des ersten Entwurfs bleiben unter `evidence/orbital-*.json`
erhalten. Die aktuelle Korrektur dokumentieren:

- [Sichtbare Fahrzeuge und Schiffe](evidence/orbital-v2-visuals.json)
- [Gegenprobe der alten Version](evidence/orbital-v1-visual-regression.json)
- [Vollständige Rennen und Mechanik](evidence/orbital-v2-mechanics.json)
- [Start aller acht Level](evidence/orbital-v2-loading.json)
- [Renderkosten](evidence/orbital-v2-render-profile.json)

Der Korrekturlauf besteht 38 Mechanikprüfungen, 19 Bildprüfungen und 18
Lade-/Menüabläufe. In den acht Fahrzeug-/Blitz-Ansichten bleiben sämtliche
geprüften Farbflächen der vollständig sichtbaren Referenz erhalten. Im alten
Stand scheitern vier dieser acht Ansichten; zusätzlich zeigen beide alten
Shuttle-Fahrten den großen Ersteinstieg erst nach dem Startsignal. Die neue
Version zeigt vor dem Start über drei Sekunden lang das stehende Shuttle.

Die isolierte Messung mit erzwungenem Canvas-Readback liegt je Bereich bei
6,7–9,1 ms Median und 9,3–12,2 ms im 95. Perzentil. Bei zweifacher
CPU-Drosselung liegen die Mediane bei 17,9–23,7 ms. Ausreißer bleiben im
Rohprotokoll erhalten; diese Cloud-Messung garantiert keine Telefon-Bildrate.
