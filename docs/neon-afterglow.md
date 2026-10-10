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
Schilder auf dunklem Grund verwenden eine feste Palette aus einer oder zwei Neonfarben;
zwei der zwölf Gestaltungen verwenden drei Farben. Buchstaben eines
Schriftzugs bleiben gleichfarbig; zusätzliche Farben kennzeichnen etwa
die zweite Spalte, den Rahmen oder ein Symbol. Die Mischung aus acht
verfügbaren Neonfarben entsteht zwischen den unterschiedlichen Reklamen.
Die Gestaltung bleibt bei jeder Vorbeifahrt gleich.

Die zusätzlichen Leuchtreflektoren, Asphaltfugen und Lichtreflexe wurden
auf Nutzerwunsch wieder entfernt. Die kürzeren Fahrbahnstriche bleiben
und sind auf Midnight Highway um 25 Prozent breiter. Kameraposition,
Sichtwinkel, Geschwindigkeit und Boost-Effekte bleiben unverändert.

Von Segment 490 bis 719 führt MIDTOWN LINK durch einen gemeinsamen Tunnel
für beide dreispurigen Fahrbahnen. Bei 402 km/h dauert die Passage ungefähr
acht Sekunden. Warmgelbe Wände, dunkle Decke, sechs Reihen Deckenleuchten
und grüne Notausgangsdetails orientieren sich an der fotografischen Referenz.
Dicke Säulen stehen ausschließlich im Mittelstreifen; zwischen ihnen bleibt
der Gegenverkehr sichtbar. Die Portale sind Schlitze in breiten städtischen
Betonbauwerken mit Stützwänden, gestaffelten Technikaufbauten und Lüftungsbänken.
Straßenreklamen stehen nur außerhalb des Tunnels.
Für Geometrie, Dauer und Prüfungen siehe [MIDTOWN LINK](midtown-tunnel.md).

Seit dem 10. Oktober hat jedes fünfte Schild stattdessen eine leuchtende
Farbfläche aus der vorhandenen Neonpalette. Darauf stehen dunkle Zeichen,
Wortmarken und Symbole ohne helle Neonkerne. Die gleiche Regel gilt für
Strecken-, Fassaden-, Laden- und Dachschilder. Seit der Tunnelergänzung
sind an der offenen Strecke 12 von 59 Schildern farbig hinterlegt,
also rund 20 Prozent.

59 abwechselnd links und rechts platzierte Schilder stehen außerhalb des
Tunnels. Schmale Schilder stehen am Mittelstreifen
oder äußeren Rand; breite Billboards außerhalb der beiden Fahrbahnen.
Zusätzliche Fassaden-, Laden- und Dachreklamen verwenden ebenfalls die
unterschiedlichen Gestaltungen. Farbige Halos und helle Kerne entstehen
durch gestaffelte Linien; die Zeichenkonturen werden gemeinsam verwendet,
um unnötige Arbeit pro Bild zu vermeiden. Der violett-schwarze Untergrund
bleibt der Kontrast dazu.

Produktionsbuild und die 21 Kapitelprüfungen bestehen. Die erste Browserkontrolle
der zwölf Gestaltungen zeichnete 400 Streckenansichten ohne JavaScript-Fehler.
Die Überarbeitung vom 10. Oktober wurde bei 390 und 480 Pixel breiter Spielfläche
sowie in einem Desktopfenster geprüft. 27 geometrische Kontrollen bestätigten
Brückenenden außerhalb des Bildes und waagerechte Zugwagen, auch bei seitlich
versetzter Projektion. Die Inhalte der farbigen Schilder erreichten mindestens
4,77:1 Farbkontrast; alle acht möglichen Flächenfarben wurden visuell geprüft.
Ein zehnsekündiger Lauf mit regulären Browserbildern erreichte auf der
Cloud-Prüfumgebung etwa 59 FPS ohne JavaScript-Fehler; die Renderzeit lag
im Median bei 5,6 ms und beim 95. Perzentil bei 8,2 ms. Dies ist eine
Umgebungsbeobachtung und keine Zusage für jedes Endgerät.

Die Gegenfahrbahn liegt links neben der Rennstrecke, durch einen Mittelstreifen
getrennt. 22 Fahrzeuge fahren entgegen der Rennrichtung auf drei Spuren
`x = -3.2`, `x = -2.5` und `x = -1.8` und werden über dieselbe Segmentprojektion wie die
Renngegner dargestellt. Sie gehören zur Umgebung und lösen keine Rennkontakte
aus. Leitplanken begrenzen Spieler und Renngegner auf `[-0.88, 0.88]`;
Wandkontakt verwendet das vorhandene Stoß- und Reibungsmodell.

Bei den Segmenten 215 und 735 queren Autos auf Hochstraßen die Strecke.
Die Seitenansichten haben jetzt niedrige 80er-Karosserien, zwei sichtbare
Räder mit Felgen, geteilte Fenster, Türen, Stoßfänger und kleine Scheinwerfer.
Coupés und Limousinen unterscheiden sich; die Fahrzeuge stehen mit ihren
Reifen auf der Fahrbahn und folgen deren Neigung.
Die Brücken reichen auf beiden Seiten über den sichtbaren Bildrand hinaus;
die Länge berücksichtigt Projektion, Kurven und Bildschirmbreite. Bei 475
und 995 stehen waagerechte Bahnüberführungen mit ebenso waagerechten Gleisen
und Zugwagen. Ein Schnellzug startet einmal
pro Runde bei der Annäherung des Spielers; der Auslöseabstand berücksichtigt
das Tempo. Die Durchfahrt dauert jetzt 1,6 statt zuvor 3,2 Simulationssekunden und
beginnt und endet mit dem gesamten Zug außerhalb des sichtbaren Bildes.
Verkehr, Zugphasen und Leuchtreklamen
verwenden `chapterTime` und bleiben während einer Pause stehen. Ein Neustart
setzt alle Fahrzeuge und Ereignisse zurück.

Ab Segment 650 rast einmal je Runde ein Polizeiwagen auf der inneren
Gegenspur vorbei, innerhalb der Tunnelpassage und nach dem Ende der
mittleren Baustelle. Er fährt mit
7.200 Welteinheiten pro Sekunde gegenüber 1.850–2.450 beim normalen
Gegenverkehr. Seine Position verwendet die gesamte Renndistanz; ein
vorbeigefahrenes Polizeiauto wird nicht um den Kurs zurückprojiziert.
Rot und Blau wechseln auf dem Dachbalken. Kleine Lichtkegel, Halos und
Reflexe bleiben am Auto und auf dem Asphalt daneben. Es gibt dafür
keine bildschirmfüllende Farbfläche und keinen Eingriff in das Kollisionsmodell.
Pause friert Fahrt und Lichter ein; Neustart und Levelwechsel löschen
die bereits ausgelösten Runden. Gegenverkehr wird innerhalb der
Straßensegmente interpoliert, damit die schnelle Fahrt gleichmäßig erscheint.

## Umfang und Prüfung

Alle Level sind in dieser Version frei auswählbar. Medaillen, Freischaltung
nach Leistung und gespeicherter Kampagnenfortschritt folgen als eigene Arbeit,
sobald die Strecken und Zielzeiten abgestimmt sind.

`scripts/assess-game.cjs chapter` prüft Auswahl, Streckenschluss, drei Runden,
Leitplanken mit Boost, Gegenverkehr, Zugauslösung, Wiederholung pro Runde,
Pause, Reset, alte Sonderwelten und die Auswahl nach dem Rennen.
`mechanics` und `collisions` verwenden die neuen IDs der erhaltenen Welten;
die Ziellinienprüfung und `races` umfassen alle sechs Strecken.

Für die schnelle Polizeifahrt und die Hütchenkorrektur bestanden insgesamt
130 Browserprüfungen: 27 Kapitel-, 59 Kollisions-, 21 Tempo- und
23 Mechanikprüfungen. Die neuen Kontrollen beobachten genau eine
Polizeifahrt je Runde, ihren Abgang ohne erneutes Auftauchen, Pause und
Reset sowie den roten/blauen Lichtwechsel. Ein Pixelvergleich prüft,
dass die Polizeibeleuchtung innerhalb weniger Autobreiten bleibt.
Die Brücken- und Polizeiansichten wurden bei 390 und 480 Pixel breitem
Spielfeld sowie im Desktopfenster kontrolliert. Ein regulärer Lauf
auf der Cloud-Prüfumgebung zeichnete 358 Bilder in sechs Sekunden ohne
JavaScript-Fehler; das Polizeiauto war beim Vorbeirasen in 27 Bildern
sichtbar, ohne Trefferfeedback oder Tempoverlust beim Spieler.
Der Produktionsbuild und die Prüfung auf überflüssige Leerzeichen bestanden.

```sh
NODE_PATH=/tmp/dash-racer-browser-tools/node_modules BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs chapter
```

Für die übrigen Prüfmodi und die Browserinstallation siehe
[Bestandsaufnahme](assessment.md#prüfungen-wiederholen).
