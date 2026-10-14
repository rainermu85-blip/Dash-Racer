# Countach im Spiel

Der freigegebene einfache Entwurf wird für Spieler und alle fünf Gegner mit
Canvas-Flächen gezeichnet: breite Keilform, große Heckleuchten, zwei sichtbare
Hinterreifen, großer Spoiler mit angeschlossenen Stützen und vier runde
Auspuffrohre in zwei Paaren. Spieler-Gold und Gegnerfarben bleiben erhalten.
Kleine Zierdetails und die ganzzahlige Rundung der alten Zeichnung entfallen.

Projektionsbreite und Bodenanker bleiben gleich. Die Zeichnung ist etwas
flacher (92 statt 100 Einheiten beim Spieler, 76 statt 84 bei Gegnern).
Kollisionen, Kamera, Fahrzeugtempo und Gegnerbalance werden nicht verändert.
Bremslicht und Trefferfarbe bleiben erhalten.

Rauch, Turbo-Flammen und Chevron-Partikel starten an den vier tatsächlichen
Rohröffnungen. Die Partikelpositionen berücksichtigen auch die sichtbare
Lenkneigung. Vier leichtere Rauchwolken ersetzen die bisherigen zwei dichteren.
Turbo-Farbe, Dauer und Geschwindigkeit bleiben erhalten.

`scripts/assess-game.cjs cars` vergleicht die im Canvas gezeichneten Rohröffnungen
mit den Rauchpositionen bei unterschiedlichen Größen und Neigungen, kontrolliert
die sichtbaren Reifen und Chevron-Partikel und erstellt Fahransichten aller
sechs Strecken sowie einen Vergleichsbogen aus der tatsächlichen Spielgrafik.
Die Bilder liegen unter `/tmp/countach-*.png` und werden visuell kontrolliert.
