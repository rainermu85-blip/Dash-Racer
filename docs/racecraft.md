# Gegner-KI und zufällige Turbos

Der Windschatten-Miniturbo ist vollständig entfernt. Alle sechs Strecken nutzen
dieselbe Fahr-KI mit fünf unterschiedlichen Fahrerprofilen: Rot ist ausgewogen,
Cyan fährt Kurven sicherer, Orange ist auf Geraden schneller, Grün plant
vorsichtiger und Violett reagiert später. Die Grundspitze nach sauberem
Beschleunigen liegt je nach Fahrer bei rund 385–399 km/h; beim Spieler bei
402 km/h. Kleine Formschwankungen, Kurven, Kontakte und Turbos beeinflussen das
Rennergebnis. Der positionsabhängige Aufholbonus ist vollständig entfernt:
Abstand zum Führenden und Rang verändern das normale Tempo nicht. Auch die
positive Fahrerform darf die gemeinsame normale Obergrenze von 402 km/h
nicht überschreiten.

## Turbovergabe ohne Einsammeln

Die normalen Gegner-Turbos verwenden wieder das Zufallsmuster des ersten
GitHub-Commits
[`af1c28b`](https://github.com/rainermu85-blip/Dash-Racer/commit/af1c28b7951d1b6f9d46526a27ad40ce3147cc85).
Gegner sammeln keine Blitze oder Space-Energiekugeln und wechseln für diese
Gegenstände nicht die Spur. Sie haben keinen Ladungsvorrat.

Für die inzwischen stärkere Fahr-KI wurde die ursprüngliche Chance von
0,3 Prozent je Bild bei 60 FPS auf **0,15 Prozent** halbiert. Der Turbo dauert
**1,2 Sekunden**, genauso lange wie beim Spieler. Die Chance gilt bei weniger als 4000
Streckeneinheiten Abstand vor oder hinter dem Spieler, auch über die
Rundengrenze hinweg. Die Umrechnung
`1 - (1 - 0.0015) ** (60 * dt)` hält die Häufigkeit bei verschiedenen
Bildraten und Physikschritten gleich. Ein laufender Turbo, ein Chevron,
eine aktive Kollisionsstrafe oder die eigene Zielankunft verhindern einen
neuen Zufallsstart. Die Nähe zum Spieler allein kann die folgenden festen
Grenzen nicht umgehen:

- Nach einem normalen Turbo mindestens **6 Sekunden Pause** ab seinem Ende.
- Nach einem zweiten Einsatz innerhalb von 30 Sekunden mindestens
  **18 Sekunden Pause** ab seinem Ende.
- Höchstens **zwei Starts in jedem rollierenden 30-Sekunden-Fenster**.
- Höchstens **sechs Zufalls-Turbos pro Gegner im gesamten Rennen**.

Die Zeitgrenzen gelten in Rennzeit und bleiben beim Pausieren stehen. Kollision,
Rundenwechsel und Zielannäherung setzen weder Budget noch Pausen zurück.
Auch ein abgebrochener Turbo verbraucht einen Einsatz; seine geplante Sperrzeit
bleibt erhalten. Der Zufall wird nur bei freier Fahrspur und ohne unmittelbar
bremsendes Hindernis geprüft. Eine ungenutzte Chance verbraucht keinen Einsatz.
Nach einem Chevron wartet die KI ebenfalls mindestens sechs Sekunden nach
Ende des Bodenturbos, bevor ein kostenloser normaler Turbo möglich wird.
Chevron-Felder selbst verbrauchen kein Zufallsbudget und bleiben für alle
Fahrer nutzbar.

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
Neustart. Ein adversarialer Lauf erzwingt bei 30/60/120 FPS jede Zufallsziehung
als Erfolg: Die frühestmöglichen Startzeiten sind dennoch 0, 7,2, 30, 49,2,
68,4 und 87,6 Sekunden. Ein siebter Start bleibt dauerhaft gesperrt. Separate
Prüfungen decken Kollision, Rundengrenze, Zielannäherung und Chevron-Nachlauf
ab. Auf allen sechs Strecken wird außerdem identisches normales Solltempo
bei verschiedenen Rückständen und Vorsprüngen nachgewiesen. Die Verteilung wird in unabhängigen Einsekundenfenstern bei
30/60/120 FPS gemessen.

`node scripts/assess-game.cjs racecraft-play` fährt alle sechs Strecken mit
jeweils drei festen Zufallsstarts (1989, 2026, 2001). Nach dem Rennstart
verändert der Testfahrer nur Links-/Rechts-/Turboeingaben. Physik, Gegner,
Streckenverlauf und Hindernisse bleiben aktiv. Ein weiterer Highway-Lauf
verwendet keine manuellen Turbos.

Der frühere Vergleichswert mit unbeschränkten Zufalls-Turbos war Platz 2,33.
Mit den neuen Grenzen beträgt der Durchschnitt **1,72** über 18 Rennen:

| Strecke | Start 1989 | Start 2026 | Start 2001 |
| --- | ---: | ---: | ---: |
| Neon City | 1 | 1 | 1 |
| Ocean Drive | 1 | 1 | 1 |
| Sunset Hills | 5 | 2 | 4 |
| Midnight Highway | 1 | 1 | 1 |
| Dream Odyssey | 2 | 2 | 3 |
| Space Wave | 1 | 1 | 2 |

Alle 19 vollständigen Rennläufe einschließlich des Laufs ohne manuelle Turbos
bestehen die Funktions- und Budgetprüfungen. Die gespeicherten Turbo-Startzeiten
werden in jedem Rennen zusätzlich auf Gesamtlimit, Fensterlimit und Pausen
geprüft. Die separate alte Zielmarke „Durchschnitt Platz 2–3“ schlägt mit 1,72
weiterhin an: Die neue Version ist für den Testfahrer leichter. Dieser
Balancing-Check wurde ausdrücklich nicht abgeschwächt oder entfernt.

Die individuellen Fahrerprofile bleiben bestehen; es gibt keinen neuen
abstandsabhängigen Ersatzbonus. Diese automatisierten Browserfahrten zeigen
den Vergleich und die wirksamen Grenzen, ersetzen aber keine menschlichen
Handy-Playtests.
