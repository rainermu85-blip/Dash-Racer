# Ocean Drive: Felsküste, Pier und Durchbruch

11. Oktober 2026. Die vorhandene Felswand samt Kletterpflanzen wurde
überarbeitet. Das Streckenprofil, die Kamera, Grundtempo und Turbo sowie
der Übergang vom Sonnenuntergang zur Nacht über drei Runden bleiben erhalten.

## Felswand und Bewuchs

Die Küste verwendet wechselnde Querschnitte mit zurückgesetzten Felsfüßen,
Vorsprüngen, Rippen und unterschiedlich hohen Kämmen. Breite Einbuchtungen
und kürzere Rippen verändern die Silhouette. Die Querschnitte schließen
an der Rundengrenze kontinuierlich aneinander an. Schräg verlaufende
Steinplatten, Bruchlinien und abgerundete einzelne Felsblöcke ersetzen die
bisher gleichförmige schräge Wand mit ihrem durchgehenden Streifenmuster.

Der bereits vorhandene Bewuchs ist durch kleinere Gruppen mit hängenden
Stängeln, Blättern und gelegentlichen rosa Blüten ersetzt. Die Pflanzen
verankern sich auf der tatsächlichen projizierten Felsfläche. Kleine
Büsche wachsen am Fuß einzelner Felsblöcke. Die Steinfarben werden über
denselben Rennfortschritt wie der Himmel zur Nacht dunkler.

Felsen und Durchbruch verwenden eine Nahgrenze von 64 Welteinheiten.
Kanten der großen Flächen überlappen geringfügig gegen sichtbare Spalten.
Details und Pflanzen werden abhängig von ihrer projizierten Größe gezeichnet.

## Sichtbare Küstenorte

Der neue Holzpier steht bei Segment 375 im sanfteren Linksbogen nach der
Strandbar. Steg, Bohlen, Geländer, Pfähle, Lampen, Rettungsring und Pavillon
mit „OCEAN PIER“-Schild bilden einen zusammengehörigen Blickfang. Der Steg
läuft in die Bildtiefe aufs Wasser zu; der Pavillon bleibt damit während
der Annäherung im Spielfeld sichtbar. Die Startgerade erwies sich für die
ursprüngliche Ausrichtung als ungünstig, da der Pavillon zu schnell hinter
den rechten Bildrand wanderte.

Die Strandparty wurde von Segment 935 auf 840 versetzt, in den flachen
Linksbogen nach der langen Rechtskurve. Volleyball und Strandjeep folgen
bei 852 und 860. Die bestehenden Darstellungen mit Sonnenschirm tagsüber
und der beleuchteten Party in Runde drei bleiben erhalten. Vor beiden
Küstenorten werden Palmen ausgespart, damit sie die Annäherung nicht
verdecken. Strandbar, Eiswagen, Boote, Wal und Surfer bleiben erhalten.

Die Sichtbarkeit wurde durch normales Fahren mit der bestehenden Kamera
und ihrem bisherigen Kurvenverhalten geprüft. Die zusätzliche Browserprüfung
vergleicht fertige Frames mit und ohne Landmarke und zählt nur sichtbare
Pixel außerhalb der Turboanzeige; so genügt ein bloßer Aufruf der
Zeichenfunktion oder ein hinter Felsen verdecktes Objekt nicht.

## Natürlicher Felsdurchbruch

Die Straße führt in den Segmenten 506–541 durch einen kurzen Felsvorsprung
auf der mittleren Geraden. Die 36 Segmente entsprechen 1,25 Sekunden
bei 402 km/h. Eine unregelmäßige Öffnung in einem größeren Felskörper,
ein grob behauenes Gewölbe, Steinrisse und einzelne Pflanzen greifen die
Fotoreferenz auf. Durch die Ausfahrt bleiben Meer, Strand und Himmel sichtbar.
Die vollständige Geometrie ist bereits vor der Einfahrt sichtbar.

Im Durchbruch liegt die Fahrbahnbegrenzung auf beiden Seiten bei 1,05.
Links entspricht das der bereits vorhandenen Begrenzung an der Felswand;
außerhalb ist die rechte Seite weiter bis 1,45 offen. Dadurch kann der Wagen die rechte Felswand
nicht durchfahren. Die Asphaltgestaltung und Fahrspuren bleiben erhalten.
Eine normale Durchfahrt erzeugt keine zusätzliche Tempopenalty.

## Validierung

112 Browserprüfungen bestanden:

- `node scripts/assess-game.cjs coast`: 30 bei 390 × 844 und 480 × 800 Pixel
- `node scripts/assess-game.cjs collisions`: 59
- `node scripts/assess-game.cjs mechanics`: 23

Die Küstenprüfung erfasst Dauer, örtliche Begrenzung, freie Portalspuren,
sichere Projektion nahe Block- und Tunnelgrenzen, Annäherung, Durchfahrt
bei vollem Normaltempo, sichtbaren Pier und Party bei Tag und Nacht,
Felswandkontakt sowie die Trennung von allen anderen Leveln. Es traten
keine JavaScript-Fehler auf. Produktionsbuild und Leerzeichenprüfung bestanden.
Ein zusätzlicher Vergleich mit dem vorherigen Commit bestätigte identische
Streckenhöhen und Kurven, Kamerakonstanten, Geschwindigkeitseinstellungen
und Sonnenuntergangsphasen.

Eine getrennte Renderkontrolle in der Cloud bei 390 × 844 Pixel verglich
vier Positionen mit dem vorherigen Commit. Mit Abstand zwischen den Frames
lagen die medianen Renderzeiten vorher bei 19,5–26,0 ms, nachher bei
10,9–14,4 ms. Die neue Bepflanzung benötigt deutlich weniger Einzelpfade
als die vorherigen Blattgruppen. Das ist eine Messung der Prüfumgebung,
keine Leistungsgarantie für andere Geräte.
