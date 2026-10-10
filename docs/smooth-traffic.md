# Kontinuierliche Fahrzeugdarstellung

Die Renngegner wurden am projizierten Ende ihres Straßensegments gezeichnet.
Ihre tatsächliche Position innerhalb des 150 Einheiten langen Segments
beeinflusste weder Höhe noch Größe. Bei der Fahrt durch ein Segment bewegte
sich der gezeichnete Wagen daher relativ zum Spieler, und beim nächsten
Segment sprang er zurück. Das wirkte wie starkes Hüpfen oder Flimmern.

Eine kontrollierte Browsermessung bei 480 × 800 Pixeln hielt den Abstand
zwischen Spieler und Gegner bei 900 Einheiten konstant. Trotzdem schwankte
die Gegnerhöhe bei 60 FPS um 28,9 Pixel und der Größenfaktor um 0,15.

Die Darstellung projiziert jetzt die tatsächliche Längs- und Seitenposition
des Fahrzeugs. Straßenhöhe und Kurvenversatz werden an dieser Position
innerhalb des Segments interpoliert. Auch Gegenverkehr und Polizeiwagen
verwenden diese Projektion. Die Fahrzeugreihenfolge innerhalb eines Segments
berücksichtigt ihre tatsächlichen Abstände. Die Kamera und sämtliche
Fahr-, KI- und Kollisionswerte sind unverändert.

`node scripts/assess-game.cjs traffic` prüft die dargestellten Positionen
im echten Browser: konstanter Abstand bei 30, 60 und 120 FPS, drei Abstände,
Segmentübergänge in allen sechs Leveln, Rundenwechsel und vorbeigefahrene
Gegner. Vor der Korrektur scheiterten 16 von 17 Prüfungen. Anschließend
bestanden alle 17, und im Test mit konstantem Abstand schwanken Position
und Größe nicht mehr.

Mit den Kapitel-, Mechanik-, Kollisions- und Brückenprüfungen bestanden
insgesamt 132 Prüfungen. Die Gegner wurden zusätzlich bei 390 und 480
Pixel Spielfeldbreite und während einer regulären Browserfahrt kontrolliert.
