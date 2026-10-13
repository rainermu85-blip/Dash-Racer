# Mobile Lenkung, Turbo und Pause

Während Countdown und Rennen steuert jede freie Stelle der linken oder rechten
Spielhälfte in die entsprechende Richtung. Ein Finger kann über die Mitte
wechseln. Pfeile unten bleiben als Orientierung und Trefferflächen erhalten;
nur die Pfeilsymbole werden bei Eingabe dezent eingefärbt. Die großen farbigen
Flächen hinter den Pfeilen und die Trennlinie entfallen.

Der rote Knopf mit gelbem Blitz und der Beschriftung „TURBO“ ist ein weiterer
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

Die 44 × 44 Pixel große Pausetaste liegt oben zwischen Runde und Tempo.
Sie pausiert auch den Countdown. Beim Fortsetzen bleiben die alten Eingaben
freigegeben. Turbo, Pause, Tastatur und die Skala sind per Beschriftung für
Hilfstechniken zugänglich. In Menüs bleiben die zusätzlichen Rennbuttons
verborgen. Der 64-Pixel-Turbo-Knopf steht oberhalb des Autos; bei kurzen
Bildschirmen wird die Skala kompakter und etwas höher platziert.

`scripts/assess-game.cjs controls` verwendet echte Chromium-Touchereignisse.
Die Prüfung beobachtet Lenkung im oberen Bildschirmteil, Seitenwechsel,
unabhängige Finger und Tastatur, beide Turbo-Auslöser, Dauer des Knopffeedbacks,
leere Ladungen, Abbruch, Fokusverlust, Pause, Countdown und Menüs. Fahransichten
und Abstände werden bei 320 × 640, 390 × 844 und 480 × 800 kontrolliert.

Kameraprojektion, Blickvorschau, Fahrphysik und Countach-Grafiken wurden nicht
geändert. Die Einschätzung dieser Gestaltung erfolgt getrennt von der
Bedienungsänderung.
