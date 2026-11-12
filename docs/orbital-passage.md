# Orbital Passage — spielbares Level 8

Ein lineares Rennen durch das Innere einer Raumstation, auf etwa **1:45 Minuten
mit eingesammelten Turbos** ausgelegt. Die Strecke umfasst 3080 Segmente und
200 zusätzliche Auslaufsegmente. Sie nutzt die fünf bestehenden Gegner,
gemeinsame Fahrzeugphysik, Turbo-Ladungen, Zeitnahme und das Scoreboard.

## Durchgehende Szenenfolge

1. **Arrival Dock:** abgestellter Frachttransporter, Container, Ladetechnik
   und kleine Technikergruppen. Ein gerader Auftakt lässt das Dock früh erkennen.
2. **Service Spine:** enger Wartungsgang mit Wandkonsolen, Türen, Leitungen
   und zwei verglasten Robotik-Arbeitsbuchten; warme bernsteinfarbene Beleuchtung.
3. **Earth Observation:** Glasbrücke mit Blick auf Erde, Sterne, Satelliten
   und eine große Antenne. Die Fahrbahn windet sich durch die Außenverbindung.
4. **Active Launch Deck:** große Halle mit Fracht und Robotik. Ein Shuttle
   startet seitlich durch ein sich öffnendes Hangartor, mit lokalem Abgaslicht.
5. **Helios Reactor:** hohe Galerie mit zwei Reaktorkernen, langsamen
   Leuchtringen, Rohrgruppen und Wartungspersonal.
6. **Panorama Terminal:** Beobachtungskonsolen, kleine Biosphärenbeete,
   Techniker und ein nach links fliegender Transporter. Der Zielanlauf ist gerade.

Die Wand- und Deckenelemente verwenden dieselben Projektionspunkte wie die
Fahrbahn. Vier benachbarte Segmente werden als eine zusammenhängende
Hüllenfläche gezeichnet, mit festen Gruppengrenzen in der Welt. Gegner und
Kollisionen behalten ihre volle Auflösung; die Zeichenhelfer für die Hülle
erzeugen keine temporären Punktarrays. Der erste Kurvenabschnitt wird kontinuierlich über Segmentgrenzen
integriert, ebenso die Kollisionsposition des Spielerwagens. Straßenkontakt
begrenzt alle Fahrzeuge an den seitlichen Leitplanken beziehungsweise am Glas.
Die statischen Objekt-Silhouetten bleiben mit ihrer ganzen Breite außerhalb
der Rennspuren; die Bereichsschilder hängen an der Decke.

Hangartor, Shuttle und Transporter werden durch die Annäherung des Spielers
gestartet und folgen der Rennzeit. Pausieren oder wiederholtes Rendern bewegt
sie nicht weiter; ein Neustart setzt die Ereignisse zurück. Der Außenraum
verwendet das vorhandene Kurven-Parallaxmodell. Die bestehende Kamera bleibt
unverändert. Das Ziel ist eine Bodenmarkierung, ohne Tor oder Last-Lap-Hinweis.

## Prüfung

```sh
npm run build -- --base=/Dash-Racer/
BROWSER_PATH=/usr/bin/chromium BASE_URL=http://127.0.0.1:3007/Dash-Racer/ \
  node scripts/assess-game.cjs orbital
BROWSER_PATH=/usr/bin/chromium BASE_URL=http://127.0.0.1:3007/Dash-Racer/ \
  node scripts/assess-game.cjs paradise
node scripts/assessment-level-loading.cjs
# Separat ausführen, ohne andere Browserjobs:
node scripts/profile-orbital.cjs
```

Playwright wird wie in den bestehenden Browserprüfungen separat benötigt.
`ASSESSMENT_DIR` legt das Ausgabeverzeichnis für JSON und Prüfbilder fest.

Der neue Lauf prüft echte Beschleunigung, Lenkung, eingesammelte Ladungen und
Zieleinläufe, außerdem Shuttle-Sichtbarkeit mit und ohne Turbo, Wandkontakt
für beide Fahrertypen, Neustart, Scoreboard/Continue und kontinuierliche
Gegnerprojektion. Für jeden Bereich werden vollständige Bilder mit und ohne
Stationsobjekte verglichen, um durch Wände verdeckte Szenen zu erkennen.

Gemessene saubere Fahrten ohne Gegner: **109,18 s ohne Turbo**, **105,22 s mit
neun während der Fahrt eingesammelten Ladungen**. Mit Gegnerkontakt variiert
die Fahrzeit. Die Feldprüfung fährt alle sechs Wagen bis zu tatsächlichen
Zieleinläufen; Zeiten werden nicht erfunden.

Der Ladeskript prüft sowohl die unbearbeiteten Repository-Dateien als auch
den Produktionsbuild, jeweils mit Live-Animation und echten Menüwechseln
zwischen allen acht Leveln. Die Stationsfunktionen liegen vollständig inline;
es gibt keine zusätzliche JavaScript-Datei, die beim einfachen Pages-Hosting
fehlen könnte. Der Paradise-Lauf deckt zusätzlich den bestehenden Rundkurs
und die Rundenzahl aller acht Strecken ab.

Die Stationsgrafiken verwenden 17 einmal erzeugte Canvas-Kacheln mit insgesamt
etwa **2,90 MiB** RGBA-Speicher. Im normalen Rendern werden sie nicht neu
gezeichnet. Messwerte und Prüfungsergebnisse:
[Stationsprüfung](evidence/orbital-mechanics.json),
[Paradise-Regressionsprüfung](evidence/orbital-paradise-regression.json),
[Ladeprüfung](evidence/orbital-level-loading.json) und
[Renderprofil](evidence/orbital-render-profile.json). Das sind automatisierte Chromium-Prüfungen;
Geräte-FPS in Brave sind damit nicht zugesichert.

Die separate Render-Messung mit erzwungenem Canvas-Readback lag nach dem
Zusammenfassen der Hüllenflächen bei 7,4–8,5 ms Median je Bereich. Bei
zweifacher CPU-Drosselung waren es 18,5–22,0 ms. Einzelne erhebliche Ausreißer
sind im Rohprotokoll erhalten; die Messung beschreibt keine zugesicherte
Bildrate auf einem Telefon. Die Optimierung senkt die Zahl der Hüllenpanels
auf etwa ein Viertel, ohne Inhalte oder Simulationsauflösung zu streichen.

Der abschließende Lauf besteht 38 Stationsprüfungen, 59 Paradise-Prüfungen
und 18 Lade-/Menüabläufe für beide Hosting-Varianten, ohne JavaScript-Fehler
oder fehlende Dateien. Die Prüfbilder wurden zusätzlich visuell kontrolliert.
