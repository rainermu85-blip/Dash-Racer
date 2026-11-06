# Sunset Hills: Golden Hour bis Blue Hour

Der Sonnenuntergang läuft über die gesamte Renndistanz von drei Runden. Die
Sonne sinkt hinter die Hügel; der Himmel geht von Apricot über Rosa/Lavendel
in Dunkelblau über. An der Rundengrenze gibt es keinen Neustart des Lichts.
Gebäude, Hänge und helle Grundstückskanten bekommen eigene Abendfarben.
Straße, Fahrzeuge und HUD erhalten keinen vollflächigen Farbfilter.

## Szenen

| Ort | Szene |
| --- | --- |
| 135, Pink Palace | Hochzeit mit Blumenbogen, Paar, Gästen und weißem Cabrio in der vorhandenen Vorfahrt |
| 435, rechte Hangterrasse | Infinitypool, vier tanzende Gäste, langsam schaukelnder Flamingo und türkis leuchtende Wasserkante |
| 790–905, linke Aussichtspassage | Freier Vordergrund, Talbebauung und drei nach und nach aufleuchtende Gruppen von Stadtlichtern |
| 930, rechter Hang | Auskragende Glasvilla mit bis zum Boden sichtbaren Stützen und Pool darunter |
| 1060, rechte Villenzufahrt | Filmset mit Kamerakran, Stativen, Crew, Cabrio und langsam über die Fassade wanderndem Licht |

Poolparty, Glasvilla und Filmset ersetzen bestehende Blickfänge. Ihre
Grundstücke verwenden die vorhandenen projizierten Terrassen, mit genügend
Abstand zu den Nachbarhäusern und freigehaltenen Sichtachsen. Die Hochzeit
bleibt innerhalb der Hotelvorfahrt. Die Läden bleiben längs zur Straße.

Der neue Taleinschnitt ist periodisch und läuft an der Kachelgrenze nahtlos
weiter. Der Hügel unter dem SUNSET-HILLS-Schriftzug bleibt unverändert.
Die detaillierten Stadtlichter befinden sich in vorbereiteten Bildern.

## Aufwand und Prüfungen

Gebäude und Hintergrund haben zwischengespeicherte Farbvarianten. Drei
wiederverwendbare Hintergrundflächen werden nur bei einer kleinen Änderung
des Abendlichts neu zusammengesetzt. Es entstehen keine neuen Canvas-Flächen
während der laufenden Dämmerung. Pro Bild bleiben nur die kleinen lokalen
Animationen, Vordergrundzeichnung und Perspektivprojektion übrig.

Der Produktionsbuild sowie `hills-evening`, `hills-neighborhood`,
`hills-stability` und `detour` wurden geprüft. Dazu gehören eine vollständige
Fahrt mit echten Physikschritten, Ansichten aus allen drei Runden, Bodenkontakt,
Sichtbarkeit, Rundengrenzen und die bisherigen Fahrzeug-/Straßenfehler.
Pixelvergleiche prüfen, dass die Filmbeleuchtung nur innerhalb der Fassade
wandert und die Poolanimation auf der Terrasse bleibt.

Ein Vergleich mit Commit `fefa800` an fünf Positionen in Runde 1 und 3 ergab
in der Cloud mediane Zeichenzeiten von etwa 2,6–4,6 ms vorher und 3,0–5,4 ms
nachher. Die vorher erhöhten Hintergrundspitzen wurden durch das gemeinsame
Zwischenspeichern reduziert. Diese Messungen sind keine Handy-FPS-Messung;
die genaue Bildrate hängt weiterhin vom Gerät ab. Rohwerte und Prüfresultate
stehen in [den Belegen](evidence/hills-evening-2026-11-06.json).
