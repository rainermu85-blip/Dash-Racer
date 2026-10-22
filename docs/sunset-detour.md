# Sunset Hills: ausgeschilderte Linksausfahrt

Die Anfahrt wird ab Segment 470 gerade. Zwei Vorankündigungen mit Linkspfeilen
und wechselnden gelben Warnlampen bereiten auf die Umleitung vor. Ab Segment
522 zweigt die Fahrbahn nach links ab und verengt sich. Die Hauptstraße bleibt
rechts als gesperrter Straßenstummel mit verblassten Fahrbahnmarkierungen,
Baustellengatter, Schutt und Bagger sichtbar. Der kräftige Linksknick beginnt
an der Sperre, danach führen helle Grundstücksmauern durch die Wohnstraße.

Das orange-weiße Gatter an Segment 554 ist ein echtes Hindernis. Sichtbare
Breite, Kollisionsfläche und KI-Vorschau teilen dieselben Straßenkoordinaten;
die Kollision berücksichtigt zusätzlich die halbe Wagenbreite. Die linke
Öffnung bleibt fahrbar. Geradeausfahren kostet wie eine schwere bestehende
Baustellenkollision bis zu 70 Prozent Tempo und beendet einen laufenden Turbo.
Die Sperre verschwindet nach einem Treffer nicht und gilt für alle Fahrer und
jede Runde. Die KI muss tatsächlich nach links wechseln und bremst, solange
sie unmittelbar vor der Sperre noch nicht frei ist.

Die Straßenmitte wandert lokal um 0,60 Straßenkoordinaten nach links und kehrt
bis Segment 605 weich zur bisherigen Mitte zurück. Die Begrenzungen folgen
diesem Verlauf. Vor dem Gatter wird der Wagen nicht automatisch in die freie
Spur geklemmt. Die zuvor zufällige zweite Baustelle innerhalb der engen
Wohnstraße liegt nun außerhalb der Umleitung; die beiden geparkten Autos
bleiben echte Hindernisse. Andere Strecken, Kamera und Höhenprofil bleiben
unverändert.

## Prüfung

`node scripts/assess-game.cjs detour` verwendet die tatsächliche Strecke.
Nach dem Start der Fahrversuche verändert der Testfahrer nur Lenkeingaben:
linke, mittlere und rechte Anfahrt, normales Höchsttempo und Turbo bei
30/60/120 FPS. Zusätzlich: Geradeausfahrt in die Sperre, alle fünf Gegner,
bleibende Sperre, Übereinstimmung von sichtbaren Enden und Kontaktfläche,
Neustart und Beschränkung auf Sunset Hills. Screenshots zeigen Vorankündigung,
Einfahrt und Wohnstraße in Hoch- und Querformat.

Die Bilder wurden visuell geprüft. Das sind automatisierte Browserfahrten,
keine manuellen Handy-Playtests. Build, Kollisions-, Tempo-, Szenen- und
KI-Prüfungen sind ebenfalls erfolgreich.
