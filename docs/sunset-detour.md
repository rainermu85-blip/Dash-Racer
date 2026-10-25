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

## Einzelne Villengrundstücke

Entlang der Strecke stehen 60 einzelne Grundstücke, darunter zehn kleine
Apartmenthäuser (rund 17 Prozent). Spanische Innenhofvillen, Palm-Springs-Dächer,
klassische Anwesen und moderne 80er-Villen wechseln sich ab. Versetzte Kuben,
Flachdächer und Fensterbänder ergänzen die moderne Architektur. In der engen
Umleitung stehen ausschließlich Villen, mit höheren Terrassen hinter den Mauern.
Die Grundstücksgrafiken werden beim Streckenstart vorbereitet und wiederverwendet.
Tore, Garagen und Einfahrten bleiben Teile der projizierten Grundstücksmauern.

Die Mauern stehen bei 1,50 lokalen Straßenkoordinaten hinter dem Gehweg; dessen
innere Kante liegt bei 1,19. Die Blumenkübel stehen bei 1,33, sind auf eine zum
Auto passende Größe verkleinert und bleiben vollständig zwischen diesen
Grenzen. In der engen Passage entfallen die früher in den Mauern steckenden
freistehenden Kübel und Tor-Sprites.

Die kameranahe Schnittkante wird entlang der tatsächlich projizierten
Mauerlinie interpoliert. Das frühere Skalieren um die Bildschirmmitte
ignorierte Kurvenversatz und Straßenverschiebung und ließ die linke Mauer bei
der Durchfahrt springen. Kameraeinstellungen und Fahrbahnverlauf werden für
diese Korrektur nicht verändert.

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

## Kontinuierliche Darstellung

Sunset Hills berücksichtigt jetzt die Position der Kamera innerhalb des ersten
Straßenstücks bei der Kurvenintegration. Zuvor sprang der Versatz bei jedem
Segmentwechsel zurück: In der Umleitung wurden bei nahezu unveränderter
Kameraposition 30 Pixel Sprung für einen Gegner und 36 Pixel für ein sichtbares
Grundstück gemessen. Dieselben Übergänge liegen jetzt unter 0,001 Pixel.
Die Berechnung der Spielerkontakte verwendet denselben Kurvenverlauf.
Fahrzeugtempo, KI-Abstimmung und Kameraeinstellungen bleiben erhalten.

Nahe Straßenpolygone werden vor der Projektion an der Nahgrenze geschnitten.
Seitliche Bodenflächen folgen der Straße, statt mit einem Bildschirm-breiten
Rechteck Schrift und Hanghäuser zu übermalen. Der Asphalt bleibt gleichfarbig;
seine Polygonkanten überlappen ohne die früheren farbigen Querfugen.

Die Fernsicht für Straße, Grundstücke und Fahrzeuge blendet zwischen 95 und
155 Segmenten gemeinsam weich aus. So erscheint der entfernte Rückweg einer
S-Kurve nicht als freischwebendes Band über der Landschaft. Die nahen,
spielrelevanten Streckenteile bleiben vollständig sichtbar. Diese Fernsicht
betrifft nur Sunset Hills.

Der Schriftzug samt Stützen und Hanghäusern ist Teil derselben vorbereiteten
Hintergrundfläche. Er bleibt fest am Hang; einzelne Buchstaben werden beim
Verschieben nicht mehr neu gerastert. Die langsamere Hintergrundbewegung behält
die Staffelung zwischen ferner Stadt, Bergen und vorderem Hang.

`node scripts/assess-game.cjs hills-stability` ergänzt die bisherigen Prüfungen:
Kamera über echte Segmentgrenzen in drei Runden bewegen, Rundenübergang,
sichtbare Grundstücke, die bisher schwebende Querstrecke, Asphaltkanten und
Geländeteile außerhalb des Bildes. Die gleichen Prüfungen erkennen die Sprünge
und die Querstrecke in der Vorgängerversion. Zusätzlich speichert eine Fahrt
mit echten Physikschritten und Lenkeingaben Ansichten von Segment 490 bis 800.
Die Bilder wurden im schmalen und breiten Browserfenster kontrolliert;
das ersetzt keinen Test auf dem Handy.
