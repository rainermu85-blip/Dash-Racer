# Gegner-KI: erste Version des neuen Rennmodells

Der Windschatten-Miniturbo ist vollständig entfernt, einschließlich
Tempoanpassung des Spielers, Bereitschaft, Corona, Audio und KI-Windschatten.

## Fahrer statt Aufholskript

Alle sechs Strecken verwenden dasselbe Modell. Die fünf Farben haben
unterschiedliche Stärken: Rot ist ausgewogen, Cyan fährt Kurven sicherer,
Orange ist auf Geraden schneller, Grün plant vorsichtiger und Violett reagiert
etwas später. Die Grundspitze nach sauberem Beschleunigen liegt je nach Fahrer
bei rund 392–406 km/h; beim Spieler sind es weiterhin 402 km/h.

Dazu kommen eine beim Start gewählte Form von ±0,8 Prozent und kleine, langsame
Leistungsschwankungen. Kurven, Hindernisse, Kontakte und Turboeinsatz bestimmen
die tatsächliche Rennleistung. Es gibt keine fest vorgeschriebene Rangfolge.

Die alte Grundgeschwindigkeit von nur 78–90 Prozent des Spielers entfällt.
Auch das enge Angriffsfenster hinter dem Spieler, die globale Beschränkung auf
einen Angreifer und der Tempoabfall direkt nach dem Vorbeifahren entfallen.
Führende Gegner fahren ihr Rennen weiter.

Eine begrenzte Aufholhilfe beginnt erst ab etwa 4,2 Sekunden Rückstand auf den
Rennführenden. Sie steigt kontinuierlich auf höchstens zwei Prozent bei etwa
9,7 Sekunden Abstand. Sie vergleicht Streckenpositionen, kopiert keinen
Spielerturbo und verlangsamt niemanden vorne. Ein Zusammenstoß verliert
weiterhin Tempo und den erarbeiteten Geschwindigkeitsbonus.

## Fahrentscheidungen

Jeder Fahrer plant im Abstand von 160–280 ms etwa 1–1,3 Sekunden voraus.
Er bewertet freie Fahrwege, kommende Straßenbegrenzungen, Baustellen,
geparkte Fahrzeuge, Pickups und die Bewegung aller anderen Rennwagen.
Das berücksichtigt auch herannahende Wagen und bereits gewählte Überholspuren.

Ein gewählter Spurwechsel wird zunächst beibehalten; eine Gefahr kann ihn
unterbrechen. Es gibt kein permanentes sinusförmiges Schlingern und keine
zufälligen Spurwechsel ohne Anlass. Gegner überholen einander auch weit weg
vom Spieler. Mehrere unabhängige Überholversuche sind gleichzeitig möglich.
Bei versperrtem Weg nimmt die KI Gas weg, bis Platz entsteht. Der Spieler
hat weiterhin seine normale automatische Beschleunigung ohne Abstandshalter.

Gegnerkontakte untereinander haben nun ebenfalls Kollisionsstrafe und
Trennung der Karosserien. Straßenränder, Eisflächen und Dalí-Effekte gelten
weiterhin auch für die Gegner.

## Turbo

Gegner beginnen mit null Ladungen, sammeln Blitze beziehungsweise fünf
Space-Energiekugeln und speichern maximal drei Ladungen. Zufällig geschenkte
Turbos entfallen. Sie setzen Vorrat zum Überholen, Gegenhalten oder auf einer
freien Geraden ein und unterscheiden sich bei Risikobereitschaft und Pause
zwischen Einsätzen.

Turbo-Pickups erscheinen 1,5 Sekunden nach dem Einsammeln wieder, für Spieler
und Gegner gleichermaßen. Dadurch bleiben Ladungen auch für das hintere Feld
erreichbar. Baustellen und normale Pylonen bekommen keine solche Wiederkehrzeit.

Der manuelle Turbo verwendet für alle dieselben absoluten Ziele und dieselbe
Dauer: 1,65 × 335 km/h für 1,2 Sekunden; Chevron 2,31 × 335 km/h für zwei Sekunden.
Beschleunigung und Abklingen entsprechen den Regeln des Spielers. Ein einzelnes
Chevron-Feld startet beim Gegner den Timer einmal pro Durchfahrt.

## Prüfung und Grenzen

`node scripts/assess-game.cjs racecraft` prüft kontrollierte Überholsituationen,
bleibenden Vorsprung, KI gegen KI, gleichzeitige Manöver, blockierte Spuren,
Kontaktstrafen, tatsächliche Ladungen, Wiederkehr der Pickups, Pause und Reset.
30/60/120 FPS sowie alle sechs Strecken sind enthalten.

`node scripts/assess-game.cjs racecraft-play` fährt vollständige Rennen auf
allen sechs unveränderten Strecken mit einem separaten, automatisch lenkenden
Testfahrer. Zusätzliche Highway-Läufe variieren Zufallsstart und Turboeinsatz.
Nach dem Start verändert dieser Fahrer nur Links-/Rechts-/Turboeingaben;
Physik, Gegner, Streckenverlauf und Hindernisse bleiben aktiv. Aufgezeichnet
werden Überholvorgänge, Führungswechsel, Feldabstände, Turbos und Platzierung.
Ein Bild aus dem laufenden Rennen wird pro Durchlauf gespeichert.

Das sind automatisierte Browserprüfungen, keine manuellen Handy-Playtests.
Sie belegen funktionierende Rennabläufe und Manöver. Wie angenehm die erste
Abstimmung über viele menschliche Rennen ist, muss sich beim Spielen zeigen.
