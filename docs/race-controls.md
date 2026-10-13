# Mobile Lenkung, Turbo und Pause

Während Countdown und Rennen steuert jede freie Stelle der linken oder rechten
Spielhälfte in die entsprechende Richtung. Ein Finger kann über die Mitte
wechseln. Pfeile unten bleiben als Orientierung und Trefferflächen erhalten;
nur die Pfeilsymbole werden bei Eingabe dezent eingefärbt. Die großen farbigen
Flächen hinter den Pfeilen und die Trennlinie entfallen.

Der rote Knopf mit gelbem Blitz ist ein weiterer
Auslöser. Die bisherige Skala funktioniert ebenfalls. Beide speisen dieselbe
Boost-Eingabe; Ladungen, Boost-Dauer und Geschwindigkeit werden nicht geändert.
Ein kurzer Tap bleibt bis zum nächsten Simulationsschritt vorgemerkt, damit
auch schnelle Betätigungen funktionieren. Bei vorhandenem, verfügbarem Turbo
verbraucht er einmalig eine Ladung.
Der rote Knopf bleibt für die tatsächliche Turbo-Dauer eingedrückt und zeigt
einen örtlichen Lichtschein, auch nach dem Loslassen. Ohne Ladung bleibt er
sichtbar, wird zurückgenommen dargestellt und gibt keinen freien Turbo.

Ein eigener Eingabeschlüssel pro Finger und Tastaturtaste verhindert, dass
das Loslassen eines Fingers eine andere gehaltene Eingabe löscht. Turbo und
Skala starten keine Lenkung. Zeigeraufnahme hält eine begonnene Geste bis zum
Loslassen; Abbruch, Fokusverlust, Pause, Neustart und Verlassen räumen Eingaben
auf. Bildschirmmenüs und Buttons werden von der Lenkfläche ausgenommen.

Die 44 × 44 Pixel große Pausetaste liegt in einer eigenen Zelle oben rechts.
Sie pausiert auch den Countdown. Beim Fortsetzen bleiben die alten Eingaben
freigegeben. Turbo, Pause, Tastatur und die Skala sind per Beschriftung für
Hilfstechniken zugänglich. In Menüs bleiben die zusätzlichen Rennbuttons
verborgen. Skala und Knopf stehen mittig auf einer gemeinsamen vertikalen Achse in einer
halbtransparenten Thermometerform. Der Knopf ist 2,2-mal so breit wie die
16-Pixel-Skala (35,2 Pixel). Er trägt nur einen Blitz, der frühere Blitz oberhalb
der Skala entfällt. Die gesamte Anzeige liegt bei 48 Prozent Bildschirmhöhe,
zehn Prozentpunkte tiefer als vorher. Auf kurzen Bildschirmen gilt 38 statt
28 Prozent; dort bleibt die Skala kompakter.

`scripts/assess-game.cjs controls` verwendet echte Chromium-Touchereignisse.
Die Prüfung beobachtet Lenkung im oberen Bildschirmteil, Seitenwechsel,
unabhängige Finger und Tastatur, beide Turbo-Auslöser, Dauer des Knopffeedbacks,
leere Ladungen, Abbruch, Fokusverlust, Pause, Countdown und Menüs. Fahransichten
und Abstände werden bei 320 × 640, 390 × 844 und 480 × 800 kontrolliert.

Der HUD zeigt Platzierung, Runde und Tempo in einer klaren oberen Zeile mit
vergrößerten Werten. Darunter liegen die schlanke Rennfortschrittsanzeige mit
Prozentwert und die Rundenzeiten im Format `mm:ss.cc`. Die laufende Runde wird
hell hervorgehoben, die beste abgeschlossene Zeit cyan. Die Segmentangabe steht
klein unten links, im Space-Level darüber die Energieanzeige. Die bereits
verwendete Schrift Press Start 2P liegt jetzt lokal einschließlich OFL-Lizenz
unter `public/fonts`, damit kein externer Schriftabruf erforderlich ist.

Die Browserprüfung kontrolliert zusätzlich Schriftladen, Textbreiten, den
Abstand der oberen Zeilen, die neue Turbo-Position, aktuelle/beste Rundenzeit,
Fortschritt und die Anpassung an Dream Odyssey und Space.

Countach-Grafiken bleiben unverändert. Kameravorschau und Gegnerprofile sind in
`camera-and-opponent-balance.md` beschrieben.
