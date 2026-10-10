# MIDTOWN LINK

Midnight Highway erhält einen gemeinsamen Tunnel über beide Fahrbahnen.
`HIGHWAY_TUNNEL` begrenzt ihn auf die Segmente 490–719; die Länge beträgt
34.500 Welteinheiten. Das entspricht 7,99 Sekunden bei 402 km/h beziehungsweise
9,58 Sekunden beim früheren Grundtempo von 335 km/h. Kontakte und Boosts
können diese Dauer wie auf der restlichen Strecke verändern.

Die Rennstrecke behält ihre drei Spuren und Begrenzung bei ±0,88. Die linke
Gegenfahrbahn besitzt ebenfalls drei markierte Spuren; normale Autos und
der Polizeiwagen nutzen die passenden Spurmitten. Alle sechs Spuren liegen
unter einem Dach. Säulen bestehen aus Vorderseite und zwei Tiefenflächen
und füllen ausschließlich den vorhandenen Mittelstreifen. Durch die
Lücken zwischen ihnen bleibt die andere Fahrbahn sichtbar.

Die fotografische Referenz bestimmt die warmen goldgelben Wandflächen,
dunkle Decke, regelmäßige rechteckige Leuchten und kleine grüne
Notausgangsdetails. Die Portalöffnungen sind breite flache Schlitze in
massiven Betonpodien mit seitlichen Stützwänden, Fugen, Tiefenstützen,
gestaffelten Dachaufbauten und Lüftungsbänken. Die gemeinsame Öffnung bleibt
vollständig frei. Reklame, Stadtlampen und Türme werden in Tunnelabschnitten
nicht erzeugt. Die Baukörper sind in die Tiefenreihenfolge der Straße
eingefügt und schon während der Annäherung sichtbar.

Die Kamera, Fahrphysik und kontinuierliche Gegnerprojektion bleiben erhalten.
Tunnelgeometrie wird an der Nahgrenze von 64 Welteinheiten begrenzt, bevor
extrem nahe Wand- oder Portalpunkte entstehen. Die Übergangsprüfung erreicht
maximal rund 25.417 Pixel Koordinatenausschlag, statt über einer Milliarde
beim unbeschnittenen letzten Tunnelsegment. Gemeinsame Kanten der großen
Flächen überlappen geringfügig, damit zwischen den Flächen keine Stadtlichter
durchscheinen. Kleine Decken- und Wanddetails benötigen diese zusätzliche
Kantenzeichnung nicht.

Die zuvor ergänzten Asphaltfugen, Leuchtreflektoren und Straßenlichtreflexe
sind entfernt. Die kürzeren Fahrbahnmarkierungen bleiben und sind um
25 Prozent breiter, im Tunnel in warmem Weiß.

`node scripts/assess-game.cjs tunnel` ergänzt 15 Browserprüfungen:
Dauer und Position, gemeinsame Decke und sechs Leuchtenreihen, massive
Säulen auf dem Mittelstreifen, freie Sicht durch ihre Lücken, offene
Portalspuren, endliche Projektionen an Einfahrt/Ausfahrt, sichtbare
Tunnelgeometrie schon bei der Annäherung, unveränderte Fahrbahnbegrenzung,
Durchfahrt ohne automatische Tempopenalty und Abgrenzung zu anderen Leveln.
Zusammen mit Kapitel, Gegnerprojektion, Mechanik und Kollisionen bestanden
141 Prüfungen. Der Produktionsbuild und die Leerzeichenprüfung bestanden.

Einfahrt, Inneres und Ausfahrt wurden bei 390 und 480 Pixel Spielfeldbreite
kontrolliert. Ein regulärer Browserlauf mit Renngegnern, Gegenverkehr und
Polizei durchfuhr die Passage bis zurück in die Stadt ohne JavaScript-Fehler.
In der Cloud-Prüfumgebung erreichte dieser Lauf rund 51 FPS mit 7,6 ms
medianer Renderzeit und 12,1 ms beim 95. Perzentil. Die Passage dauerte
mit den tatsächlichen Rennkontakten rund 8,8 Sekunden. Dies beschreibt
die Prüfumgebung und keine Messung auf dem Endgerät des Nutzers.
