# Arbeitszeiterfassung
Die Webseite ermöglicht das digitale Erfassen und Teilen von Arbeitszeiten. Diese werden lokal im Browser (im `localStorage`) gespeichert und beim erneuten Aufrufen der Seite geladen. Der Nutzer kann den Speicher über einen Button löschen, um die vollständige Kontrolle über seine Daten zu behalten.
> [!IMPORTANT] 
> Das Projekt wurde ausschließlich als *Proof of Concept* erstellt. Ein Großteil der Webseite wurde mithilfe einer KI generiert.
> [!NOTE]  
> Die Webseite wurde in erster Linie für die Verwendung mit dem Handy erstellt. Auf größeren Bildschirmen kann die Formatierung evtl. leicht zerbreichen. Die Funktion sollte allerdings dennoch gegeben sein.
---
## Datenerfassung
Der Nutzer kann **Arbeitstage** und **Baustellen** einpflegen:

- **Arbeitstag**
  - Datum (im Format `dd.mm.yyyy`)
  - Pausenzeit (in Minuten)
  - Fahrtzeit (in Minuten)
- **Baustelle**
  - Name der Baustelle
  - Arbeitszeit (in Stunden)
Über den Button **"Daten speichern"** werden die eingetragenen Informationen im `localStorage` des Geräts abgelegt.

> [!WARNING]  
> Die Daten sind nicht auf anderen Geräten oder in anderen Browsern verfügbar. Es muss immer dieselbe Kombination aus Gerät und Browser verwendet werden.

Beim erneuten Öffnen der Seite werden die gespeicherten Daten aus dem `localStorage` geladen und in der Benutzeroberfläche angezeigt – die Felder sind aus Gründen der Lesbarkeit anfangs zusammengeklappt.

Über den Button **"Daten löschen"** kann der `localStorage` vollständig geleert werden. Dieser Vorgang ist irreversibel.

## Daten teilen
Um die abgespeicherten Daten anderen Personen (z. B. Vorgesetzten) zur Verfügung zu stellen oder dauerhaft zu dokumentieren, können die aktuell eingetragenen bzw. gespeicherten Daten über den Button **"PDF erstellen & Teilen"** in eine PDF umgewandelt werden. Die PDF kann entweder lokal abgespeichert oder über installierte Messaging-Dienste (z. B. WhatsApp, Mail) weitergeleitet werden.
Manche Browser scheinen den Code nicht korrekt auszuführen. Google Chrome sollte funktionieren.
