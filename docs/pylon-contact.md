# Leichte Pylonen-Strafe

Ein getroffenes orange-weißes Baustellenhütchen reduziert das aktuelle Tempo
um drei Prozent. Das gilt für Spieler und Gegner, auch während Turbo. Der
zurückgelegte Weg berücksichtigt die reduzierte Geschwindigkeit ab dem Kontakt.
Ein Hütchen wird beim Treffer deaktiviert, damit es nicht in mehreren
Physikschritten erneut bestraft. Zwei verschiedene Hütchen kosten je drei
Prozent. Die Hütchen fliegen weiterhin weg.

Der Treffer entfernt weder Turbo-Ladungen noch den aufgebauten normalen
Geschwindigkeitsbonus und beendet keinen laufenden Turbo. Die normale
Beschleunigung setzt anschließend wieder ein. Baustellengatter behalten ihre
harte Aufprallwirkung. Blitze und die im Space-Level unter dem internen
Pylonen-Typ abgelegten Energiekugeln bleiben Sammelobjekte ohne Tempo-Strafe.

Die bestehenden Kollisionsprüfungen vergleichen 30/60/120 FPS und normales,
aufgebautes und Turbo-Tempo. Sie prüfen einmalige drei Prozent, mehrere
Hütchen, die Gegner-Strafe, harte Gatter und weiterhin straffreie Sammelobjekte.
