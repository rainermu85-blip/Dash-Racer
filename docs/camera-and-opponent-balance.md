# Kurvenvorschau und Gegnerbalance

Die visuelle Kamera richtet sich weich auf die kommende Straßenmitte aus.
Die Vorschau richtet sich nach der Geschwindigkeit und beträgt bei Renntempo
etwa 1,1 Sekunden. Bei geringer Geschwindigkeit bleiben mindestens 18 Segmente
sichtbar voraus berücksichtigt. Die Straßenkurven werden mit derselben
Krümmungsintegration wie beim Zeichnen ausgewertet. Der Blick schwenkt mit
exponentieller Glättung und bleibt auf 42 Prozent der Bildschirmbreite begrenzt.
Das Auto bewegt sich dabei nur mit einem Teil des Blickversatzes seitlich.
Beim Neustart ist die Kamera zentriert; während Pause bleibt der Blick stehen.

Höhe, Zoom, Perspektivprojektion, Straßen- und Meergeometrie sowie die bisherige
Kurvenphysik bleiben erhalten. Die zusätzliche Vorschau beeinflusst weder
Fliehkräfte noch Hintergrundbewegung. Die begrenzte seitliche Ausrichtung
verschafft früher einen Blick in Kurven; sie hebt Sichtblockaden durch Felsen
oder Kuppen nicht auf.

Die fünf Gegner erhalten feste Leistungsprofile, zugeordnet zu ihren Farben:

| Farbe | Grundtempo gegenüber vorher | Spitze ohne Turbo | Bonusaufbau | Turbochance pro Sekunde in Spielernähe |
| --- | ---: | ---: | ---: | ---: |
| Pink | 90 % | ca. 362 km/h | 10 s | 7,5 % |
| Cyan | 87 % | ca. 350 km/h | 11 s | 6,0 % |
| Gelb | 84 % | ca. 338 km/h | 12 s | 5,0 % |
| Grün | 81 % | ca. 326 km/h | 13 s | 4,0 % |
| Lila | 78 % | ca. 314 km/h | 14 s | 3,0 % |

Alle haben außerdem unterschiedliche Beschleunigungen. Turbo- und
Chevron-Multiplikatoren werden auf ihre jeweilige reduzierte Grundgeschwindigkeit
angewendet. Der zufällige Turbo in Spielernähe dauert 1,2 statt 1,5 Sekunden.
Die leichte Aufholhilfe beeinflusst weiterhin nur die Beschleunigung, nicht
das Tempolimit. Die bisherige zusätzliche Bremsung weit vor dem Spieler entfällt,
damit die Profile ihr eigenes Tempo halten und auseinanderziehen.

Bei einem vorausfahrenden Wagen suchen Gegner eine freie Nachbarspur. Dabei
berücksichtigen sie Wagen vor und neben sich sowie die Spur des Spielers in
einem größeren Abstand. Bestehendes Ausweichen vor Hindernissen und die
Chevron-Entscheidungen haben Vorrang. Das ist keine kollisionsfreie Fahrautomatik;
das Feld soll Raum zum Überholen lassen und weiterhin Rennsituationen erzeugen.

`scripts/assess-game.cjs pace` prüft die reduzierten, verschiedenen Tempi in allen
sechs Leveln und bei unterschiedlichen Bildraten, die Auffächerung des Feldes
und das Freigeben einer blockierten Spur. Die bestehenden Prüfungen für
Spielertempo und Kontakte bleiben enthalten.

`scripts/assess-game.cjs camera` prüft frühe Vorschau in beide Kurvenrichtungen,
Begrenzung, sanfte Rückkehr, Bildraten, Pause und Neustart. Zusätzlich erstellt
es Fahransichten vor und nach der Änderung an identischen Kurvenpositionen in
allen sechs Leveln. `controls` prüft zusätzlich die Thermometer-Proportionen
und beide Turbo-Auslöser.

Die Countach-Vergleichsbögen sind Grafikvorschläge. Im Spiel werden die
bisherigen Wagen weiterhin gezeichnet.
