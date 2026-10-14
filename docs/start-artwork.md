# Startbild und Rennanzeigen

Das originale Artwork bleibt in `public/Welcome.png` erhalten. Für den
Startscreen liegt eine WebP-Version mit derselben Auflösung (1024 × 1535)
in `assets/welcome.webp`. Sie ist rund 510 kB groß statt 2,86 MB. Vite erzeugt
einen Dateinamen mit Inhaltshash und wendet den GitHub-Pages-Basispfad auf den
Bildverweis im HTML an. Eine feste relative URL aus dem JavaScript entfällt.

Das Bild ist ein eigenes, zentriertes Element. „Click to start“ liegt zwischen
Frau und Auto, etwas auf dem oberen Teil des Autos. Die Position folgt dem
tatsächlich dargestellten Bild einschließlich der freien Ränder auf hohen
Bildschirmen. Erst nach dem Laden und Dekodieren des Bildes beginnt die Wartezeit
von 1,5 Sekunden. Anschließend blendet die Aufforderung in 0,25 Sekunden ein.
Bei einem Bildfehler versucht der Startscreen die originale PNG-Datei.
Der direkte Aufruf lokaler HTML-Dateien behält dafür den bisherigen Ersatzpfad.

Die Prüfung `node scripts/assess-game.cjs start` hält die erste Bildanfrage
absichtlich länger als 1,5 Sekunden zurück, beobachtet die gesperrte
Startaufforderung, gibt das Bild frei und öffnet anschließend das Levelmenü.
Sie prüft zusätzlich Wartezeit, kurze Einblendung, Position auf verschiedenen
Bildschirmgrößen und den PNG-Ersatz bei fehlgeschlagener WebP-Anfrage.
`BASE_URL` kann auf einen Produktionsbuild unter `/Dash-Racer/` zeigen.

Die veröffentlichte GitHub-Pages-URL war aus der Cloud-Prüfumgebung durch
HTTP-Zielrichtlinien gesperrt. Der gebaute Stand wird deshalb lokal unter
demselben Basispfad überprüft; dies ersetzt keine direkte Live-Abfrage.
