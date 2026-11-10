# Paradise Circuit: bewohnte Inseln und Flughafen

Stand: 10. November 2026.

Der Flughafen hat nach dem Wegweiser eine offene Einfahrt bei Segment 1122
(ursprüngliche Szenenadresse 1472). Zwei Torpfeiler, zurückgeschwenkte
Gitterflügel und ein schmaler Dachträger fassen die Einfahrt. Alle vier Spuren
bleiben frei. Der vordere Drahtzaun endet an der seitlichen Einfriedung; deren
Schienen und Pfosten folgen dem Boden am Rand des Flughafengeländes. Die
Torpfeiler verwenden dieselbe Randkontaktregel für Spieler und Gegner.

Das neue Schild hat eine helle Fläche, dunkle Schrift, ein großes
symmetrisches Flugzeug-Piktogramm und einen einzelnen Richtungspfeil. Als
Online-Referenzen wurden die SVG-Piktogramme von
[Maki](https://github.com/mapbox/maki/blob/main/icons/airport.svg) und
[Google Material](https://github.com/google/material-design-icons/blob/master/src/maps/local_airport/materialicons/24px.svg)
aufgerufen und geprüft. Die Canvas-Grafik und das Schildlayout werden lokal
gezeichnet; es gibt keinen neuen Bildabruf beim Spielen. Flughafen-Fotoseiten
auf Wikipedia/Wikimedia waren durch die Netzfreigabe nicht erreichbar. Ein
Entwurf ergänzt dafür die drei Domains; er ist noch nicht aktiviert.

## Häuser und Palmen

Die drei großen Häuser der ersten Insel unterscheiden sich jetzt in ihrer
Bauform: ein korallenfarbenes Verandahaus, ein niedriges Gästehaus mit
Blechdach und Giebeln sowie ein kleiner Insel-Laden mit zentralem Giebel,
Streifenmarkise und Paketen. Dachfirste und Traufen sind waagerecht; die
alte ungleichmäßige Dachfläche ist entfernt. Verandapfosten, Fensterläden,
Pflanzkästen und Gartenpflanzen bleiben in den vorhandenen Grafikdateigrößen.
Auch die kleinen Dorfhäuser haben symmetrische Dachkanten.

Die Palmen behalten die gefiederten Ocean-Drive-Blätter. Drei dezente,
vorgezeichnete Varianten ändern Neigung, Stammform und Höhe; zusätzlich sind
Kokosnüsse sichtbar. Der bestehende Miami-Palmenzeichner bleibt unverändert,
die Transformationen gelten nur innerhalb der Paradise-Grafiken.

## Erkennbare Tätigkeiten

| Segment | Szene | Sichtbare Tätigkeit |
| --- | --- | --- |
| 42 | Kanu am Strand | Paddel, Ausleger und zwei Personen beim Vorbereiten und Verschnüren |
| 135 | Sandburg | Kniende Kinder, Schaufel, Eimer und eine niedrige Burg |
| 235 | Bootswerkstatt | Boot auf Böcken, Farbdosen und ein bewegter Pinsel |
| 265 | Kokosstand | Früchte, Arbeitsplatte, Verkäufer und ein Kunde mit Getränk |

Die neuen Szenen liegen auf der besser einsehbaren Kurvenseite oder vor
verdeckenden Gebäuden. Ruhende Strandgäste lesen beziehungsweise liegen unter
dem Schirm. Die vier Tätigkeiten verwenden unterschiedliche Gegenstände und
Posen; ihre kleinen Handbewegungen laufen über die Rennzeit.

## Thai-Bucht

Drei Longtail-Boote liegen bei den Segmenten 918, 2395 und 2520. Langer
Holzrumpf, hochgezogener Bug, Stoffbänder, Sonnendach und freiliegender
Motor mit langem Propellerschaft bestimmen die Silhouette. Zwei Dachformen
und Farben variieren sie. Die Platzierung wurde während einer ganzen Runde
überprüft; zwei ursprüngliche Standorte verdeckten die Boote hinter Häusern
oder dem Felsenbogen und wurden deshalb ersetzt. Die Boote bleiben auf der
vorhandenen Meereshöhe.

Ein einzelner Springer steht auf einer niedrigen Felsstufe bei Segment 958.
Beim Heranfahren setzt eine einmalige Folge aus Absprung, Drehung, Eintauchen
und Wasserfontäne ein. Der Sprung führt von der Felsseite ins offene Wasser.
Die Zeit startet bei Annäherung, läuft mit der Simulation und wird beim
Neustart zurückgesetzt. Durch die Auswahl der Felsseite und des Standorts
bleiben sowohl Flugphase als auch Spritzer vor den übrigen Felsen und dem
Brückengeländer sichtbar. Es gibt keinen Eingriff in die Meeresperspektive.

## Rendering und Prüfung

Neue Gebäudedetails, Boote, Tor und Geräte werden beim Streckenaufbau in den
bestehenden Grafikcache gezeichnet. Die seitliche Einfriedung hat wenige
projizierte Drähte und Pfosten statt eines flimmernden Vollgitters. Kleine
Handbewegungen, Propeller und Spritzer sind begrenzte Vektoranimationen.
Der Cache liegt bei etwa 13,86 MiB RGBA-Pixeln; das erweiterte Limit beträgt
14 MiB. Das ist kein Gesamtwert für Browser- oder GPU-Speicher.

Die Rennprüfung vergleicht die vollständig gerenderten Bilder mit und ohne
den animierten Springer. So fällt auch eine Flugphase oder Fontäne auf, die
zwar projiziert wird, danach aber von Felsen, Straße oder Geländer verdeckt
wird. Zusätzlich werden die vier freien Spuren unter dem Flughafentor,
Rennende, Gegenverkehr, Pause, Levelwechsel und die unveränderte statische
Grafikablage geprüft. Leistungsproben schließen die erste Insel, Einfahrt
und Thai-Bucht ein. Screenshots ergänzen die Messungen.

Die drei neuen Streckenideen stehen getrennt als
[ausgearbeitete Konzepte](level-concepts/README.md) bereit: Macondo,
Orbital Passage und Coast to Coast. Sie sind noch keine spielbaren Level.

Die Nachweise liegen in `docs/evidence/paradise-inhabited-*.json`: Rennen,
Gegenverkehr, Levelwechsel, Szenenansichten und Leistungsproben. Die zwölf
allgemeinen Leistungsproben vor der Draht-Bündelung und zwei gezielte
Flughafenproben danach sind getrennt aufgezeichnet. Nach der Bündelung liegen
Median-Frameabstände in den beiden Flughafenproben bei etwa 16,7 ms. Native
Renderarbeit am 95. Perzentil beträgt 9,8 ms an der Einfahrt und 6,8 ms innen;
mit 2× CPU-Drosselung sind es 12,4 und 8,4 ms. In diesen gezielten Proben gab
es keine Frameabstände über 50 ms. Die vorangegangene allgemeine 2×-Probe
enthält dagegen einzelne solche Ausreißer, unter anderem auf der ersten Insel.
Das sind kurze Cloud-Chromium-Messungen, keine Messung auf einem echten Handy
oder in Brave. Gezielte Wiederholung:

```sh
PROFILE_SECTIONS=airport-gate,airport CPU_RATE=2 node scripts/profile-paradise.cjs
```
