# Gegner-KI und zufällige Turbos

Der Windschatten-Miniturbo ist vollständig entfernt. Alle sechs Strecken nutzen
dieselbe Fahr-KI mit fünf unterschiedlichen Fahrerprofilen: Rot ist ausgewogen,
Cyan fährt Kurven sicherer, Orange ist auf Geraden schneller, Grün plant
vorsichtiger und Violett reagiert später. Die Grundspitze nach sauberem
Beschleunigen liegt je nach Fahrer bei rund 385–399 km/h; beim Spieler bei
402 km/h. Kleine Formschwankungen, Kurven, Kontakte und Turbos beeinflussen das
Rennergebnis. Die begrenzte Aufholhilfe bleibt bei höchstens zwei Prozent.

## Turbovergabe ohne Einsammeln

Die normalen Gegner-Turbos verwenden wieder das Zufallsmuster des ersten
GitHub-Commits
[`af1c28b`](https://github.com/rainermu85-blip/Dash-Racer/commit/af1c28b7951d1b6f9d46526a27ad40ce3147cc85).
Gegner sammeln keine Blitze oder Space-Energiekugeln und wechseln für diese
Gegenstände nicht die Spur. Sie haben keinen Ladungsvorrat.

Für die inzwischen stärkere Fahr-KI wurde die ursprüngliche Chance von
0,3 Prozent je Bild bei 60 FPS auf **0,15 Prozent** halbiert. Der Turbo dauert
wie im ersten Build **1,5 Sekunden**. Die Chance gilt bei weniger als 4000
Streckeneinheiten Abstand vor oder hinter dem Spieler, auch über die
Rundengrenze hinweg. Die Umrechnung
`1 - (1 - 0.0015) ** (60 * dt)` hält die Häufigkeit bei verschiedenen
Bildraten und Physikschritten gleich. Ein laufender Turbo, ein Chevron,
eine aktive Kollisionsstrafe oder die eigene Zielankunft verhindern einen
neuen Zufallsstart. Nach dem Auslaufen entscheidet wieder der Zufall.

Die bisherigen Space-Wave-Chevrons behalten ihre Fahrplanung, tatsächliche
Bodenberührung, Stärke und Dauer. Der normale Turbo zielt auf 1,65 × 335 km/h,
der Chevron auf 2,31 × 335 km/h für zwei Sekunden. Der Spielerturbo dauert
weiterhin 1,2 Sekunden; die Sammel- und Bedienregeln des Spielers bleiben
bestehen, einschließlich der Wiederkehr eingesammelter Gegenstände nach
1,5 Sekunden.

## Fahrentscheidungen

Jeder Fahrer plant alle 160–280 ms rund 1–1,3 Sekunden voraus. Er berücksichtigt
Straßenbegrenzungen, Baustellen, geparkte Fahrzeuge, Chevron-Felder und andere
Rennwagen. Spurwechsel werden eine Zeit lang beibehalten; Gefahr darf sie
unterbrechen. Mehrere Gegner können unabhängig überholen, auch weit vom
Spieler entfernt. Bei versperrtem Weg bremst die KI. Kontakte zwischen Gegnern
haben Kollisionsstrafe und trennen die Wagen. Straßenränder, Eis und Dalí-
Effekte gelten ebenfalls für Gegner.

## Prüfung und Ergebnis

`node scripts/assess-game.cjs racecraft` prüft Überholmanöver, KI gegen KI,
blockierte Spuren, Kontaktstrafen, Zufallschance und Dauer, Distanzgrenzen,
Bildratenunabhängigkeit, Nicht-Sammeln der Gegner, Spieler-Pickups, Pause und
Neustart. Die Verteilung wird in unabhängigen Einsekundenfenstern bei
30/60/120 FPS gemessen.

`node scripts/assess-game.cjs racecraft-play` fährt alle sechs Strecken mit
jeweils drei festen Zufallsstarts (1989, 2026, 2001). Nach dem Rennstart
verändert der Testfahrer nur Links-/Rechts-/Turboeingaben. Physik, Gegner,
Streckenverlauf und Hindernisse bleiben aktiv. Ein weiterer Highway-Lauf
verwendet keine manuellen Turbos.

Das Ziel für diese Abstimmung ist ein durchschnittlicher Platz zwischen 2
und 3 über die 18 Rennen. Gemessen wurde **2,33**:

| Strecke | Start 1989 | Start 2026 | Start 2001 |
| --- | ---: | ---: | ---: |
| Neon City | 1 | 2 | 2 |
| Ocean Drive | 2 | 2 | 5 |
| Sunset Hills | 2 | 4 | 4 |
| Midnight Highway | 3 | 3 | 2 |
| Dream Odyssey | 3 | 1 | 3 |
| Space Wave | 1 | 1 | 1 |

Ohne manuelle Turbos landet der Testfahrer auf Midnight Highway auf Platz 6.
Es wird kein Ergebnis im Spiel erzwungen. Einzelne Rennen bleiben leichter
oder schwerer; Space Wave ist für den auf Energiekugeln und Chevrons
optimierten Testfahrer am einfachsten. Diese automatisierten Browserfahrten
belegen den Vergleich, ersetzen aber keine menschlichen Handy-Playtests.
