# Dream Odyssey: Weltenportale

Das Level startet direkt in der Arktis. Der bisherige Tundrastart und der
erste Übergang bei Segment 450–749 gehören jetzt zur offenen Arktislandschaft.
Kurven, Höhenprofil, Streckenlänge, Itempositionen und Zielposition bleiben
erhalten. Der Anfang trägt spärliche Büsche und Felsen, später folgen die
vorhandenen Schneebäume. Zwei Tunnel verbinden die Arktis mit Dalí
(1250–1549) und Dalí mit der Unterwasserwelt (2050–2349).

Die Tunnel besitzen gewölbte, facettierte Querschnitte und eigene massive
Fassaden. Gleichmäßige Wandmaterialien ersetzen die wechselnden hellen und
dunklen Segmente. Tragende Bögen stehen in größeren Abständen; kleine
Deckenleuchten ersetzen die großen transparenten Lichtkegel. Der vorhandene
Farbwechsel zwischen den Welten bleibt erhalten. Die Baukörper werden in
derselben Tiefenreihenfolge wie die Straße und die Gegner gezeichnet.

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

## Prüfung

`node scripts/assess-game.cjs portals` prüft beide Fassaden an Einfahrt und
Ausfahrt in Hoch- und Querformat mit echten Canvas-Pixeln. Weitere Prüfungen
erfassen den offenen Arktisstart, vorab sichtbare Tunnel, endliche und
begrenzte Projektionen an allen vier Mündungen sowie dekorative Animationen
ohne Änderungen an Fahrzustand oder Items. Die 22 Prüfungen bestanden;
der maximale gemessene Koordinatenausschlag lag bei rund 12.881 Pixeln.

Zusammen mit Mechanik (23), Kollisionen (59), Kapiteln (27), Gegnerprojektion
(17) und dem Highway-Tunnel (15) bestanden 163 Prüfungen. Produktionsbuild
und Leerzeichenprüfung bestanden ebenfalls. Einfahrt, Inneres und Ausfahrt
wurden bei 390 und 480 Pixel Spielfeldbreite visuell kontrolliert.
Reguläre Browserdurchfahrten beider Tunnel mit Renngegnern verliefen ohne
JavaScript-Fehler bis in die jeweilige nächste Welt. In dieser Cloud-Prüfung
lagen die medianen Renderzeiten bei 3,6–3,9 ms und die Bildrate bei rund
55–59 FPS. Das sind Messungen der Prüfumgebung, keine Endgerätegarantie.
