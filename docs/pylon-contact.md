# Leichte Pylonen-Strafe

Ein getroffenes orange-weißes Baustellenhütchen reduziert das aktuelle Tempo
um feste 5 km/h, mindestens auf 0 km/h. Das gilt für Spieler und Gegner, auch
während Turbo. Der zurückgelegte Weg berücksichtigt die reduzierte
Geschwindigkeit ab dem Kontakt.
Ein Hütchen wird beim Treffer deaktiviert, damit es nicht in mehreren
Physikschritten erneut bestraft. Zwei verschiedene Hütchen kosten zusammen
10 km/h. Die Hütchen fliegen weiterhin weg.

Der Treffer entfernt weder Turbo-Ladungen noch den aufgebauten normalen
Geschwindigkeitsbonus und beendet keinen laufenden Turbo. Auch die während
eines Turbos mitgeführte Normalfahrt-Referenz verliert 5 km/h. Die normale
Beschleunigung setzt anschließend wieder ein. Baustellengatter behalten ihre
harte Aufprallwirkung. Blitze und die im Space-Level unter dem internen
Pylonen-Typ abgelegten Energiekugeln bleiben Sammelobjekte ohne Tempo-Strafe.

Die bestehenden Kollisionsprüfungen vergleichen 30/60/120 FPS und normales,
aufgebautes und Turbo-Tempo. Sie prüfen einmalige 5 km/h bei unterschiedlichen
Ausgangstempi, mehrere Hütchen, die Gegner-Strafe, harte Gatter und weiterhin
straffreie Sammelobjekte.
