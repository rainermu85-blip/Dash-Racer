# Zusatztempo für sauberes Fahren

10. Oktober 2026. Die anfängliche Beschleunigung auf 335 km/h bleibt bestehen.
Danach steigt das normale Tempo über zehn Sekunden sauberer Fahrt gleichmäßig
auf 402 km/h (120 Prozent). Bei fünf Sekunden liegt es bei 368,5 km/h.
Der Aufbau funktioniert in allen sechs Welten; die KI behält ihre bisherigen
Geschwindigkeiten. Rennzeiten und Schwierigkeit sollten mit Testern abgestimmt werden.

`player.maxSpeed` bleibt die alte Basis von 3600 internen Einheiten.
`cleanSpeedBonus` speichert den verdienten Zusatz von null bis 0,2.
Fortschritt entsteht auf der Fahrbahn ab der alten Höchstgeschwindigkeit,
ohne laufenden Kontakt-Cooldown oder Wandreibung. Während eines Turbos und
beim anschließenden Ausrollen oberhalb des verdienten Normaltempos pausiert
der Aufbau. Nach dem Turbo sinkt das Tempo mit der bestehenden Verzögerung
weich auf die verdiente Geschwindigkeit.

Der normale Turbo behält 165 Prozent der alten Basis, der Chevron-Turbo
231 Prozent. Beschleunigung, Laufzeit und Verkettung der Turbos bleiben gleich.
Die neue normale Höchstgeschwindigkeit wird nicht als Turbo-Basis verwendet.

Leichtes Streifen eines Gegners oder der Begrenzung kostet 35 Prozent des
verdienten Zusatzes. Ein deutlicher Kontakt entfernt den Zusatz vollständig
und begrenzt normales Tempo auf höchstens 335 km/h. Die Einordnung verwendet
die vorhandene Aufprallstärke: relative Annäherung bei Gegnern, seitliche
Geschwindigkeit bei Wänden. Die Schwelle liegt bei 0,18 der normierten Stärke.
Der vorhandene Kollisionsverlust wirkt zusätzlich; harte Aufpralle können
weiterhin deutlich unter 335 km/h bremsen. Kein Kontakt hebt ein langsameres
Auto auf 335 km/h an. Aktive Turbos behalten ihre bisherigen Kontaktreaktionen.

Drei Sekunden durchgehendes Fahren neben der Strecke entfernen den ganzen
Zusatz. Ein kürzerer Ausflug verliert ihn anteilig; die bestehende Reibung
bremst das Auto ebenfalls. Pylonen ändern den verdienten Zusatz nicht:
außerhalb des Space-Levels gilt weiterhin der kleine vorhandene Tempoverlust,
im Space-Level bleiben sie Energie-Pickups. Pause friert den Aufbau ein,
ein Neustart setzt ihn zurück.

`scripts/assess-game.cjs pace` prüft Zeitverlauf und Maximum bei 30, 60 und
120 Bildern pro Sekunde, leichte und deutliche Kontakte, harte Hindernisse,
beide Turbo-Maxima, Rückkehr nach Turbo, Pylonen, Offroad, Pause und Neustart.
Die Modi `mechanics`, `collisions`, `chapter` und `races` prüfen die übrige
Mechanik und vollständige Rennen. Browserinstallation und Befehle stehen in
[assessment.md](assessment.md#prüfungen-wiederholen).

Prüfung am 10. Oktober: 21 Tempo-, 29 Kollisions-, 23 Mechanik- und 21
Kapitelprüfungen bestehen. Alle sechs Rennen liefen mit einem per Tasteneingabe
steuernden Browserfahrer vom Start bis zum Ergebnis durch, ohne Tempo- oder
Positionsüberschreibungen. Rundenzeiten, Platzierung und Zieleinlauf bestanden;
es gab keine JavaScript-Fehler. Der Fahrer gewann alle sechs Rennen. Das zeigt
den Abschluss der Rennen; eine Bewertung der Schwierigkeit braucht zusätzlich
Spieltests mit Menschen.
