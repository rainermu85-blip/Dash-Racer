# Sunset Hills: bewohnte Hänge

Die zuvor weitgehend leere Hügelfläche enthält jetzt mehrere bewohnte Hanglagen
mit eigenen Zufahrten, Gärten und gestaffelten Villenterrassen. Die Bebauung
beginnt im ersten sichtbaren Panoramabereich. Der Schriftzug und die Häuser
bleiben fest mit derselben zwischengespeicherten Landschaft verbunden.

## Unterschiedliche Abschnitte

| Streckenbereich | Charakter und Blickfänge |
| --- | --- |
| 30–120 | SUNSET PLAZA: offene Einkaufsstraße mit Schaufenstern, schwarzen Markisen und Messinglaternen |
| 120–220 | Rosa PINK PALACE mit grün-weißen Markisen, eigener Vorfahrt, Limousine und Portier; anschließend private Villen |
| 220–400 | Heckengärten, Zypressen, Brunnenhof und SUNSET TENNIS |
| 400–522 | Aussichtsterrasse und großes Anwesen vor der Umleitung |
| 522–765 | Bestehende schmale Umleitung mit hohen Grundstücksmauern |
| 765–960 | Offene Aussichtsgeländer, weiterer Aussichtspunkt und moderne Poolvilla |
| Ab 960 | Moderne Villen, dunklere Tore, Agaven und Pergola mit Gartenskulptur |

Die neun größeren Blickfänge liegen bei 135, 225, 345, 435, 490, 865, 930,
1000 und 1060. Dazu kommen sechs Ladenensembles bei 48, 60, 72, 84, 96 und 108. Ihre Straßenseite ist auf die Sicht in der jeweiligen Kurve
abgestimmt. Die Brunnenanlage steht vor der Baustelle und wird nicht vom
Baustellengatter verdeckt. Andere Häuser halten auf derselben Straßenseite
Abstand zu diesen größeren Grundstücken.

## SUNSET PLAZA und PINK PALACE

Die Einkaufsstraße ersetzt die bisherigen Villen am Anfang. Drei verschiedene
Ladenpaare verbinden Deco-Fassaden, große goldgerahmte Auslagen, Mode,
Schmuck und Schallplatten. Offene Gehwege ersetzen hier die Grundstücksmauern;
Laternen tragen SUNSET-PLAZA-Banner. Die Wohnviertel danach bleiben erhalten.

Das Hotel bei 135 besitzt gestaffelte rosa Flügel, eine Deco-Krone, Balkone,
einen grün-weiß gestreiften Portikus und zwei schlanke Palmen. Ein Portier,
Gepäckwagen und eine geparkte Achtziger-Limousine stehen an der Vorfahrt.
Der verlängerte, breitere Hotelgrund trägt auch die projizierte Vorfahrt
mit bepflanzter Mittelinsel. Fassaden und Details werden in vier kleinen
Canvas-Bildern vor der Fahrt vorbereitet.

## Bodenkontakt

Jedes Grundstück besitzt eine feste Höhenebene über seinem gesamten
Höhenprofil. Eine flache Plattform trägt Gebäude, Garten und Zufahrt;
Stützmauern reichen bis unter das tatsächliche Gelände an beiden Kanten.
Die Flächen werden abschnittsweise mit der Straße projiziert und in ihrer
Tiefenreihenfolge gezeichnet. Der gezeichnete Hausfuß verwendet dieselbe
Weltebene wie die Plattform. Bepflanzung und Wagen innerhalb des Grundstücks
stehen ebenfalls auf dieser Ebene.

Die Hausgrafik enthält nur das Gebäude samt durchgehendem Sockel. Früher
abgeschnittene Gartenstücke und halbe Sträucher sind entfernt. Pools und
Gärten werden als eigene Flächen vor dem Haus gezeichnet. Auch die kleinen
Häuser im Panorama haben breite Terrassen und Stützmauern, die die Hanghöhe
an beiden Hausecken berücksichtigen.

Die seitlichen Bodenflächen übermalen nicht mehr die gesamte dahinterliegende
Wohnlage. Die vorhandene Fernsichtblende verhindert weiterhin freischwebende
Straßenbänder. Strecke, Fahrtempo, Kamera, KI und Kollisionsmodell sind für
diesen Umbau unverändert.

## Prüfung und Zeichenlast

`node scripts/assess-game.cjs hills-neighborhood` prüft die Tragflächen über
dem ganzen Hangprofil, Grundstücksabstände, die tatsächliche Deckung von
gezeichnetem Hausfuß und Plattform sowie die Sichtbarkeit aller fünfzehn
Blickfänge einschließlich der neuen Ladenfronten. Eine vollständige Runde fährt mit echten Physikschritten und
Lenkeingaben; die dabei gespeicherten Bilder wurden kontrolliert.

`hills-stability` und `detour` prüfen zusätzlich die frühere Fahrzeugunruhe,
Straßenbänder, Asphaltkanten, Mauerschnittkanten und die Umleitung. Der
Straßenbandtest untersucht die Straßenebene separat: Die ehemals leere
Bildregion enthält jetzt beabsichtigte Hanghäuser.

Panorama und Hausvarianten werden vor der Fahrt vorbereitet. Unsichtbare
Terrassen und Mauern werden übersprungen. Die Stichprobe an fünf gleichen
Streckenstellen benötigt insgesamt weniger Zeichenoperationen als die
Vorgängerversion; die zusätzliche Projektion kostet CPU-Zeit. Cloudmessungen
sind keine Aussage über die Bildrate auf einem bestimmten Handy.

Messwerte und Prüfresultate: [Belege](evidence/hills-neighborhood-2026-11-03.json).

Die Erweiterung vom 5. November wurde zusätzlich in einer vollständigen
Physikrunde mit 17 gespeicherten Ansichten kontrolliert, darunter sechs
Ansichten vom Einkaufsboulevard bis hinter das Hotel. `hills-neighborhood`,
`hills-stability`, `detour` und der Produktionsbuild bestehen.
