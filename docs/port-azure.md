# Port Azure: kleines Hafenstädtchen

Port Azure ist die vierte Insel von Paradise Circuit, Segment 1575 bis 1924.
Die Überarbeitung stärkt den Unterschied zum Südseedorf auf der ersten Insel
und zum Strandresort auf Coral Cay.

## Stadt und Kai

Sechs Häusergruppen bilden zwölf schmale Fassaden: unterschiedlich hohe
Putzfassaden, ziegelgedeckte Dächer und Giebel, Fensterläden, Markisen,
Blumenkästen und kleine Ladenschilder. Seemannsladen, Bäckerei, Gasthaus und
Hafencafé ersetzen die frühere Folge gleichartiger Ferienhäuser. Die
Häusergruppen stehen überwiegend auf der anfänglichen Hafengeraden; spätere
Gruppen nutzen die besser einsehbare Kurvenseite. Eine Bank und Korbdetails
gehören zur Hausgrafik.

Am Kai liegen Stein- und Pflasterfarben statt des bisherigen Strand-/Grünstreifens.
Die Kante folgt genau der bestehenden Küstenlinie. Straßenverlauf, Meereshöhe,
Projektion, vier Spuren und Gegenverkehr behalten ihre bisherigen Regeln.
Kleine Hafenlaternen, Poller, Taue und Kisten ergänzen die Promenade. Die
Palmen stehen lockerer, damit sie Häuser, Werkstatt und Kran freigeben.

| Szene | Segment | Inhalt |
| --- | --- | --- |
| Fischmarkt | 1605 | Überdachter Fischverkauf, Auslage, Waage und Verkäufer bei der Arbeit |
| Bootsschuppen | 1695 | Offene Werkstatt mit Netzen, Kisten, einem unfertigen Boot und einem Arbeiter mit Handwagen |
| Kleiner Hafenkran | 1750 | Langsam bewegte Kiste, Haken, Seil und ein Dockarbeiter mit Führungsleine |
| Fischerboot am Kai | 1780 | Niedriges Steuerhaus, Fangnetze, Mast, Fender und Arbeitsdeck |
| Uhrturm | 1785 | Erhaltener Orientierungspunkt über den kleineren Fassaden |
| Leuchtturm | 1815 | Erhaltener Blickfang am späteren Küstenabschnitt |

Das bisher kantige Fischerboot wurde im vorhandenen Grafikplatz überarbeitet;
auch sein Einsatz an der folgenden Brücke verwendet diesen Entwurf. Das
allgemeine Strandbar-Gebäude, eine Ferienvilla, die Dorfgruppe und die Reihen
stehender Touristen sind in Port Azure durch die Hafenszenen ersetzt. Café,
Fischer und Trockennetze bleiben passende Teile des Ortes.

## Sichtbarkeit und Kosten

Fischmarkt und Werkstatt liegen auf der Geraden, der Kran auf der Außenseite
der ersten Kurve. Ein verdeckendes Haus und zusätzliche Palmen wurden dort
versetzt beziehungsweise entfernt. Der Ausleger zeigt über die Kaifläche;
Haken und Kiste sind zur Straße hin sichtbar. Alle Fußpunkte liegen außerhalb
der Rennspuren, die Laternen bleiben neben der Straße.

Häuser, Werkstatt, Markt, Laternen und Kran werden einmal in den bestehenden
Grafikcache gezeichnet. Die drei Häusergrafiken brauchen durch die kompaktere
Rasterung weniger Speicher als die früheren Hafenfassaden. Zusammen mit den
vier neuen Grafiktypen und entfernten unbenutzten Varianten bleibt der Cache
bei ungefähr **13,87 MiB RGBA-Pixeln**, knapp über dem vorherigen Stand von
13,86 MiB und weiter unter dem 14-MiB-Limit. Dies beschreibt nur den
Grafikcache, nicht den gesamten Browser-/GPU-Speicher.

Handwagen, Fischverkäufer und Kran haben kleine, über die Rennzeit gesteuerte
Vektorbewegungen. Pause friert die Bewegungen ein; es gibt keine animierten
Textur-Uploads und keine neuen bildfüllenden Effekte.

## Prüfung

Die vorhandene Paradise-Rennprüfung enthält neue Anfahrtsbilder von Markt,
Werkstatt, Kran und Fischerboot sowie Bewegungs-/Pausenprüfungen der drei
Arbeitsanimationen. Eine zusätzliche Fahrt vergleicht die fertig gezeichneten
Bilder mit und ohne das jeweilige Objekt. Damit fallen vollständige
Überdeckungen durch Häuser, Palmen und Straße auf, die ein reiner
Bounding-Box-Test übersehen würde. Die Bilder wurden zusätzlich angesehen.

`docs/evidence/port-azure-*.json` dokumentiert die Rennprüfung, den gemeinsamen
Gegenverkehr, Levelwechsel, Sichtbarkeit und gezielte Leistungsproben.
Die bestehenden Grenzen für statischen Cache-Speicher und Grafikschreibzugriffe
werden weiter geprüft.

Die gezielten Cloud-Chromium-Proben für Anfahrt, Kai und Ausfahrt enthalten
native Median-Frameabstände von ungefähr 16,7 ms; die Renderarbeit am
95. Perzentil liegt zwischen 9,0 und 11,4 ms. Mit 2× CPU-Drosselung liegen die
Mediane ebenfalls bei etwa 16,7 ms, die 95.-Perzentil-Frameabstände bei
33,3–33,4 ms und die Renderarbeit bei 13,0–14,0 ms. Nativ gab es keine
Frameabstände über 50 ms, gedrosselt je einen bei Anfahrt und Kai. Diese kurzen
Proben sind keine Messung auf einem echten Handy oder in Brave.

```sh
PROFILE_SECTIONS=harbour,harbour-quay,harbour-exit CPU_RATE=2 node scripts/profile-paradise.cjs
```
