# Dream Odyssey: Weltenportale

Das Level beginnt wieder in der kargen Tundra (0–449), mit wenigen Büschen
und Felsen. Ein Granittunnel (450–659) führt in die verschneite Landschaft
mit Tannen (660–1319). Danach folgen das Dalí-Portal (1320–1489), die
Dalí-Landschaft (1490–2139), die Meeresschleuse (2140–2309) und die
Unterwasserwelt bis zum Ziel. Kurven, Höhenprofil, Streckenlänge,
Itempositionen und Zielposition bleiben erhalten.

Die Tunnel besitzen gewölbte, facettierte Querschnitte und eigene massive
Fassaden. Gleichmäßige Wandmaterialien ersetzen die wechselnden hellen und
dunklen Segmente. Tragende Bögen stehen in größeren Abständen; kleine
Deckenleuchten ersetzen die großen transparenten Lichtkegel. Der vorhandene
Farbwechsel zwischen den Welten bleibt erhalten. Die Baukörper werden in
derselben Tiefenreihenfolge wie die Straße und die Gegner gezeichnet.

Der erste Tunnel trägt ein Alpenmotiv: eine große Granitfassade mit
unregelmäßigen Felsfacetten, Steinbockreliefs mit gebogenen geriffelten
Hörnern, Edelweiß und sparsamen Schneekappen. Der asymmetrische Querschnitt,
Mineraladern, Quarzeinschlüsse, Wandreliefs und kleine bronzene Laternen
setzen sich im Inneren fort. Gedämpftes warmes Licht wandelt sich langsam
in die kühle Palette der Schneeausfahrt. Die neue Dekoration verursacht
keine zusätzlichen Kollisionen oder Tempopenalties.

Das Dalí-Portal trägt geschichtete Steinfacetten, asymmetrische Obelisken und
ein Augenrelief. Im Tunnel schweben Perlen in Wandnischen und goldene
Orbitalmobiles hängen unter der Decke. Die Meeresschleuse besitzt eine
gerundete Stahlfassade, Nieten, Ventilräder und ein Druckinstrument.
Bullaugen mit bewegten Wasserlinien und Fischsilhouetten, Messingrohre,
Wandinstrumente und kleine leuchtende Zellen ergänzen das Innere.
Alle neuen Objekte sind Dekoration. Sie erzeugen keine Kollisionen oder
zusätzlichen Tempopenalties. Langsame Animationen nutzen die vorhandene
Spielzeit `chapterTime`, die während einer Pause stehen bleibt.

Die Tunnelhöhe wird aus Weltkoordinaten projiziert statt an die Bildschirmbreite
gekoppelt. Die Nahgrenze liegt wie beim Highway-Tunnel bei 64 Welteinheiten.
Große Wandflächen schließen ihre gemeinsamen Kanten, damit keine Sterne
durch feine Rasterspalten sichtbar werden. Portalöffnungen bleiben frei;
das Unterwasserglas ist weiterhin schon vor dem Verlassen der Schleuse
über der Ausfahrtskuppe sichtbar. Kamera, Turbo und Kollisionsmodell bleiben
erhalten, einschließlich der Glasbegrenzung in der Unterwasserwelt.

Die Überarbeitung vom 15. Oktober verkürzt die Tunnel bei unveränderter
Gesamtstrecke, vergrößert Kronleuchter und Nischen und ergänzt Landschaften,
Tiere und Fahrereignisse; siehe [Streckenüberarbeitung](course-polish.md).

## Prüfung

`node scripts/assess-game.cjs portals` prüft alle drei Fassaden an Einfahrt
und Ausfahrt in Hoch- und Querformat mit echten Canvas-Pixeln. Weitere
Prüfungen erfassen die Abfolge Tundra–Granitpass–Schneetannen, vorab sichtbare
Tunnel, endliche und begrenzte Projektionen an allen sechs Mündungen sowie
dekorative Animationen ohne Änderungen an Fahrzustand oder Items.

Die 26 Portalprüfungen bestanden. Zusammen mit Mechanik (23), Kollisionen
(59) und Kapiteln (27) bestanden 135 Prüfungen. Produktionsbuild und
Leerzeichenprüfung bestanden ebenfalls. Tundrastart, Einfahrt, Inneres und
Schneeausfahrt wurden bei 390 und 480 Pixel Spielfeldbreite visuell
kontrolliert. Eine reguläre Browserdurchfahrt mit Renngegnern führte von
Segment 400 durch den Granittunnel bis Segment 852 ohne JavaScript-Fehler.
