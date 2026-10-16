# Windschatten-Miniturbo

Spieler und alle fünf Gegner verwenden dieselben Regeln auf allen sechs Strecken.
Der Bonus verbraucht keine Turbo-Ladung.

## Aufladen

2,5 Sekunden ununterbrochen hinter demselben vorausfahrenden Wagen bleiben:

- Freie Lücke zwischen den Wagen: mindestens eine halbe, höchstens zwei Wagenlängen.
- Seitlicher Versatz: höchstens 40 Prozent der Wagenbreite, also mindestens 60 Prozent Überdeckung.
- Der Wagen muss fahren und sich auf der Fahrbahn befinden.

Eine Unterbrechung setzt den Zähler sofort zurück, auch innerhalb eines einzelnen
Bildes. Die Physik prüft in Schritten von höchstens 1/120 Sekunde. Ein Wechsel zum
nächsten Wagen beginnt ebenfalls bei null. Entfernungen werden entlang der Strecke
gemessen, sodass Kurven und Rundengrenzen die Regel nicht verändern.

Die Wagenlänge entspricht der tatsächlichen Fahrzeugtiefe im Kollisionsmodell
(90 Streckeneinheiten). Die breite Rückansicht der Wagen hat im Pseudo-3D-Renderer
einen eigenen Maßstab; echte Countach-Proportionen würden den Windschatten
versehentlich weit vor den sichtbaren Nahbereich legen. Die seitliche Toleranz
folgt weiterhin der dargestellten Wagenbreite.

Da das Spiel automatisch beschleunigt und keine Bremse hat, begrenzt die
Automatik beim sauberen Folgen im gültigen Bereich das Tempo auf den Vordermann
und hält dabei eine freie Lücke. Sie lenkt nicht mit. Beim Aufladen entfällt die
Begrenzung, sobald die nötige Überdeckung oder der Abstand verloren geht. Nach
dem Aufladen bleibt sie auch beim teilweisen Ausscheren aktiv, bis die beiden
Wagen seitlich vollständig getrennt sind. Auch Gegner verwenden diese
Tempoabstimmung;
Hindernissen auszuweichen und ihre Überholmanöver haben weiter Vorrang. Ein
näherer Wagen in derselben Linie blockiert den Windschatten weiter vorne.

## Bereit halten und auslösen

Nach den 2,5 Sekunden ist der Bonus zunächst **bereit**. Eine ruhige, dünne blaue
Corona zeigt das an. Der Wagen beschleunigt noch nicht zusätzlich; die zwei
Sekunden Wirkungsdauer haben noch nicht begonnen. Der Fahrer kann weiterhin
hinter seinem Vordermann bleiben und den passenden Moment zum Ausscheren wählen.

Erst bei **null seitlicher Überdeckung** mit genau diesem Vordermann startet der
Miniturbo. Die Trennung wird in Fahrbahnkoordinaten gegen eine ganze Wagenbreite
geprüft. Bei jeder noch vorhandenen Überdeckung bleibt der Bonus bereit, auch
wenn die Überdeckung bereits unter 60 Prozent gefallen ist. Die Tempoanpassung
bleibt dabei aktiv und hält die Lücke. So ist beim Verlassen des Windschattens
keine Bremse nötig. Nach der vollständigen Trennung entfällt diese Begrenzung.

Der bereite Bonus bleibt an denselben vorausfahrenden Wagen gebunden. Verlässt
dieser den gültigen Abstand, wird entfernt oder beendet das Rennen, verfällt die
Bereitschaft. Es gibt keinen Wechsel auf einen anderen Gegner und keine zweite
angesammelte Ladung. Solange der Fahrer sicher in der Nähe seines Vordermanns
bleibt, läuft keine zusätzliche Wartefrist ab. Gegner wählen zum Auslösen eine
freie Spur und beachten weiterhin Hindernisse.

## Wirkung und Abbruch

Nach dem vollständigen Ausscheren gibt es zwei Sekunden lang einen weichen
Anschub und eine um 10 Prozent erhöhte normale Tempo-Grenze. Bereits freigefahrenes zusätzliches
Tempo bleibt die Grundlage. Die Gegner erhalten denselben Faktor auf ihr normales
Renntempo, einschließlich ihres bestehenden Aufhol- oder Überholverhaltens.
Während der Bereitschaft und des Miniturbos wird kein weiterer Windschatten
angesammelt.

Nach dem Auslösen bleibt der Bonus bei weiteren Spurwechseln und beim Überholen
aktiv.
Jeder Fahrzeug-, Wand-, Gatter-, Straßenrand- oder Hütchenkontakt verwirft einen
bereiten Bonus oder beendet den laufenden Miniturbo sofort, unabhängig von
Aufprallstärke oder Kollisionsschutzzeit. Das gilt auch für
Kontakte zwischen zwei Gegnern. Blitze und Space-Energiekugeln sind Pickups und
beenden den Bonus nicht.

Die großen Turbos und Chevron-Turbos haben Vorrang und werden nicht mit dem
Miniturbo multipliziert. Aufladen, Bereitschaft und Wirkung pausieren im
Pausenmenü. Neustart,
Menüausstieg und Rennende entfernen den Zustand.

## Rückmeldung

Ein bereiter Bonus hat eine ruhige, sehr dünne blaue Corona um den Wagen.
Während der Wirkung schimmert diese etwas stärker. Es gibt keine zusätzliche
Kameraänderung oder Turbo-Flamme. Ein leises,
zunehmendes Luftgeräusch begleitet das Aufladen und verstummt bei Unterbrechung,
Pause oder Menüausstieg. Der Browser schaltet Audio erst nach einer Eingabe frei;
die Spielmechanik funktioniert auch ohne Audio-Unterstützung.

## Prüfen

Bei laufender Vite-Vorschau und installiertem Playwright:

```sh
BROWSER_PATH=/usr/bin/chromium node scripts/assess-game.cjs drafting
```

Der Lauf prüft unter anderem Zeit- und Abstandsgrenzen, kurze Unterbrechungen,
Gegnerwechsel, Rundengrenzen, Geschwindigkeit, Kontakte und Pickups, beide
KI-Windschattenkombinationen, Pause und Neustart, lokale Corona-Pixel und das leise
Aufladegeräusch. Die Displaybreiten sind 320, 390 und 480 Pixel. Die Prüffälle für
normale Gegner-Tempolimits in `pace` halten die Wagen bewusst weit auseinander und
schließen Eis-/Uhrenpfützen aus, damit dort das Grundtempo gemessen wird.

Zusätzlich fährt `assessment-drafting-play.cjs` auf allen sechs unveränderten
Strecken vom normalen Startfeld los. Der Fahrer gibt nur Links-/Rechts-Eingaben,
bleibt hinter einem Gegner, wartet nach der Bereitschaft noch mindestens eine
halbe Sekunde ohne Schub und schert dann vollständig aus. Eine Auslösung bei noch
vorhandener Überdeckung lässt die Prüfung scheitern. Die Prüfung verlangt
einen tatsächlich erreichten Bonus von mindestens 8 Prozent und ein Überholen.
Danach muss der Bonus regulär enden oder durch einen nachgewiesenen Kontakt
abbrechen. Die volle kontaktfreie Dauer wird zusätzlich bei 30/60/120 FPS
in den isolierten Fällen geprüft. Gegnerwerte, Spurbewegungen, Kurven und
Hindernisse werden dabei nicht fixiert oder entfernt. Das ersetzt keinen
Bedienungstest auf einem echten Telefon.

Zwei zusätzliche Fahrten auf Midnight Highway halten bewusst rund 70 Prozent
Überdeckung, links beziehungsweise rechts versetzt. Dabei muss der Wagen während
des Aufladens über 1,5 Sekunden außerhalb der früheren 80-Prozent-Toleranz bleiben
und den Bonus trotzdem bereit bekommen, erst nach null Überdeckung auslösen
und zum Überholen nutzen.
