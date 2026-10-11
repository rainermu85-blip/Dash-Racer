# Ocean Drive: tropische Felsküste und Strand

11. Oktober 2026. Die Küste verbindet wechselnde Felsquerschnitte, warme
Vulkanfarben, üppigen Bewuchs und zusätzliche Strandplätze. Streckenprofil,
Kamera, Fahrphysik, Normaltempo, Turbo und der Übergang vom Sonnenuntergang
zur Nacht über drei Runden bleiben erhalten.

## Geschlossene Fahrbahn und Felsfüße

Ein durchgehender Bodenstreifen verbindet den Straßenrand mit den wechselnd
zurückgesetzten Felsfüßen. Der bisherige Felsboden endete an diesen Füßen,
sodass zwischen Felswand und Seitenstreifen der Hintergrund sichtbar blieb.

Ocean Drive schneidet die Nahgrenze von 64 Welteinheiten jetzt vor der
Perspektivprojektion ab. Die Höhe des abgeschnittenen Endpunkts, Kurvenversatz
und Felsquerschnitt werden interpoliert. Die projizierte Geländehöhe bleibt
auch unterhalb des Bildrands erhalten; zuvor wurde die Felsfläche aus einer
bereits auf den Bildrand begrenzten Straßenhöhe erneut skaliert. Fahrbahn,
Strand und Felsen verwenden dadurch zusammenpassende Endpunkte an Steigungen
und Kuppen. Die Projektion der anderen Level bleibt erhalten.

## Madeira-Farben und hängender Bewuchs

Die Felsen haben warme rotbraune, burgunderfarbene und kupferfarbene Facetten.
Zur Nacht verdunkeln sie sich zu tiefen Rotvioletttönen. Unterschiedliche
Querschnitte, Einbuchtungen, Vorsprünge, Bruchlinien und einzelne Felsblöcke
bleiben sichtbar.

Deutlich größere, kräftig grüne Blätter und neonpinke Bougainvillea-Blüten
bilden einzelne üppige Gärten auf den Felsbändern. Hängende grüne Ranken,
dreieckige Blätter, große dreieckige Blütenblätter und helle Blütenzentren
ersetzen die kleinen, blassen Pflanzen. Die Gruppen wechseln ihre Höhe und
lassen dazwischen die vulkanischen Felsen frei. Sämtliche Pflanzenankerpunkte
liegen auf der projizierten Felsfläche. Auch die Büsche am Felsfuß und am
Durchbruch haben kräftigere Grüntöne.

## Holzpier im Wasser

Der Pier in den Segmenten 820–859 besteht aus räumlich projizierten
Holzflächen. Ein schräger Steg führt vom Strand bei Straßenoffset 2,05 durch
die Uferlinie bei 3,8 hinaus zu einer Aussichtsplattform bei 6,5–7,65.
Geländer, Pfähle bis zur Wasserfläche, Lampen, Bohlen und zwei Bänke ergänzen
ihn. Der Eingang steigt sanft vom Sand zur erhöhten Holzfläche an.
Das bisherige Pavillon-Billboard entfällt.

Der Steg wird nach seiner Tiefe in denselben Zeichenablauf wie Strand und
Meer eingefügt. Die seitliche Projektion verwendet einen gemeinsamen
Uferanker, damit sich die gerade Konstruktion nicht mit der Straße verbiegt.
Nahgrenze und Verdeckung durch davorliegendes Gelände gelten auch für den
Pier. Er steht im flachen Linksbogen und wurde während normaler Fahrt bei
Tag und Nacht kontrolliert.

## Party und weitere Strandplätze

Die Party steht bei Segment 75 auf der langen Startgeraden. Die größere
Darstellung und der von Palmen freigehaltene Blick verlängern die Sichtbarkeit.
Volleyball und Strandjeep folgen bei 87 und 95. Die Party behält ihre
Darstellung mit Sonnenschirm tagsüber und DJ, Tänzern und lokalen Lichteffekten
in Runde drei.

Zehn zusätzliche Strandplätze verteilen sich auf vier Motive: Liegen mit
Sonnenschirm, farbige Surfbrettständer, Cabanas und offene Rettungssitze mit
Leiter und Rettungsring. Die Füße der Einrichtungen stehen auf dem Sand.
Strandbar, Eiswagen, Wal, Boote und Surfer bleiben erhalten.

## Natürlicher Felsdurchbruch

Die Straße führt in den Segmenten 506–541 durch einen kurzen Felsvorsprung
auf der mittleren Geraden. Die 36 Segmente entsprechen 1,25 Sekunden bei
402 km/h. Eine unregelmäßige Öffnung in einem größeren Felskörper, ein grob
behauenes Gewölbe, Steinrisse und Pflanzen greifen die Fotoreferenz auf.
Die vollständige Geometrie ist vor der Einfahrt sichtbar.

Im Durchbruch liegt die Fahrbahnbegrenzung auf beiden Seiten bei 1,05.
Außerhalb bleibt die rechte Seite bis 1,45 offen. Links gilt die bestehende
Begrenzung an der Felswand. Die normale Durchfahrt verursacht keinen
zusätzlichen Tempoverlust.

## Validierung

120 Browserprüfungen bei unverändertem Fahrmodell:

- `node scripts/assess-game.cjs coast`: 38 bei 390 × 844 und 480 × 800 Pixel.
- `node scripts/assess-game.cjs collisions`: 59.
- `node scripts/assess-game.cjs mechanics`: 23.

Die Küstenprüfung kontrolliert die Tunnelöffnung, freie Spuren, örtliche
Begrenzung, sichere Projektion, Annäherung und Durchfahrt. Sie malt Gelände
über einen eindeutig erkennbaren Testhintergrund und prüft Asphalt und
Felsfüße an sieben Steigungs-/Kuppenpositionen pro Bildschirmgröße auf Lücken.

Die Sichtbarkeit wird mit der echten Fahrsimulation und ihrer normalen
Kameraglättung bei vollem Normaltempo geprüft. Fertige Frames mit und ohne
Landmarke werden außerhalb der Turboanzeige verglichen. Stichproben in
Abständen von etwa 0,24 Sekunden ergeben rund 1,5 Sekunden sichtbaren Pier
und gut 2 Sekunden sichtbare Party, nachts etwas länger. Weitere Prüfungen
erfassen die deutlich sichtbaren grünen/pinken Pflanzen, vier Strandmotive,
Felskontakt und die Trennung von den anderen Leveln.

Es traten keine JavaScript-Fehler auf. Produktionsbuild und Leerzeichenprüfung
bestanden. Ein Vergleich mit dem vorherigen Commit bestätigt identische
Streckenhöhen und Kurven, Kamerakonstanten, Geschwindigkeitseinstellungen
und Sonnenuntergangsphasen.
