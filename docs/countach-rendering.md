# Countach im Spiel

Der freigegebene einfache Entwurf wird für Spieler und alle fünf Gegner mit
Canvas-Flächen gezeichnet: breite Keilform, große Heckleuchten, zwei sichtbare
Hinterreifen, großer Spoiler mit angeschlossenen Stützen und vier runde
Auspuffrohre in zwei Paaren. Spieler-Gold und Gegnerfarben bleiben erhalten.
Kleine Zierdetails und die ganzzahlige Rundung der alten Zeichnung entfallen.

Die Zeichnung ist etwas flacher (92 statt 100 Einheiten beim Spieler, 76 statt
84 bei Gegnern). Seit 25. Oktober sind beide Modelle zusätzlich sechs Prozent
schmaler. Bodenanker, Bremslicht, Trefferfarbe und vier Auspuffrohre bleiben
erhalten.

Die Karosseriebreite liefert jetzt auch die seitlichen Kontaktgrenzen, mit
zwei Prozent Spieltoleranz. Die alte feste Grenze von 0,24 Straßeneinheiten war
bereits für das Vorgängermodell zu schmal. Statt diesen Fehler nur durch eine
kleinere Zeichnung zu kaschieren, berücksichtigt die gemeinsame Umrechnung
Displaygröße und Straßenprojektion. Der Kontaktmittelpunkt des Spielers folgt
seiner gezeichneten Position, einschließlich des bestehenden Versatzes in
Kurven. Kosmetische Lenkneigung, Auspuffflammen und Lichtschein vergrößern den
Kollisionskörper nicht.

Beide Fahrzeug-Kollisionsprüfungen und die Überholplanung verwenden dieselben
Breiten. Gegner reservieren entsprechend Platz für ihre Manöver und zünden
beim geplanten Überholen den Turbo erst nach dem Ausscheren in die freie Spur.
Tempoaufbau, Strafen und Turbo-Vorratsregeln sind unverändert.

Rauch, Turbo-Flammen und Chevron-Partikel starten an den vier tatsächlichen
Rohröffnungen. Die Partikelpositionen berücksichtigen auch die sichtbare
Lenkneigung. Vier leichtere Rauchwolken ersetzen die bisherigen zwei dichteren.
Turbo-Farbe, Dauer und Geschwindigkeit bleiben erhalten.

`scripts/assess-game.cjs cars` vergleicht die im Canvas gezeichneten Rohröffnungen
mit den Rauchpositionen bei unterschiedlichen Größen und Neigungen, kontrolliert
die sichtbaren Reifen und Chevron-Partikel und erstellt Fahransichten aller
sechs Strecken sowie einen Vergleichsbogen aus der tatsächlichen Spielgrafik.
Die Bilder liegen unter `/tmp/countach-*.png` und werden visuell kontrolliert.

`scripts/assess-game.cjs car-contacts` vergleicht die im echten Renderlauf
gezeichneten Karosserieränder mit den Ergebnissen der Kontaktprüfung. Die
Fixtures prüfen links/rechts, versetzte Spielerpositionen, beide Kurvenrichtungen
mit Kamerablick und KI gegen KI bei 320 × 640, 390 × 844 und 480 × 800 Pixeln.
Ein geringer Abstand außerhalb der Kontaktgrenze bleibt straffrei; ein
seitlicher Eintritt löst Kontakt aus und trennt die Wagen. Vier Pixel maximale
Konturüberschneidung begrenzen die beabsichtigte kleine Spieltoleranz.

Die [Prüfergebnisse vom 25. Oktober](evidence/car-contact-alignment-2026-10-25.json)
enthalten auch vollständige Fahrten auf allen sechs Strecken. Der bereits
vorher verfehlte Balancing-Zielwert (Testfahrer durchschnittlich Platz 2–3)
bleibt offen; im aktuellen Lauf liegt der Testfahrer bei etwa Platz 1,44.
