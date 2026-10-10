# Neon-City-Brücke

10. Oktober 2026. Die beiden Türme bei Segment 950 und 1030, ihre Kreuzstreben,
die cyanfarbenen Seilfächer und die breite Fahrbahn bleiben erhalten.

Seile werden einmal im Raum an der Kameraebene abgeschnitten und projiziert.
Diese Projektion wird für Halo, farbige Linie und hellen Kern gemeinsam
verwendet. Der Turm darf hinter der Kamera liegen, während seine vorderen
Seile noch sichtbar bleiben. Eine frühe Rückkehr hatte genau diesen Fall
vorher ausgeschlossen. Die nahe Abschneideebene liegt 64 interne Einheiten
vor der Kamera, um extrem große Bildschirmkoordinaten zu vermeiden.

Seil- und Turmstärken skalieren mit Perspektive und Bildschirmbreite.
Seilanker verwenden die tatsächliche Höhe ihres Fahrbahnsegments, auch im
Gefälle am Brückenende. Dezente seitliche Geländer mit schmalen Lichtkanten
rahmen das Deck bei 1,25 Fahrbahnbreiten ein. Die vorhandene Fahrbegrenzung
und das Kollisionsmodell der Brücke ändern sich dadurch nicht.

Die Darstellung wurde in 24 Ansichten bei 390 und 480 Pixel Breite vor,
zwischen und hinter den Türmen geprüft. Der Modus `bridge` beobachtet echte
Canvas-Zeichenvorgänge: Seile beider Türme bleiben nach dem Passieren sichtbar,
verschwinden nach ihren letzten Ankern, werden mit Entfernung dünner und
bleiben über 181 Positionen endlich und unter 100.000 Pixel Projektionsbetrag.
Der größte beobachtete Betrag beträgt rund 47.651 Pixel; vor der Überarbeitung
waren es in denselben Positionen rund drei Millionen.
Alle vier Brückenprüfungen und die sechs vollständigen Rennen bestehen.

## Zur vorherigen Brücke zurückkehren

Der Stand `e6b4516` enthält bereits das neue Zusatztempo und noch die alte Brücke.
Die Brückenüberarbeitung steht in einem eigenen nachfolgenden Commit. Diesen
Commit mit `git revert` zurücknehmen und das Ergebnis pushen: Dadurch bleibt
die neue Geschwindigkeitsmechanik erhalten. Ein Zurücksetzen von `main` oder
ein Force-Push ist dafür nicht nötig.

Weitere Prüfungen und Browserinstallation:
[assessment.md](assessment.md#prüfungen-wiederholen).
