# Neon-City-Brücke

10. Oktober 2026. Die beiden Türme bei Segment 950 und 1030, ihre Kreuzstreben,
die cyanfarbenen Seilfächer und die breite Fahrbahn bleiben erhalten.

Seile werden in Stücke entlang der Fahrbahnsegmente geteilt, im Raum an der
Kameraebene abgeschnitten und mit ihrem jeweiligen Fahrbahnabschnitt gezeichnet.
So kann ein näherer Straßenstreifen keinen fernen, schwebend wirkenden Seilfuß
abschneiden. Jede Projektion wird für Halo, farbige Linie und hellen Kern
gemeinsam verwendet. Der Turm darf hinter der Kamera liegen, während seine
vorderen Seile noch sichtbar bleiben; zusätzliche unsichtbare Turm-Sprites
sind dafür nicht nötig. Die nahe Abschneideebene liegt 64 interne Einheiten
vor der Kamera, um extrem große Bildschirmkoordinaten zu vermeiden.

Seil- und Turmstärken skalieren mit Perspektive und Bildschirmbreite.
Seilanker verwenden die tatsächliche Höhe ihres Fahrbahnsegments und die
gleiche Geländerhöhe wie die Straße, auch im Gefälle am Brückenende. Dezente
seitliche Geländer mit schmalen Lichtkanten rahmen das Deck bei 1,25
Fahrbahnbreiten ein; genau dort sitzen die Seilfüße. Die vorhandene Fahrbegrenzung
und das Kollisionsmodell der Brücke ändern sich dadurch nicht.

Die Darstellung wurde in 24 Ansichten bei 390 und 480 Pixel Breite vor,
zwischen und hinter den Türmen geprüft. Der Modus `bridge` beobachtet echte
Canvas-Zeichenvorgänge: Seile beider Türme bleiben nach dem Passieren sichtbar,
verschwinden nach ihren letzten Ankern, werden mit Entfernung dünner und
bleiben über 181 Positionen endlich und unter 100.000 Pixel Projektionsbetrag.
Zusätzliche Prüfungen vergleichen die Seilenden mit den tatsächlich gezeichneten
Geländern und betrachten Positionen direkt beiderseits der Segmentgrenzen.
Die Ankerabweichung liegt unter 0,1 Pixel; der größte beobachtete Sprung an
einer Grenze beträgt rund 0,00034 Pixel. Der größte Projektionsbetrag beträgt
rund 47.659 Pixel; vor der Überarbeitung
waren es in denselben Positionen rund drei Millionen.
Alle sechs Brückenprüfungen bestehen. Der ursprüngliche Umbau wurde außerdem
mit sechs vollständigen Rennen geprüft; die Ankerkorrektur ändert keine Physik.

## Zur vorherigen Brücke zurückkehren

Der Stand `e6b4516` enthält bereits das neue Zusatztempo und noch die alte Brücke.
Die erste Brückenüberarbeitung steht im Commit `343d746`, die Anker- und
Zeichenkorrektur in einem weiteren eigenen Commit. Für die ursprüngliche Brücke
beide Brücken-Commits mit `git revert` in umgekehrter Reihenfolge zurücknehmen
und das Ergebnis pushen. Zusatztempo und die separat gespeicherten Strömungseffekte
bleiben dabei erhalten. Ein Zurücksetzen von `main` oder ein Force-Push ist dafür
nicht nötig.

Weitere Prüfungen und Browserinstallation:
[assessment.md](assessment.md#prüfungen-wiederholen).
