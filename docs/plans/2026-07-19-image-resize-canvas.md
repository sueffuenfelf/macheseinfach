# Bild verkleinern — Ausschnitt mit freien Ecken

**Tool:** `image-resize` (`bereich/bilder/bild-verkleinern`)
**Datum:** 2026-07-19

## Problem

Das Tool nimmt Zielmaße bisher nur als Zahlen entgegen (max. Breite / max. Höhe). Man
sieht das Bild nicht und kann den gewünschten Bereich nicht direkt am Bild abgreifen —
schon gar nicht, wenn das Motiv schräg im Bild liegt (abfotografiertes Dokument, Schild,
Whiteboard).

## Lösung

Ein Auswahl-Viereck über dem Bild, dessen **vier Ecken unabhängig voneinander** gezogen
werden. Die Kanten müssen nicht achsenparallel sein.

Das Bild selbst bleibt beim Ziehen unverzerrt — man legt die Ecken nur auf das Motiv.
Entzerrt wird erst beim Cut: die markierte Fläche wird projektiv zu einem Rechteck
gerechnet. Eine kleine Ergebnis-Vorschau neben der Bühne zeigt laufend, was dabei
herauskommt.

Die bestehenden Zahlenfelder bleiben und wirken als Obergrenze für die Ausgabe; das
Seitenverhältnis folgt dem gezogenen Ausschnitt.

## Umsetzung

### `_shared/image/perspective.ts` (neu, rein rechnend → testbar)

- `solveHomography(from, to)` — 8×8-Gleichungssystem, Gauß mit Spaltenpivotisierung.
- `applyHomography(h, point)`
- `quadNaturalSize(quad)` — Kantenlängen des entzerrten Rechtecks: je die längere der
  beiden gegenüberliegenden Kanten, damit nichts gestaucht wird.
- `isConvexQuad(quad)` — überschlagene Vierecke haben keine sinnvolle Entzerrung.
- `warpImageData(source, sourceQuad, w, h)` — inverse Abbildung mit bilinearer
  Interpolation.

Die inverse Abbildung entsteht, indem `solveHomography` mit vertauschten Argumenten
aufgerufen wird (Ziel → Quelle); so ist keine Matrixinversion nötig.

### `_shared/image/resize.ts`

`resizeImage` bekommt eine optionale `quad`-Option (relativ zum Quellbild, 0–1). Ist sie
gesetzt und kein Einheitsrechteck, läuft der Entzerrungspfad statt `drawImage`. JPG hat
keinen Alphakanal — liegt eine Ecke außerhalb des Bilds, werden die leeren Bereiche vor
dem Encoden auf Weiß composited.

### `image-resize/ImageResizeCanvas.tsx` (neu)

Pointer-Events statt Maus-Events (Touch inklusive), Griffe zusätzlich per Tastatur
bedienbar (Pfeiltasten, Shift = 10 px). Bereich außerhalb des Vierecks wird abgedunkelt.
Die Ergebnis-Vorschau ist auf 150 px gedeckelt und um 120 ms entprellt, damit das Ziehen
flüssig bleibt.

### `ImageResizeTool.tsx`

Editor erscheint, sobald mindestens eine Datei gewählt ist, und arbeitet auf der ersten.
Der Ausschnitt gilt für alle Dateien des Stapels — darauf weist ein Hinweis hin, sobald
mehr als eine Datei geladen ist.

Sobald ein Ausschnitt gesetzt ist, wechseln die Zahlenfelder in den Obergrenzen-Modus:
Beschriftung wird zu „Obergrenze Breite/Höhe", „Seitenverhältnis beibehalten" wird
deaktiviert (das Verhältnis kommt dann vom Viereck), und ein Hinweis erklärt den Wechsel.

### `shell/jobs/context.tsx` — vorbestehender Bug

`enqueueBatch` rief `runJob` synchron direkt nach `setJobs` auf. `runJob` suchte den Job
aber in `jobsRef.current`, das erst beim nächsten Render nachgezogen wird — der frisch
eingereihte Job stand dort noch nicht, `runJob` brach bei `if (!job) return` sofort ab
und der Job blieb dauerhaft bei „0 / N fertig" hängen.

`runJob` nimmt den Datensatz jetzt optional direkt entgegen; `enqueueBatch` reicht ihn
durch. Das betraf **alle** Tools mit Job-Queue, nicht nur `image-resize`.

## Verifikation

- `bun test` — Homographie-Rundlauf, Identität, Konvexitätsprüfung, Kantenlängen.
- `bunx biome check` auf den geänderten Dateien.
- Manuell: Bild laden, Ecken schräg ziehen, Vorschau und Export prüfen.
