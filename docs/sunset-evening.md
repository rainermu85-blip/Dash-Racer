# Sunset Hills: Golden Hour bis Blue Hour

Der Sonnenuntergang läuft über die gesamte Renndistanz von drei Runden. Die
Sonne sinkt hinter die Hügel; der Himmel geht von Apricot über Rosa/Lavendel
in Dunkelblau über. An der Rundengrenze gibt es keinen Neustart des Lichts.
Himmel und helle Grundstückskanten bekommen Abendfarben; die statischen
Gebäudegrafiken werden aus Leistungsgründen nur einmal gezeichnet.
Straße, Fahrzeuge und HUD erhalten keinen vollflächigen Farbfilter.

## Szenen

| Ort | Szene |
| --- | --- |
| 135, Pink Palace | Hochzeit mit Blumenbogen, Paar, Gästen und weißem Cabrio in der vorhandenen Vorfahrt |
| 435, rechte Hangterrasse | Infinitypool, vier tanzende Gäste, langsam schaukelnder Flamingo und türkis leuchtende Wasserkante |
| 790–905, linke Aussichtspassage | Freier Vordergrund mit Blick auf sanfte, bewohnte Hänge und aufleuchtende Fenster und Straßenlichter |
| 930, rechter Hang | Kleine Sonnenuhr am Gehweg; direkt gezeichnet, ohne eigene Grafikfläche |
| 1060, rechte Villenzufahrt | Filmset mit Kamerakran, Stativen, Crew, Cabrio und langsam über die Fassade wanderndem Licht |

Poolparty, Sonnenuhr und Filmset ersetzen bestehende Blickfänge. Ihre
Grundstücke verwenden die vorhandenen projizierten Terrassen, mit genügend
Abstand zu den Nachbarhäusern und freigehaltenen Sichtachsen. Die Hochzeit
bleibt innerhalb der Hotelvorfahrt. Die Läden bleiben längs zur Straße.

Die künstlichen Taleinschnitte wurden nach Rückmeldung zu ihrer steilen,
unnatürlichen Form vollständig entfernt. Der Hintergrund verwendet wieder
die ursprüngliche, periodische Hügelkontur. Häuser und Schriftzug bleiben an
diesem Gelände verankert. Fenster- und Straßenlichter liegen in einem kleinen,
einmal vorbereiteten Bild an den passenden Positionen auf dem Hang.

## Aufwand und Prüfungen

Die erste Abendlicht-Version verursachte auf dem Gerät des Nutzers starkes
Ruckeln. Die vielen Farbvarianten, doppelte Zeichnung der Gebäude und laufende
Neuzusammensetzung großer Hintergrundflächen wurden deshalb entfernt.

Gebäude und Hintergrund bleiben während der Fahrt unveränderte Grafikflächen
und werden jeweils einmal gezeichnet. Nur die Deckkraft einer vorbereiteten
Lichtebene ändert sich. Sonnenuntergang, Szenen und ihre kleinen lokalen
Animationen bleiben erhalten. Die Farben der Grundstückskanten werden nur
bei einem neuen kleinen Zeitabschnitt berechnet, nicht in jedem Bild.

`hills-evening` prüft zusätzlich, dass die Fahrt keine Canvas-Flächen anlegt
oder beschreibt: Eine bloß wiederverwendete, aber ständig neu bemalte Fläche
kann weiterhin teure Texturübertragungen auslösen. Die vollständige Kontur
wird auf den ursprünglichen Verlauf und ihre maximale Steigung geprüft.
`hills-neighborhood` fährt eine ganze Runde und prüft Tragflächen und Sicht.

Ein Vergleich im Browser mit zweifacher CPU-Drosselung ergab:

| Messgröße | Gemeldete Ruckelversion | Korrektur |
| --- | ---: | ---: |
| Erzeugte Canvas-Flächen | 109 | 35 |
| Rechnerische RGBA-Flächengröße | 74,4 MiB | 21,0 MiB |
| Schreibzugriffe auf Hilfsflächen in 240 Fahrbildern | 112 | 0 |
| 95. Perzentil der Zeichenzeit, Runde 1 / 3 | 18,1 / 18,4 ms | 14,0 / 9,2 ms |

Die Bildabstände lagen in diesem Cloud-Vergleich überwiegend bei 16,7 ms,
im 95. Perzentil bei 33,4 ms. Das starke Ruckeln des echten Geräts wurde hier
nicht identisch reproduziert; die strukturellen Mehrkosten sind beseitigt.
Die Flächengröße ist eine Berechnung aus Pixelmaßen, keine VRAM-Messung.
Die alte Version vor dem Abendlicht wurde als zusätzliche Referenz erfasst;
ihre Bildabstände sind wegen eines gleichzeitig laufenden Tests nicht direkt
vergleichbar. Handy-FPS bleiben vom konkreten Gerät abhängig.

Belege: [Vergleich und Prüfungen](evidence/hills-stutter-fix.json).

Die kaum sichtbare Glasvilla wurde auf Wunsch entfernt. Ihre Grafikfläche
von 500 × 400 Pixeln (rechnerisch 0,76 MiB RGBA) wird nicht mehr angelegt.
Die Sonnenuhr wird aus wenigen Formen direkt gezeichnet.
