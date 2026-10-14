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

Die fünf Gegner behalten feste Leistungsprofile, zugeordnet zu ihren Farben.
Die Tempoangaben gelten ohne zusätzliche Aufholhilfe und Überholangriffe:

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
Die bisherige zusätzliche Bremsung weit vor dem Spieler entfällt. Eine kleine
Beschleunigungshilfe für zurückliegende Gegner bleibt bestehen.

## Gemeinsame Aufholhilfe und Überholangriffe

Alle sechs Strecken verwenden dieselben Regeln. Die Hilfe verändert nur das
Tempo der Gegner und setzt keine Fahrzeuge um. Der Spieler erhält weder eine
Strafe noch eine veränderte Höchstgeschwindigkeit. Als Bezug dient sein normales
voll ausgebautes Spitzentempo (402 km/h), unabhängig von Turbo, Chevron oder
momentanem Tempo nach einem Unfall.

Bei mehr als 3500 Welteinheiten Rückstand beginnt eine sanfte Aufholphase.
Je nach Fahrerprofil ist ihr Zieltempo 101,8 / 99,8 / 97,8 / 95,8 / 93,8 Prozent
des normalen Spieler-Spitzentempos. Die unterschiedlichen Tempi verhindern,
dass sich das ganze Feld gleich schnell hinter dem Spieler sammelt.

In unmittelbarer Nähe zum Heck suchen Gegner nach einer freien Spur. Ein
Überholangriff ist nach kurzer Beobachtung und abgelaufener Erholungszeit möglich.
Es greift jeweils nur ein Gegner aktiv an. Der Angriff erhält eine kurze
Anlaufphase von 0,8 Sekunden und höchstens vier Sekunden mit 2 bis 4 Prozent
Tempovorteil, abhängig vom Fahrerprofil. Andere Wagen und kommende Baustellen
werden bei der Spurwahl berücksichtigt. Hindernis-Ausweichen und Chevron-Ziele
haben weiterhin Vorrang. Gibt es beim Aufholen keine freie Spur, reduziert der
Gegner sein Zieltempo, statt durch die blockierte Lücke gedrückt zu werden.

Nach einem erfolgreichen Vorbeiziehen oder abgelaufenen Angriff klingt das
zusätzliche Tempo weich ab. Es folgen 14 bis 22 Sekunden Erholungszeit. Turbo,
Chevron, Straßenrand und Fahrzeugkontakte setzen die Unterstützung aus;
ein Unfall beendet den Angriff. Pause friert sämtliche Zeiten ein, Neustart
setzt sie zurück. Die reduzierte Grundabstimmung bleibt die Basis.

`scripts/assess-game.cjs racecraft` prüft mit der echten Physik erfolgreiche
Überholmanöver in allen sechs Strecken und bei 30/60/120 FPS, freies Ausweichen,
Begrenzung des Tempovorteils, Erholungszeit, Aufholen aus Abstand, blockierte
Spuren, einen einzelnen Angreifer, weiches Abklingen, Pause und Neustart.
Die Aufholhilfe darf den Spieler-Turbo nicht kopieren und keine Aufprallstrafe
überschreiben.

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

Der zuletzt freigegebene einfache Countach wird inzwischen für Spieler und
Gegner gezeichnet; siehe `countach-rendering.md`. Diese Grafikänderung lässt
die hier beschriebenen Kamera- und Gegnerregeln unverändert.
