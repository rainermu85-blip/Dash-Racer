# NEON AFTERGLOW — erste Version

9. Oktober 2026. Der erste Themenblock umfasst vier zusammengehörige
Synthwave-Strecken. Die bisherigen Sonderwelten bleiben zusätzlich spielbar.

| ID | Name | Segmente | Rennen |
| --- | --- | ---: | --- |
| 1 | Neon City | 1.150 | 3 Runden |
| 2 | Ocean Drive | 1.150 | 3 Runden |
| 3 | Sunset Hills | 1.200 | 3 Runden |
| 4 | Midnight Highway | 1.200 | 3 Runden |
| 5 | Dream Odyssey | 2.875 + 200 Auslauf | Eine durchgehende Strecke |
| 6 | Space Wave | 1.350 | 3 Runden |

`LEVELS` beschreibt IDs, Namen, Farben und Streckenlängen. `LEVEL_HILLS`,
`LEVEL_HIGHWAY`, `LEVEL_DREAM` und `LEVEL_SPACE` trennen Themen von ihren
Nummern. Die früheren `getLvl3…`-Helfer heißen jetzt `getDream…`; die
Portal- und Hintergrundkonstanten tragen den Präfix `DREAM_`.

`renderLevelSelection` und `bindLevelSelection` verwenden den gleichen
Katalog im Hauptmenü und auf dem Ergebnisbildschirm. `buildMainMenu` baut
die Auswahl beim Zurückkehren neu auf. Start und Ausstieg löschen den
ausstehenden Ergebnis-Timer, damit ein alter Zieleinlauf kein neues Menü
oder Rennen überschreibt.

## Sunset Hills

Ein geschlossener Rundkurs mit harmonischen Kurven und Höhenwechseln.
Die Summe aller Höhenänderungen ist null; der Start hat keine Steigung oder
Kurve. Beverly-Villen mit Pool, Balkon und geparktem 80er-Coupé, schlanke
Palmen, Bougainvillea, Straßenlampen und Beverly-Hills-Schilder stehen
neben der Straße. Hinter ihnen liegen weich gestaffelte Hügel, entfernte
Stadtlichter und ein gestreifter Synthwave-Sonnenuntergang.

## Midnight Highway

Ein schneller Rundkurs in Schwarz und Violett. Zwei Skyline-Schichten,
Sci-Fi-Neonschrift, Türme, Lampen und leichte Reflexe auf dem Asphalt sorgen
für Tiefe. Gezeichnete, erfundene Zeichen wechseln sich mit kurzen Laden-
und Markenworten in Systemschrift ab. Zusätzliche Schriftarten oder externe
Bilddateien werden dafür nicht benötigt.

Die Reklame mischt zwölf Gestaltungen: kräftige oder dünne Schrift, ein oder
zwei Spalten, einfache und doppelte Rahmen, offene Rahmenecken und rahmenlose
Schilder. Manche haben kleine Kreise, Sonnen, Pfeile, Sterne oder Rauten.
Jedes Schild verwendet eine feste Palette aus einer oder zwei Neonfarben;
zwei der zwölf Gestaltungen verwenden drei Farben. Buchstaben eines
Schriftzugs bleiben gleichfarbig; zusätzliche Farben kennzeichnen etwa
die zweite Spalte, den Rahmen oder ein Symbol. Die Mischung aus acht
verfügbaren Neonfarben entsteht zwischen den unterschiedlichen Reklamen.
Die Gestaltung bleibt bei jeder Vorbeifahrt gleich.

74 abwechselnd links und rechts platzierte Schilder ersetzen die bisherigen
23 Schilder auf der rechten Seite. Schmale Schilder stehen am Mittelstreifen
oder äußeren Rand; breite Billboards außerhalb der beiden Fahrbahnen.
Zusätzliche Fassaden-, Laden- und Dachreklamen verwenden ebenfalls die
unterschiedlichen Gestaltungen. Farbige Halos und helle Kerne entstehen
durch gestaffelte Linien; die Zeichenkonturen werden gemeinsam verwendet,
um unnötige Arbeit pro Bild zu vermeiden. Der violett-schwarze Untergrund
bleibt der Kontrast dazu.

Produktionsbuild und die 21 Kapitelprüfungen bestehen. Eine temporäre
Browserkontrolle zeichnete 400 Streckenansichten bei 390 und 480 Pixel
Breite ohne JavaScript-Fehler; alle acht Farben wurden tatsächlich gezeichnet.
Alle zwölf Gestaltungen, Skyline und Überführungen wurden zusätzlich visuell geprüft.
Ein zehnsekündiger Lauf mit regulären Browserbildern erreichte auf der
Cloud-Prüfumgebung etwa 58 FPS ohne JavaScript-Fehler; die Renderzeit lag
im Median bei 5,5 ms und beim 95. Perzentil bei 10 ms. Dies ist eine
Umgebungsbeobachtung und keine Zusage für jedes Endgerät.

Die Gegenfahrbahn liegt links neben der Rennstrecke, durch einen Mittelstreifen
getrennt. 22 Fahrzeuge fahren entgegen der Rennrichtung auf den Spuren
`x = -1.9` und `x = -2.9` und werden über dieselbe Segmentprojektion wie die
Renngegner dargestellt. Sie gehören zur Umgebung und lösen keine Rennkontakte
aus. Leitplanken begrenzen Spieler und Renngegner auf `[-0.88, 0.88]`;
Wandkontakt verwendet das vorhandene Stoß- und Reibungsmodell.

Bei den Segmenten 215 und 735 queren Autos auf Hochstraßen die Strecke.
Bei 475 und 995 stehen Bahnüberführungen. Ein Schnellzug startet einmal
pro Runde bei der Annäherung des Spielers; der Auslöseabstand berücksichtigt
das Tempo. Die Durchfahrt dauert 4,2 Simulationssekunden und beginnt und
endet vollständig außerhalb der Brücke. Verkehr, Zugphasen und Leuchtreklamen
verwenden `chapterTime` und bleiben während einer Pause stehen. Ein Neustart
setzt alle Fahrzeuge und Ereignisse zurück.

## Umfang und Prüfung

Alle Level sind in dieser Version frei auswählbar. Medaillen, Freischaltung
nach Leistung und gespeicherter Kampagnenfortschritt folgen als eigene Arbeit,
sobald die Strecken und Zielzeiten abgestimmt sind.

`scripts/assess-game.cjs chapter` prüft Auswahl, Streckenschluss, drei Runden,
Leitplanken mit Boost, Gegenverkehr, Zugauslösung, Wiederholung pro Runde,
Pause, Reset, alte Sonderwelten und die Auswahl nach dem Rennen.
`mechanics` und `collisions` verwenden die neuen IDs der erhaltenen Welten;
die Ziellinienprüfung und `races` umfassen alle sechs Strecken.

```sh
NODE_PATH=/tmp/dash-racer-browser-tools/node_modules BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs chapter
```

Für die übrigen Prüfmodi und die Browserinstallation siehe
[Bestandsaufnahme](assessment.md#prüfungen-wiederholen).
