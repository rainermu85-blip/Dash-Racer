# Orbital Passage

Als **Level 8** implementiert: eine lineare Fahrt durch das Innere einer
Raumstation. Auf Wunsch auf etwa **1:45 Minuten mit eingesammelten Turbos**
verkürzt. 3080 Streckensegmente plus 200 Segmente Auslauf. Keine Runden,
kein Last-Lap-Hinweis, Boden-Ziellinie ohne Finishtor.

| Abschnitt | Ungefähre Zeit | Inhalt |
| --- | --- | --- |
| Arrival Dock | 0–16 s | Angedockter Frachter, Container, Ladetechnik und Techniker |
| Service Spine | 16–32 s | Enger, warmer Wartungsgang, Wandkonsolen, Leitungen, Türen und wechselnde Kurven |
| Earth Observation | 32–48 s | Glasbrücke mit Erde, Sternen, Antenne und Satelliten |
| Active Launch Deck | 48–68 s | Große Halle, Robotik und Fracht; ein Shuttle startet durch ein seitliches Hangartor |
| Helios Reactor | 68–88 s | Hohe Reaktorgalerie mit zwei Kernen, langsam pulsierenden Ringen und Wartungsbetrieb |
| Panorama Terminal | 88–105 s | Beobachtungskonsolen, Techniker, Biosphärenbeete und ein vorbeifliegender Transporter; gerader Zielanlauf |

Zeiten variieren mit Fahrweise und Turbonutzung. Die erste automatisierte Fahrt
mit echter Beschleunigung, Lenkung und eingesammelten Ladungen dauerte
105,2 Sekunden; ohne Turbo 109,2 Sekunden. Rennen mit Kontakt dauern länger.

Wände, Decke und Fahrbahn verwenden dieselbe Kurvenprojektion. Sichtbare
Seitengrenzen verwenden das vorhandene Kontaktmodell für alle Fahrer.
Die Kamera und das gemeinsame KI-, Turbo- und Fahrzeugmodell bleiben gleich.
Raumschiffbewegungen folgen der Rennzeit und frieren beim Pausieren ein.

Die Art wird einmal in kleinen Canvas-Kacheln erzeugt und danach wiederverwendet.
Alle Laufzeitfunktionen liegen direkt im Spiel, damit sowohl die Repository-
Dateien als auch der Produktionsbuild auf GitHub Pages funktionieren.
Details und Testbelege: [orbital-passage.md](../orbital-passage.md).
