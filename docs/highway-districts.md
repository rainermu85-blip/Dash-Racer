# Midnight Highway: zwei Stadtviertel

11. Oktober 2026. Vor MIDTOWN LINK dominieren dichte Häuserfronten; nach
dem Tunnel beginnt ein Industrieviertel. Die Grenze bildet der bestehende
Tunnel in den Segmenten 490–719.

Die Häuserfronten bestehen aus projizierten, zusammenhängenden Baukörpern
beiderseits der sechs Spuren. Unterschiedliche Gebäudehöhen, Seitenflächen,
Dachkanten, beleuchtete Wohnungen, Balkonbänder und Ladenfronten schaffen
eine dichte Stadtlandschaft. Kurze Gassen unterbrechen die Blöcke. Die
Gebäude enden mit Abstand vor dem Tunnelportal.

Nach dem Tunnel stehen niedrigere Lagerhallen mit Oberlichtern, Toren und
Stützrippen. In ihren Ladehöfen erscheinen Tankgruppen mit Leitungen und
Leitern, Container mit Portalkränen sowie Anlagen mit Schornsteinen und
Rohrgestellen. Die Platzierung nutzt die Lücken zwischen den Hallen,
damit diese die zusätzlichen Anlagen nicht verdecken. Leuchtreklame mit
den bisherigen unterschiedlichen Stilen bleibt in beiden Vierteln erhalten.

Auch die beiden Parallaxebenen der Skyline unterscheiden sich. Der Wechsel
von der Stadt zur Industrie erfolgt weich während der Tunneldurchfahrt;
die Industrie ist bereits durch die Ausfahrt sichtbar. Vor dem Rundenwechsel
kehrt die entfernte Stadtsilhouette sanft zurück. Die Vordergrundkulisse
bleibt bis zum Rundenende industriell.

Fassaden verwenden die Tiefenreihenfolge und Projektion der Fahrbahn sowie
dieselbe Nahgrenze von 64 Welteinheiten wie die Tunnelgeometrie. Sie liegen
außerhalb beider Fahrbahnen. Zusätzliche Anlagen verwenden die bestehende
Spriteprojektion und Hügelverdeckung. Kamera, Streckenprofil, Geschwindigkeit,
Kollisionen, Gegenverkehr, Polizei und Überführungen bleiben erhalten.

## Prüfung

Produktionsbuild und `git -c core.whitespace=cr-at-eol diff --check` bestanden.
Die bestehenden Browsersuiten bestanden mit 82 Prüfungen:

- `node scripts/assess-game.cjs chapter`: 27
- `node scripts/assess-game.cjs tunnel`: 15
- `node scripts/assess-game.cjs traffic`: 17
- `node scripts/assess-game.cjs mechanics`: 23

Fünf zusätzliche Browserkontrollen bestanden: Vergleich von Streckenprofil,
Kamera, Grundtempo und Begrenzung mit dem vorherigen Commit; freie Fahrbahnen
im tatsächlichen Fassadenbild; endliche Projektionen an Blockgrenzen,
Portalen und Rundengrenze; unterschiedliche Skylinebilder; keine
JavaScript-Fehler. Ansichten vor dem Tunnel, beim Ein- und Ausfahren und
im Industrieviertel wurden bei 480 × 800 und 1280 × 720 Pixel Viewport
visuell kontrolliert. Der eigentliche Spielbereich bleibt auch am Desktop
entsprechend der bestehenden Gestaltung auf Hochformat begrenzt.

Eine gesonderte Renderkontrolle bei 390 × 844 Pixel Viewport mit Abstand
zwischen den Frames verglich vier Streckenpositionen mit dem vorherigen
Commit. Die mediane Renderzeit lag vorher zwischen 13,5 und 15,8 ms,
nachher zwischen 10,6 und 16,9 ms. Diese Messung beschreibt die
Cloud-Prüfumgebung, keine Leistungsgarantie für andere Geräte.
