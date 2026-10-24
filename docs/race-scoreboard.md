# Fahrername und Rennergebnis

Nach dem Start-Artwork fragt das Spiel einmalig nach einem Namen aus genau
drei Zeichen (A–Z und 0–9). Drei unterstrichene Eingabefelder zeigen die Länge.
Kleinbuchstaben werden großgeschrieben, andere Zeichen verworfen. Einfügen,
Pfeiltasten und Rückschritt werden unterstützt. Der Name wird unter
`turboDash.playerTag` im lokalen Browser-Speicher abgelegt. Ist der Speicher
gesperrt, bleibt der Name für die laufende Sitzung nutzbar.

„Options“ in der Levelauswahl und im Pausemenü öffnet dieselbe Eingabe zum
Ändern des Namens. Änderungen im Rennen halten das Spiel weiter pausiert;
„Save“ und „Back“ führen zuerst zurück ins Pausemenü. Texteingaben lösen weder
Lenkung noch Turbo aus. Gegner haben ebenfalls eindeutige dreistellige Namen,
passend zu ihren Wagenfarben. Die Namensvergabe verändert keinen Zufallswert
der Gegner-KI.

Nach dem Rennen zeigt eine Tabelle alle sechs Fahrer mit Platzierung und
Gesamtzeit (`mm:ss.cc`). Die eigene Zeile ist markiert; Gold-, Silber- und
Bronzepokale kennzeichnen die ersten drei Plätze. Eigene Gesamtzeit und beste
Runde stehen darunter. „Continue“ öffnet die Levelauswahl, mit der bisherigen
Strecke ausgewählt. Ergebnislisten werden nicht dauerhaft gespeichert.

Die Rennuhr zählt aktive Simulationszeit ab „GO“, ohne Countdown und Pause.
Zielübertritte werden nach den Kollisionen pro Wagen einmalig erfasst und
innerhalb des Physikschritts interpoliert. Rundensumme und Gesamtzeit stimmen
dadurch überein. Ausrollen nach dem Zieleinlauf verändert die Platzierung
nicht. Dream Odyssey endet nach einer durchgehenden Fahrt, Rundkurse nach drei
Runden.

Gegner hinter dem Spieler fahren für die Wertung mit derselben Physik im
Hintergrund zu Ende. Kurze Rechenpakete geben den Browser zwischendurch frei;
„Final classification…“ erscheint währenddessen. Abbruch oder Neustart löscht
ausstehende Ergebnis-Timer. Falls ein Gegner auch nach sechs zusätzlichen
simulierten Minuten nicht fertig wird, kennzeichnet die Tabelle ihn als DNF
mit abgelaufener Rennzeit statt eine Zielzeit zu erfinden.

## Browserprüfung

```sh
npm run build -- --base=/Dash-Racer/
npm run preview -- --host 127.0.0.1 --port 3007 --base=/Dash-Racer/
BASE_URL=http://127.0.0.1:3007/Dash-Racer/ node scripts/assess-game.cjs scoreboard
```

Playwright und Chromium werden wie in [assessment.md](assessment.md) separat
bereitgestellt. `ASSESSMENT_DIR` bestimmt den Ablageort für JSON und Bilder.
Der Modus prüft Erststart, ungültige Zeichen, Großschreibung, Einfügen,
Speichern/Neuladen, Optionen, Pause, sechs Ergebnislisten und Continue/Reset.
Zieleinlauf-Fixtures springen ausdrücklich kurz vor das Ziel. Die Prüfung
`racecraft-play` fährt zusätzlich vollständige Rennen auf allen sechs Strecken
mit Tastatureingaben und überspringt dabei nur das Rendering; sie prüft auch
die Zielzeiten aller Fahrer und die unveränderte Reihenfolge beim Ausrollen.
Screenshots decken 320 × 640, 390 × 844 und 480 × 360 ab. Die Browseremulation
ersetzt keinen Test mit einer echten Bildschirmtastatur auf einem Telefon.

Stand 24. Oktober: Die UI-Prüfung, Startbild-, Bedienungs-, Ablauf-, Tempo- und
Kollisionsprüfungen bestehen. In 19 vollständigen automatisierten Rennen
erreichen alle Fahrer das Ziel mit gültigen Zeiten; Rundensumme und eigene
Gesamtzeit stimmen überein. Der bereits im Ausgangsstand verfehlte
Balancing-Zielwert bleibt unverändert: Der Testfahrer erreicht durchschnittlich
Platz 1,5 statt des gewünschten Bereichs 2–3. Die neue Wertung verändert keine
Fahrerprofile oder Turbo-Regeln. Ergebnisse und bekannte Einschränkung stehen
in [der Prüfdokumentation](evidence/race-scoreboard-2026-10-24.json).
