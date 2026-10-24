# Gemeinsamer Tempoaufbau und Turbo-Nachlauf

Die normale Spielerbasis bleibt 335 km/h. Nach Erreichen dieser Basis wächst
das Zusatztempo über zehn Sekunden sauberer Fahrt auf 402 km/h. Spieler und
KI verwenden dieselbe Beschleunigungsformel, dieselbe Aufbauschwelle und
dieselbe Aufbauzeit. Die individuellen KI-Tempoprofile und ihre vorsichtigere
Kurvenfahrt bleiben bestehen; sie erhalten weder einen früheren Bonusstart
bei 93 Prozent der Basis noch eine höhere Mindestbeschleunigung darüber.
Es gibt keinen positionsabhängigen Aufholbonus. Die normale Obergrenze liegt
für alle bei höchstens 402 km/h.

## Die Normalfahrt läuft während eines Turbos weiter

`normalSpeed` speichert die normale Beschleunigungskurve auf der tatsächlich
gefahrenen Straße. Diese Referenz läuft während Turbo und anschließendem
Ausrollen mit derselben Formel weiter wie eine Fahrt ohne Turbo. Der
Tempo-Bonus wächst anhand dieser Referenz, nicht anhand der erhöhten
Turbo-Geschwindigkeit. Ein Turbo aus dem Stand schaltet den Bonus daher
nicht vorzeitig frei.

Nach Ende des Turbos klingt die tatsächliche Geschwindigkeit weich auf die
inzwischen erreichte Normalfahrt ab. Sie fällt weder auf den alten Wert vor
dem Turbo zurück noch unter die passende Referenz. Das funktioniert auch
bei mehreren Turbos und Chevron-Feldern nacheinander.

Kollisionsfreies Beispiel ab 330 km/h:

| Zeit | Mit frühem Turbo, nach dessen Abklingen | Ohne Turbo |
| --- | ---: | ---: |
| 2 Sekunden | 347,62 km/h | 347,62 km/h |
| 5 Sekunden | 367,72 km/h | 367,72 km/h |
| 12 Sekunden | 402 km/h | 402 km/h |

Der während des Turbos gewonnene Streckenvorsprung bleibt bestehen. Normale
Turbos behalten 1,2 Sekunden Laufzeit und das Ziel 1,65 × 335 km/h. Chevron
bleibt bei zwei Sekunden und 2,31 × 335 km/h. Die KI-Turbobudgets und
Wartezeiten sind unverändert; siehe [racecraft.md](racecraft.md).

## Hecktreffer bestrafen den auffahrenden Wagen

Bei einem Längsaufprall wird weiterhin Geschwindigkeit übertragen und eine
Überlappung der Wagen verhindert. Den Verlust des Sauberfahr-Bonus erhält
jedoch nur der hintere, auffahrende Wagen. Auch ein harter Treffer beendet
nur dessen Turbo. Der vordere, gerammte Wagen behält Bonus und laufenden
Turbo. Sein physischer Kontakt-Cooldown stoppt den sauberen Tempoaufbau nicht.
Diese Regeln gelten für Spieler gegen KI in beiden Richtungen und für
KI gegen KI.

Im kontrollierten Fall „Spieler 400 km/h, Gegner hinten 402 km/h“ bleibt das
Normaltempo des Spielers bei 400 km/h. Der Stoß schiebt ihn kurz auf 401 km/h.
Die frühere zusätzliche Absenkung auf 377,25 km/h entfällt.

Seitliche Kontakte und eigene Fehler behalten ihre abgestuften Strafen.
Leichtes Streifen verliert 35 Prozent des aufgebauten Zusatztempos, ein
stärkerer eigener Kontakt den ganzen Zusatz. Pylonen kosten außerhalb von
Space Wave feste 5 km/h und behalten den verdienten Bonus.
Offroad baut den Bonus in drei Sekunden ab. Diese Verluste wirken auch auf
die Normalfahrt-Referenz: Ein Turbo kann Schäden und Reibung nicht nachträglich
wegzaubern. Eine Pause friert tatsächliches Tempo, Referenz und Timer ein;
ein Neustart setzt den Referenzzustand zurück.

## Prüfung

`node scripts/assess-game.cjs normal-pace` vergleicht echte Physikläufe mit und
ohne Turbo. Die Ausgangstempi 0, 330, 370 und 402 km/h werden bei
30/60/120 FPS für Spieler und KI mit normalen Turbos und Chevron geprüft.
Die Normalfahrt-Referenz muss durchgehend mit dem Kontrolllauf übereinstimmen;
nach dem Ausrollen muss auch die tatsächliche Geschwindigkeit übereinstimmen.
Weitere Fälle prüfen Turboverkettung, gleiche Motoren, Pylonen, Gatter,
Offroad, leichte und harte Hecktreffer in beiden Richtungen, KI-Paare,
Pause und Neustart. Alle 69 Fälle bestehen.

Die vorhandenen Prüfungen für Tempo, Kollisionen, KI, Chevron, Steuerung,
Eis/Dalí-Flächen und Umleitung bestehen ebenfalls. Vollständige Rennen
werden separat protokolliert; die frühere Zielmarke Platz 2–3 ist ein
Balancing-Vergleich und kein Beleg für gleiche physikalische Regeln.
