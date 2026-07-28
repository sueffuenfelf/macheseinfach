# Plan — Tool-Roadmap: mindestens 10 Tools pro Bereich

**Date:** 2026-07-28  
**Scope:** `apps/website` — Katalog & Produktplanung  
**Status:** Planung only — **noch nicht bauen**

## Ziel

Jeder Bereich (bestehend + neu) bekommt eine **definierte Mindestliste von 10 Tools** (dürfen mehr sein). Das ist die Referenz für Stories, Suche und Umsetzungsreihenfolge — nicht sofortige Implementierung.

**Kurationsregel:** Kein Tool nur „weil die Liste 10 braucht“. Jedes Tool braucht (1) eine echte Nutzer-Situation, (2) eine klar formulierbare Google-/Suchintention (DE), (3) Passung zu lokal-im-Browser. Keyword-Cluster sind **Intent-Labels**, keine Keyword-Planner-Volumina — vor Launch mit Keyword-Planer/Search Console nachziehen.

## Prinzipien

- **Lokal zuerst** — sensible Daten verlassen den Browser nicht (Ausnahmen: Leak-Check, ggf. SEO-Fetch mit klarer Warnung).
- **Was im Katalog steht, funktioniert** — geplante Tools erst listen, wenn Umsetzung ansteht; bis dahin leben sie nur in diesem Plan.
- **M:N erlaubt** — ein Tool kann in mehreren Bereichen erscheinen (z. B. `pdf-split` in Behörden + Dokumente).
- **Keine Duplikate unter falschem Namen** — lieber Variante/Story als zweites Tool für dieselbe Aufgabe.
- **Shell zuerst, Tool second** — gleiches UX-Muster = eine generische Shell; pro Tool nur Logik + Labels (siehe Abschnitt **Tool Shells** unten).

## Legende

| Symbol | Bedeutung |
| --- | --- |
| ✅ | Existiert (`config.ts` + UI) |
| 🔧 | Stub/Config, UI noch unvollständig oder `maturity: planned` |
| 📋 | Nur in dieser Roadmap definiert |

### Shell-Spalte (in Tabellen unten)

| Shell | Kurz |
| --- | --- |
| `calc` | Felder → live berechnetes Ergebnis |
| `check` | Eingabe → gültig/ungültig + Details |
| `generate` | Formular → Text/QR/JSON/Code erzeugen |
| `file` | Datei(en) → Einstellungen → Download |
| `paste` | Text/HTML/URL einfügen → Analyse-Report |
| `editor` | Canvas/Vorschau + Undo + Sticky-Footer |
| `extract` | Datei/Text → strukturierte Daten extrahieren |

---

## Ist-Stand & Portfolio (2026-07-28)

### Bestehende Bereiche (Katalog live)

| Bereich | Tools im Katalog | Davon ✅ stable | Ziel |
| --- | ---: | ---: | ---: |
| Buchhaltung | 3 | 2 | ≥ 10 |
| Behörden | 3 | 3 | ≥ 10 |
| Bilder | 5 | 5 | ≥ 10 |
| Dokumente | 4* | 2 | ≥ 10 |
| Security | 1 | 0 | ≥ 10 |
| SEO | 0 | 0 | ≥ 10 |

\* `epc-read` zählt für Buchhaltung + Dokumente.

### Neue Bereiche (nur Roadmap — noch kein Katalog)

| Phase | Bereich | Tools geplant | Warum |
| --- | --- | ---: | --- |
| 1 | Text & Schreiben | 12 | Alltag + starke „zeichenzähler / wortzähler“-Intent |
| 1 | Zeit & Fristen | 12 | DACH-Feiertage, Kündigungsfristen, Fristenrechner |
| 1 | Wohnen & Miete | 12 | Deutsche Nische, ergänzt Behörden/Dokumente |
| 1 | Einheiten & Umrechnen | 11 | Evergreen-Rechner, `calc`-Shell-Hebel |
| 1 | Web & Entwickler | 12 | Freelancer-Stack neben SEO |
| 2 | Steuern | 12 | Rechner mit Disclaimer — nicht Elster ersetzen |
| 2 | Recht & Vertrag | 11 | Checklisten/Rechner, **kein Rechtsrat** |
| 2 | Kommunikation | 11 | vCard, Signatur, WhatsApp-Link, ICS |
| 2 | Barrierefreiheit | 10 | WCAG-Alltag für kleine Sites |
| 2 | Kreativ & Farbe | 11 | Design-Utilities, Cross zu Bilder/Web |

---

## 1. Buchhaltung — 11 Tools

Alltag: Zahlungen, Rechnungen, Freelancer-Kram.

| # | Tool-ID | Kurztitel | Zweck | Shell | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `girocode-gen` | GiroCode erzeugen | SEPA-QR für Rechnungen | `generate` | ✅ |
| 2 | `iban-validate` | IBAN prüfen | Prüfsumme + Bankinfo lokal | `check` | ✅ |
| 3 | `epc-read` | IBAN auslesen | IBAN aus PDF/Scan/Text extrahieren | `extract` | 🔧 |
| 4 | `sepa-qr-read` | GiroCode lesen | QR auf Rechnung/Foto → Zahlungsdaten | `extract` | 📋 |
| 5 | `vat-calculator` | MwSt-Rechner | Brutto ↔ Netto ↔ MwSt (19/7 %) | `calc` | 📋 |
| 6 | `skonto-calculator` | Skonto-Rechner | Skontobetrag und Zahlungsbetrag | `calc` | 📋 |
| 7 | `amount-in-words` | Betrag in Worten | „123,45 EUR“ → ausgeschrieben (DE) | `calc` | 📋 |
| 8 | `invoice-due-date` | Fälligkeit | Rechnungsdatum + Zahlungsziel → Fälligkeit | `calc` | 📋 |
| 9 | `kleinunternehmer-check` | Kleinunternehmer | Umsatzgrenze / Hinweis §19 UStG | `calc` | 📋 |
| 10 | `payment-split` | Teilzahlungen | Betrag auf N Überweisungen aufteilen | `calc` | 📋 |
| 11 | `receipt-monthly-pdf` | Belege bündeln | Bild-PDFs/Scans zu Monats-PDF | `file` | 📋 |

**Stories (später):** je 1–2 Stories pro Tool-Cluster (Zahlung, Rechnung, Steuer-Hinweis).

---

## 2. Behörden & Formulare — 12 Tools

Portal-Uploads, Formulare, Nachweise — PDF-lastig.

| # | Tool-ID | Kurztitel | Zweck | Shell | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `pdf-compress` | PDF verkleinern | Zielgröße (Elster 2 MB), Auto-Fit | `file` | ✅ |
| 2 | `pdf-redact` | PDF schwärzen | Rechtecke, Undo, Raster-Export | `editor` | ✅ |
| 3 | `pdf-form-fill` | Formular ausfüllen | AcroForm bearbeiten + flatten | `editor` | ✅ |
| 4 | `pdf-split` | PDF teilen | Eine Seite / Bereich pro Datei | `file` | 📋 |
| 5 | `pdf-page-rotate` | Seiten drehen | Einzelne Seiten 90°/180° | `file` | 📋 |
| 6 | `pdf-grayscale` | Graustufen | Farbe entfernen → kleinere Uploads | `file` | 📋 |
| 7 | `pdf-a4-fit` | Auf A4 bringen | Seitengröße/normalisieren für Ämter | `file` | 📋 |
| 8 | `pdf-stamp` | Stempel/Datum | „Eingereicht am …“ auf Formular | `editor` | 📋 |
| 9 | `pdf-to-jpg` | PDF → Bilder | JPG pro Seite für JPEG-only-Portale | `file` | 📋 |
| 10 | `id-photo-check` | Passfoto-Check | Maße, Dateigröße, Hintergrund-Hinweis | `check` | 📋 |
| 11 | `pdf-unlock` | Passwort entfernen | Eigenes PDF entsperren (lokal) | `file` | 📋 |
| 12 | `pdf-page-reorder` | Seiten sortieren | Reihenfolge per Drag vor Upload | `editor` | 📋 |

**Shared mit Dokumente:** `pdf-split`, `pdf-page-rotate`, `pdf-page-reorder` — primär Behörden-Story, sekundär Dokumente.

---

## 3. Bilder — 12 Tools

Fotos, Screenshots, Portale — alles clientseitig.

| # | Tool-ID | Kurztitel | Zweck | Shell | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `image-convert` | Format wechseln | HEIC/PNG/JPG/WebP | `file` | ✅ |
| 2 | `image-compress` | Verkleinern | Dateigröße, Qualität | `file` | ✅ |
| 3 | `image-resize` | Größe ändern | Pixelmaße / Seitenverhältnis | `file` | ✅ |
| 4 | `image-rotate` | Drehen & spiegeln | Ausrichtung korrigieren | `file` | ✅ |
| 5 | `image-exif-strip` | Metadaten entfernen | EXIF/GPS vor Upload | `file` | ✅ |
| 6 | `image-crop` | Zuschneiden | Freihand/Rechteck-Crop | `editor` | 📋 |
| 7 | `image-brightness` | Helligkeit/Kontrast | Scans/Fotos aufhellen | `editor` | 📋 |
| 8 | `image-passport-photo` | Passfoto | 35×45 mm, Export für biometrisch | `file` | 📋 |
| 9 | `image-watermark` | Wasserzeichen | Text/Bild-Overlay | `editor` | 📋 |
| 10 | `image-to-pdf` | Bilder → PDF | Mehrere Fotos eine PDF | `file` | 📋 |
| 11 | `image-batch-convert` | Stapel-Konvertierung | Viele Dateien, ein Zielformat | `file` | 📋 |
| 12 | `image-dpi-check` | DPI & Maße | Auflösung für Druck/Portal prüfen | `check` | 📋 |

---

## 4. Dokumente — 12 Tools

PDFs & Scans — zusammenfügen, bearbeiten, Text.

| # | Tool-ID | Kurztitel | Zweck | Shell | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `pdf-merge` | PDFs zusammenfügen | Bewerbung, Vertragspaket | `file` | ✅ |
| 2 | `pdf-sign` | PDF unterschreiben | Signatur platzieren | `editor` | ✅ |
| 3 | `ocr-local` | Text aus Scan | OCR lokal (Bild-PDF) | `extract` | 🔧 |
| 4 | `epc-read` | IBAN auslesen | IBAN aus Rechnungs-PDF | `extract` | 🔧 |
| 5 | `pdf-split` | PDF teilen | *(shared Behörden)* | `file` | 📋 |
| 6 | `pdf-extract-text` | Text kopieren | Copyable Text aus nativen PDFs | `extract` | 📋 |
| 7 | `pdf-extract-pages` | Seiten extrahieren | Seiten 3–7 als neue PDF | `file` | 📋 |
| 8 | `pdf-page-numbers` | Seitenzahlen | Nummerierung einfügen | `file` | 📋 |
| 9 | `pdf-watermark` | Wasserzeichen | „ENTWURF“ / Vertraulich | `file` | 📋 |
| 10 | `pdf-compare` | PDF vergleichen | Seitenweise Diff-Vorschau | `editor` | 📋 |
| 11 | `pdf-flatten` | Formular flatten | Felder in Druckbild wandeln | `file` | 📋 |
| 12 | `pdf-page-reorder` | Seiten sortieren | *(shared Behörden)* | `editor` | 📋 |

---

## 5. Security — 12 Tools

Prüfungen ohne preisgegebene Secrets — klar kommunizieren, was das Netz verlässt.

| # | Tool-ID | Kurztitel | Zweck | Shell | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `pwned-check` | E-Mail-Leak | HIBP k-Anonymity für E-Mail | `check` | 🔧 |
| 2 | `breach-password-check` | Passwort-Leak | HIBP Pwned Passwords (Prefix-Hash) | `check` | 📋 |
| 3 | `password-strength` | Passwort-Stärke | Entropie + Muster lokal | `check` | 📋 |
| 4 | `password-generator` | Passwort erzeugen | Sichere Zufallspasswörter | `generate` | 📋 |
| 5 | `hash-file` | Datei-Hash | SHA-256 Checksumme | `file` | 📋 |
| 6 | `jwt-inspector` | JWT lesen | Header/Payload decode (lokal) | `paste` | 📋 |
| 7 | `totp-generator` | 2FA-Code | TOTP aus Secret (lokal) | `generate` | 📋 |
| 8 | `email-header-check` | E-Mail-Header | Phishing-Indikatoren aus Header-Text | `paste` | 📋 |
| 9 | `url-phishing-check` | Link prüfen | URL-Parsing, IDN/Homograph-Warnung | `check` | 📋 |
| 10 | `cert-viewer` | Zertifikat | X.509 PEM paste → Details | `paste` | 📋 |
| 11 | `privacy-redact-text` | Text schwärzen | Namen/E-Mails in Text maskieren | `paste` | 📋 |
| 12 | `pgp-key-info` | OpenPGP-Key | Key-Block → Fingerprint, Ablauf | `paste` | 📋 |

**Hinweis:** Tools 1–2 brauchen Netzwerk + klare Trust-Copy; Rest rein lokal.

---

## 6. SEO — 12 Tools

Kleine Websites — Paste/HTML/Fetch mit Transparenz.

| # | Tool-ID | Kurztitel | Zweck | Shell | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `seo-meta-preview` | Google-Vorschau | Title/Description → Snippet | `generate` | 📋 |
| 2 | `seo-sitemap-check` | Sitemap prüfen | XML validieren, Fehlerliste | `paste` | 📋 |
| 3 | `seo-robots-check` | robots.txt | Parser + Allow/Disallow | `paste` | 📋 |
| 4 | `seo-og-preview` | Social Preview | Open Graph / Twitter Card | `generate` | 📋 |
| 5 | `seo-structured-data` | Structured Data | JSON-LD Syntax + Pflichtfelder | `paste` | 📋 |
| 6 | `seo-title-length` | Title & Meta | Zeichenlänge, Pixel-Hinweis | `calc` | 📋 |
| 7 | `seo-heading-outline` | Überschriften | H1–H6 aus HTML paste | `paste` | 📋 |
| 8 | `seo-canonical-check` | Canonical | canonical/href-Dubletten | `paste` | 📋 |
| 9 | `seo-slug-generator` | URL-Slug | Titel → SEO-Slug (DE) | `generate` | 📋 |
| 10 | `seo-keyword-density` | Keyword-Dichte | Wortfrequenz im Text | `calc` | 📋 |
| 11 | `seo-schema-generator` | Schema bauen | LocalBusiness / FAQ JSON-LD | `generate` | 📋 |
| 12 | `seo-hreflang-check` | hreflang | Alternate-Links prüfen | `paste` | 📋 |

**Stories existieren bereits** für #1 und #2 (`story-seo-meta-preview`, `story-seo-sitemap`) — beim Eintragen ins Katalog Tool-IDs angleichen.

---

## Kurationsmethode (alle neuen Bereiche)

Jedes Tool in den Tabellen unten folgt dem Schema:

| Spalte | Bedeutung |
| --- | --- |
| **Need** | Konkrete Situation eines Menschen (nicht Feature-Beschreibung) |
| **Suchintention** | Typische DE-Queries / Long-Tails (Intent, kein garantiertes Volumen) |
| **Shell** | Welches UI-Muster (siehe unten) |

**Harte Ausschlusskriterien**

- Braucht laufenden Server / teure API ohne klaren Trust-Vorteil → raus
- Ersetzt Steuerberater/Anwalt (nur Rechner + Disclaimer ok) → raus oder stark einschränken
- Reines „Gimmick“ ohne wiederkehrende Suchintention → raus
- Duplikat eines bestehenden Tools unter neuem Namen → Querverweis statt zweites Tool

**Disclaimer-Pflicht:** Bereiche Steuern, Recht & Vertrag, Wohnen (Kündigungsfristen) — immer „keine Rechts-/Steuerberatung“ in UI + Catalog `trust`.

---

## 7. Text & Schreiben — 12 Tools (Phase 1)

**Nutzerfrage:** „Ich muss einen Text fertig machen / prüfen / umwandeln — schnell, lokal.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `char-counter` | Zeichenzähler | Meta-Description, Tweet, SMS — Zeichenlimit prüfen | `zeichenzähler`, `zeichen zählen`, `text zähler`, `meta description länge` | `calc` |
| 2 | `word-counter` | Wortzähler | Hausarbeit/Brief — Wortanzahl + Lesedauer | `wortzähler`, `wörter zählen`, `lesedauer berechnen` | `calc` |
| 3 | `case-converter` | Groß/Klein | Überschrift falsch formatiert | `großschreibung umwandeln`, `kleinbuchstaben`, `title case` | `generate` |
| 4 | `line-dedupe` | Duplikate entfernen | Excel-Export / Liste mit doppelten Zeilen | `doppelte zeilen entfernen`, `duplikate text`, `unique lines` | `paste` |
| 5 | `whitespace-clean` | Leerzeichen aufräumen | Copy-Paste aus Word mit kaputten Umbrüchen | `zeilenumbrüche entfernen`, `leerzeichen entfernen`, `text bereinigen` | `paste` |
| 6 | `umlaut-convert` | Umlaute ersetzen | Dateiname/URL ohne äöüß | `umlaute ersetzen`, `ä zu ae`, `umlaut umwandeln` | `generate` |
| 7 | `text-diff` | Text vergleichen | Zwei Versionen eines Vertrags/Mails | `text vergleichen`, `unterschied text`, `diff online` | `paste` |
| 8 | `lorem-ipsum` | Platzhaltertext | Layout füllen ohne echten Content | `lorem ipsum generator`, `blindtext generator deutsch` | `generate` |
| 9 | `reading-level` | Lesbarkeit | Behördentext / AGB — zu kompliziert? | `lesbarkeit prüfen`, `flesch index deutsch`, `verständlichkeit text` | `paste` |
| 10 | `sms-counter` | SMS-Länge | Benachrichtigung / 2FA-Text | `sms zeichen`, `sms zähler 160`, `gsm 7bit` | `calc` |
| 11 | `markdown-preview` | Markdown-Vorschau | README / Notion-Notiz prüfen | `markdown preview`, `markdown zu html` | `generate` |
| 12 | `find-replace-bulk` | Suchen & Ersetzen | Viele Ersetzungen auf einmal (Liste) | `suchen ersetzen online`, `mehrfach ersetzen text` | `paste` |

**Nicht aufgenommen:** KI-Umschreiber (Server/Kosten/Trust), Übersetzer (API), Grammatik-Checker (schwer lokal + Erwartungshaltung).

---

## 8. Zeit & Fristen — 12 Tools (Phase 1)

**Nutzerfrage:** „Wann ist die Frist / wie viele Tage / welcher Feiertag?“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `date-diff` | Tage zwischen Daten | Reise, Projekt, Urlaub — Abstand | `tage zwischen zwei daten`, `datum differenz`, `wieviele tage` | `calc` |
| 2 | `business-days` | Werktage rechnen | Lieferfrist „5 Werktage“ | `werktage berechnen`, `werktage zwischen`, `arbeitstage rechnen` | `calc` |
| 3 | `add-days` | Datum + X Tage | „+14 Tage Widerruf“, „+1 Monat“ | `datum plus tage`, `14 tage ab heute`, `frist berechnen` | `calc` |
| 4 | `calendar-week` | Kalenderwoche | KW auf Rechnung / Plan | `kalenderwoche`, `welche kw`, `kw rechner` | `calc` |
| 5 | `de-holidays` | Feiertage DE | Bundesland — ist Montag frei? | `feiertage 2026`, `feiertage bayern`, `ist heute feiertag` | `check` |
| 6 | `age-calculator` | Alter berechnen | Formular „Alter am Stichtag“ | `alter berechnen`, `wie alt bin ich`, `alter stichtag` | `calc` |
| 7 | `countdown` | Countdown | Event / Deadline visualisieren | `countdown rechner`, `tage bis datum`, `countdown generieren` | `calc` |
| 8 | `timezone-convert` | Zeitzone | Call mit US/UK — Uhrzeit | `zeitzone umrechner`, `utc nach mez`, `world clock convert` | `calc` |
| 9 | `notice-period-days` | Frist generisch | „X Wochen zum Monatsende“ grob | `kündigungsfrist berechnen` (generisch), `frist monatsende` | `calc` |
| 10 | `unix-timestamp` | Unix-Zeit | Log / API-Debug | `unix timestamp`, `timestamp umrechnen`, `epoch converter` | `calc` |
| 11 | `working-hours` | Stunden zwischen | Schicht / Arbeitszeit grob | `stunden zwischen uhrenzeiten`, `arbeitszeit berechnen` | `calc` |
| 12 | `semester-week` | Vorlesungswoche | Uni — welche Vorlesungswoche? | `vorlesungswoche`, `semesterwoche berechnen` | `calc` |

**Cross:** `invoice-due-date` (Buchhaltung) bleibt dort primär; Story kann hier verlinkt werden. Miet-Kündigung → Wohnen.

---

## 9. Wohnen & Miete — 12 Tools (Phase 1)

**Nutzerfrage:** „Rund um Miete, Umzug, Vermieter — ohne Anwalt.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `rent-notice-period` | Mietkündigungsfrist | Wann muss die Kündigung raus? | `mietkündigungsfrist`, `kündigungsfrist mietvertrag`, `wann kündigen wohnung` | `calc` |
| 2 | `deposit-calc` | Kaution rechnen | 3 Monatsmieten? Max? | `kaution berechnen`, `mietkaution höhe`, `3 monatsmieten kaution` | `calc` |
| 3 | `warm-cold-rent` | Warm-/Kaltmiete | Angebot vergleichen | `warmmiete kaltmiete`, `nebenkosten anteil`, `miete umrechnen` | `calc` |
| 4 | `living-space` | Wohnfläche | m² aus Maßen (Rechteck/L-Form) | `wohnfläche berechnen`, `quadratmeter rechnen`, `wohnfläche berechnung` | `calc` |
| 5 | `utility-plausibility` | Nebenkosten-Check | Abrechnung wirkt zu hoch | `nebenkosten prüfen`, `nebenkostenabrechnung zu hoch`, `betriebskosten vergleich` | `calc` |
| 6 | `rent-increase-index` | Indexmiete grob | Indexklausel — grobe Erhöhung | `indexmiete erhöhen`, `mietindex berechnen`, `vpi miete` | `calc` |
| 7 | `move-cost-estimate` | Umzugskosten grob | Budget vor Umzug | `umzugskostenrechner`, `was kostet umzug`, `umzugskosten schätzen` | `calc` |
| 8 | `handover-checklist` | Übergabe-Checkliste | Protokoll bei Ein-/Auszug | `wohnungsübergabeprotokoll`, `übergabe checkliste`, `mängelliste wohnung` | `generate` |
| 9 | `landlord-docs-checklist` | Vermieter-Unterlagen | Was will der Vermieter? | `unterlagen vermieter`, `was braucht vermieter`, `einkommensnachweis miete` | `generate` |
| 10 | `rent-vs-buy` | Miete vs. Kauf grob | Erste Orientierung (kein Finanztipp) | `mieten oder kaufen rechner`, `miete vs kauf` | `calc` |
| 11 | `room-cost-split` | WG-Kosten teilen | Nebenkosten/Miete fair splitten | `wg kosten teilen`, `miete aufteilen`, `nebenkosten wg` | `calc` |
| 12 | `parking-space-rent` | Stellplatz-Anteil | Wie viel vom Mietpreis für Garage? | `stellplatz miete anteil`, `garagenmiete üblich` | `calc` |

**Cross:** `pdf-redact` (Gehalt schwärzen) bleibt Behörden/Dokumente; Story „Vermieter“ hier queren. **Kein** Mietpreisbremse-Legal-Check (zu fehleranfällig/regional).

---

## 10. Einheiten & Umrechnen — 11 Tools (Phase 1)

**Nutzerfrage:** „Ich brauche eine schnelle Umrechnung — ohne 15 Werbung-Rechner.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `percent-calc` | Prozentrechner | Rabatt, Anteil, Aufschlag | `prozentrechner`, `prozent berechnen`, `wieviel prozent` | `calc` |
| 2 | `file-size-convert` | Dateigröße | KB/MB/GB für Upload-Limits | `mb in gb`, `dateigröße umrechnen`, `bytes zu mb` | `calc` |
| 3 | `length-convert` | Länge | cm/m/km/inch/ft | `cm in zoll`, `meter umrechnen`, `längen umrechner` | `calc` |
| 4 | `weight-convert` | Gewicht | kg/g/lb/oz | `kg in pfund`, `gewicht umrechnen` | `calc` |
| 5 | `temp-convert` | Temperatur | °C ↔ °F (Rezepte, Reisen) | `celsius fahrenheit`, `temperatur umrechnen` | `calc` |
| 6 | `speed-convert` | Geschwindigkeit | km/h ↔ mph | `kmh in mph`, `geschwindigkeit umrechnen` | `calc` |
| 7 | `area-convert` | Fläche | m² ↔ ha ↔ ft² | `quadratmeter hektar`, `fläche umrechnen` | `calc` |
| 8 | `volume-convert` | Volumen | l/ml/gal | `liter in gallon`, `volumen umrechnen` | `calc` |
| 9 | `dpi-pixel` | DPI ↔ Pixel | Druckmaß für Flyer/Passfoto | `dpi berechnen`, `pixel zu cm`, `druckauflösung` | `calc` |
| 10 | `paper-size` | Papierformate | A4/A5 Maße in mm/px | `a4 maße`, `a4 pixel`, `papierformat größe` | `check` |
| 11 | `fraction-decimal` | Bruch ↔ Dezimal | Schule / Rezept | `bruch in dezimal`, `dezimal in bruch` | `calc` |

**Nicht:** Live-Währungskurse (API), Krypto-Kurse. MwSt/Zins → Buchhaltung bzw. Steuern.

---

## 11. Web & Entwickler — 12 Tools (Phase 1)

**Nutzerfrage:** „Kleines Dev-/Webmaster-Problem — ohne IDE öffnen.“

Abgrenzung: **SEO** = Sichtbarkeit/Meta; **Web & Entwickler** = Encode/Format/Debug-Utilities.

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `json-format` | JSON formatieren | API-Response lesen | `json formatter`, `json schön`, `json validate` | `paste` |
| 2 | `base64` | Base64 | Encode/Decode für Tokens | `base64 encode`, `base64 decoder`, `base64 umwandeln` | `generate` |
| 3 | `url-encode` | URL encode/decode | Query-Parameter kaputt | `url encode`, `url decoder`, `percent encoding` | `generate` |
| 4 | `regex-tester` | Regex testen | Pattern gegen Beispieltext | `regex tester`, `regulärer ausdruck testen` | `paste` |
| 5 | `uuid-gen` | UUID erzeugen | IDs für Tests/DB | `uuid generator`, `guid erzeugen`, `uuid v4` | `generate` |
| 6 | `cron-explain` | Cron erklären | Was bedeutet `0 9 * * 1-5`? | `cron job erklären`, `crontab generator`, `cron syntax` | `generate` |
| 7 | `html-escape` | HTML escapen | XSS-sichere Snippets | `html escape`, `html entities`, `specialchars` | `generate` |
| 8 | `text-hash` | Text-Hash | SHA-256 eines Strings | `sha256 online`, `hash berechnen`, `md5 text` *(SHA-256 default)* | `generate` |
| 9 | `query-string-parse` | Query-String | `?a=1&b=2` → Tabelle | `query string parser`, `url parameter auslesen` | `paste` |
| 10 | `jwt-decode-dev` | JWT decode | Token-Inhalt (ohne Verify) | `jwt decoder`, `jwt decode online` | `paste` |
| 11 | `diff-code` | Code-Diff | Zwei Snippets vergleichen | `code diff`, `text diff online` | `paste` |
| 12 | `user-agent-parse` | User-Agent lesen | Support: welches Gerät? | `user agent parser`, `browser erkennen string` | `paste` |

**Cross:** `jwt-inspector` (Security) und `jwt-decode-dev` können **ein** Tool mit zwei Areas sein. `hash-file` bleibt Security/file; hier nur Text-Hash.

---

## 12. Steuern — 12 Tools (Phase 2)

**Nutzerfrage:** „Grobe Orientierung vor dem Steuerberater — lokal, mit Disclaimer.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `vat-reverse` | MwSt rausrechnen | Brutto→Netto für Belege | `mwst rausrechnen`, `brutto netto rechner` | `calc` |
| 2 | `afa-linear` | AfA linear | Abschreibung grob (Nutzungsdauer) | `afa berechnen`, `abschreibung rechner`, `afa tabelle` | `calc` |
| 3 | `homeoffice-pauschale` | Homeoffice-Pauschale | Tage × Pauschale (aktuelles Jahr) | `homeoffice pauschale`, `homeoffice tage berechnen` | `calc` |
| 4 | `commute-allowance` | Pendlerpauschale | km × Arbeitstage grob | `pendlerpauschale berechnen`, `entfernungspauschale` | `calc` |
| 5 | `mileage-rate` | Kilometerpauschale | Dienstwagen/Privat-km grob | `kilometerpauschale`, `0,30 euro km` | `calc` |
| 6 | `trade-tax-hebesatz` | Gewerbesteuer grob | Gewinn × Hebesatz-Hinweis | `gewerbesteuer berechnen`, `hebesatz rechner` | `calc` |
| 7 | `invoice-margin` | Verkaufskalkulation | EK → VK inkl. MwSt/Marge | `verkaufspreis kalkulieren`, `handelsspanne berechnen` | `calc` |
| 8 | `tax-deadline-calendar` | Steuerfristen | UStVA / ESt — nächste Termine (statisch) | `umsatzsteuervoranmeldung frist`, `steuertermine 2026` | `check` |
| 9 | `solidarity-surcharge` | Soli grob | Ob Soli anfällt (Schwellen-Hinweis) | `soli berechnen`, `solidaritätszuschlag` | `calc` |
| 10 | `child-benefit-hint` | Kindergeld-Orientierung | Alters-/Anzahl-Hinweis (keine Anspruchsprüfung) | `kindergeld höhe`, `kindergeld berechnen` | `calc` |
| 11 | `expense-ratio` | Betriebsausgaben-Quote | Ausgaben/Einnahmen % | `betriebsausgaben quote`, `kostenquote freiberufler` | `calc` |
| 12 | `kleinunternehmer-limit` | §19-Grenze | Umsatz vs. Grenze (Jahr) | `kleinunternehmer grenze`, `§19 ustg umsatz` | `calc` |

**Cross:** `vat-calculator` / `kleinunternehmer-check` (Buchhaltung) — **zusammenführen oder Area-M:N**, nicht doppelt bauen. Elster-Upload → Behörden (`pdf-compress`).

---

## 13. Recht & Vertrag — 11 Tools (Phase 2)

**Nutzerfrage:** „Frist/Checkliste verstehen — **kein** Anwaltsersatz.“

Pflicht-UI: „Keine Rechtsberatung. Bei Unsicherheit Fachperson.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `withdrawal-period` | Widerrufsfrist | Wann endet 14-Tage-Frist? | `widerrufsfrist berechnen`, `14 tage widerruf`, `widerrufsrecht frist` | `calc` |
| 2 | `limitation-period-hint` | Verjährung grob | Regelverjährung 3 Jahre — Stichtag | `verjährungsfrist`, `wann verjährt forderung` | `calc` |
| 3 | `late-interest` | Verzugszinsen | Rechnung überfällig — Zinsen grob | `verzugszinsen berechnen`, `verzugszinssatz` | `calc` |
| 4 | `vacation-entitlement` | Urlaubsanspruch | Teiljahr / Austritt grob | `urlaubsanspruch berechnen`, `urlaub anteilig` | `calc` |
| 5 | `probation-end` | Probezeit-Ende | Startdatum + X Monate | `probezeit ende`, `probezeit berechnen` | `calc` |
| 6 | `contract-penalty-hint` | Vertragsstrafe grob | % vom Auftrag — Plausibilität | `vertragsstrafe berechnen` | `calc` |
| 7 | `impressum-checklist` | Impressum-Checkliste | Was muss rein? (TMG/DDG-Hinweis) | `impressum generator`, `impressum pflichtangaben`, `was muss ins impressum` | `generate` |
| 8 | `privacy-checklist` | Datenschutz-Checkliste | Website-Basics (kein Generator-Legal) | `datenschutzerklärung checkliste`, `dsgvo website checkliste` | `generate` |
| 9 | `power-of-attorney-fields` | Vollmacht-Felder | Welche Felder braucht eine Vollmacht? | `vollmacht vorlage`, `vollmacht muster inhalte` | `generate` |
| 10 | `cancellation-letter-outline` | Kündigungsschreiben-Gerüst | Struktur (kein fertiger Rechtsbrief) | `kündigung schreiben vorlage`, `kündigung muster struktur` | `generate` |
| 11 | `retention-period-hint` | Aufbewahrungsfristen | 6/10 Jahre — Belegtyp grob | `aufbewahrungsfrist rechnungen`, `wie lange belege aufbewahren` | `check` |

**Nicht:** AGB-Generator, fertige Kündigung mit Rechtswirkung, Mieterschutz-Urteile.

---

## 14. Kommunikation — 11 Tools (Phase 2)

**Nutzerfrage:** „Kontakt / Einladung / Signatur — einmal richtig machen.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `vcard-qr` | vCard-QR | Visitenkarte scannen lassen | `vcard qr code`, `visitenkarte qr`, `kontakt qr code` | `generate` |
| 2 | `email-signature` | E-Mail-Signatur | HTML-Signatur für Outlook/Gmail | `email signatur generator`, `html signatur`, `e-mail fußzeile` | `generate` |
| 3 | `whatsapp-link` | WhatsApp-Link | wa.me mit Text vorausgefüllt | `whatsapp link generieren`, `wa.me link`, `whatsapp api link` | `generate` |
| 4 | `mailto-builder` | Mailto-Link | Betreff/Body für „Kontakt“-Button | `mailto link generator`, `mailto mit betreff` | `generate` |
| 5 | `ics-invite` | Kalender-Einladung | .ics für Meeting erzeugen | `ics datei erstellen`, `kalendereinladung generieren`, `outlook einladung ics` | `generate` |
| 6 | `phone-format-de` | Telefon formatieren | +49 / 0… einheitlich | `telefonnummer formatieren`, `rufnummer normalisieren` | `generate` |
| 7 | `meeting-agenda` | Agenda-Gerüst | Call-Agenda in 30 Sekunden | `meeting agenda vorlage`, `besprechungsprotokoll struktur` | `generate` |
| 8 | `out-of-office` | Abwesenheitsnotiz | OO-Text DE/EN | `abwesenheitsnotiz vorlage`, `out of office text` | `generate` |
| 9 | `telegram-link` | Telegram-Link | t.me / share-URL | `telegram link generieren`, `t.me link` | `generate` |
| 10 | `sms-link` | SMS-Link | `sms:` URI mit Text | `sms link generieren`, `sms uri` | `generate` |
| 11 | `call-notes-template` | Anrufnotiz | Strukturierte Notiz nach Call | `anrufnotiz vorlage`, `telefonnotiz muster` | `generate` |

---

## 15. Barrierefreiheit — 10 Tools (Phase 2)

**Nutzerfrage:** „Ist meine Seite / mein Text für mehr Menschen nutzbar?“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `contrast-check` | Kontrast prüfen | Textfarbe auf Hintergrund WCAG | `kontrast prüfer`, `wcag kontrast`, `farbkontrast berechnen` | `check` |
| 2 | `color-blind-sim` | Farbblind-Simulation | Palette für Deuteranopie prüfen | `farbblindheit simulation`, `deuteranopie simulator` | `editor` |
| 3 | `alt-text-length` | Alt-Text Länge | Bildbeschreibung zu lang/kurz | `alt text länge`, `alt attribut best practice` | `calc` |
| 4 | `focus-visible-hint` | Focus-Checkliste | Tastatur-Fokus sichtbar? | `focus outline`, `tastatur bedienbarkeit checkliste` | `generate` |
| 5 | `rem-px` | rem ↔ px | Schriftgröße barrierearm planen | `rem zu px`, `px zu rem rechner` | `calc` |
| 6 | `plain-language-hint` | Leichte Sprache grob | Satzlänge / Fremdwörter-Hinweis | `leichte sprache prüfen`, `einfache sprache tool` | `paste` |
| 7 | `link-text-check` | Linktext prüfen | „hier klicken“ erkennen | `barrierefreie links`, `linktext prüfen` | `paste` |
| 8 | `heading-a11y` | Überschriften-Hierarchie | H1–H6 Sprünge | `überschriften hierarchie`, `h1 h2 prüfung` | `paste` |
| 9 | `aria-name-hint` | ARIA-Name Checkliste | Button ohne zugänglichen Namen | `aria label`, `accessible name` | `generate` |
| 10 | `motion-reduce-hint` | Motion-Checkliste | Animationen & `prefers-reduced-motion` | `prefers reduced motion`, `animation barrierefreiheit` | `generate` |

**Cross:** `seo-heading-outline` und `heading-a11y` können eine Engine teilen. Kontrast auch unter Kreativ verlinken.

---

## 16. Kreativ & Farbe — 11 Tools (Phase 2)

**Nutzerfrage:** „Farbe / Format / kleines Design-Utility — schnell.“

| # | Tool-ID | Kurztitel | Need | Suchintention (Cluster) | Shell |
| --- | --- | --- | --- | --- | --- |
| 1 | `hex-rgb` | Hex ↔ RGB | Farbe aus CSS / Design-Tool | `hex to rgb`, `rgb zu hex`, `farbcode umrechner` | `calc` |
| 2 | `color-palette` | Palette erzeugen | 5 Farben aus einer Basis | `farbpalette generator`, `color palette`, `harmonische farben` | `generate` |
| 3 | `complementary-color` | Komplementärfarbe | Kontrastfarbe für Button | `komplementärfarbe`, `gegenüberliegende farbe` | `calc` |
| 4 | `gradient-css` | CSS-Gradient | Linear/Radial Copy-Paste | `css gradient generator`, `verlauf generator` | `generate` |
| 5 | `image-color-pick` | Farbe aus Bild | Dominant/Hex aus Upload | `farbcode aus bild`, `color picker image` | `file` |
| 6 | `cmyk-rgb` | CMYK ↔ RGB | Druck vs. Screen grob | `cmyk zu rgb`, `cmyk umrechner` | `calc` |
| 7 | `aspect-ratio` | Seitenverhältnis | 16:9 Ausschnitt planen | `aspect ratio calculator`, `seitenverhältnis berechnen` | `calc` |
| 8 | `favicon-pack` | Favicon-Paket | PNG → ICO/Sizes-Hinweis | `favicon generator`, `favicon erstellen` | `file` |
| 9 | `shadow-css` | Box-Shadow | Brutal/ soft Shadow bauen | `box shadow generator`, `css schatten` | `generate` |
| 10 | `tint-shade` | Aufhellen/Abdunkeln | Hover-Zustände | `farbe aufhellen`, `shade tint generator` | `calc` |
| 11 | `brand-contrast-pair` | Marken-Kontrast | Logo-Farbe + Text WCAG | `logo farbe kontrast`, `brand color accessibility` | `check` |

**Cross:** `contrast-check` (A11y), `image-*` (Bilder). Kein voller Canva-Ersatz.

---

## Tool Shells — generische UI-Muster

Viele der ~70 geplanten Tools unterscheiden sich nur in **Logik und Labels**, nicht in Layout. Statt 40 eigene React-Pages bauen wir **Shells** (wiederverwendbare Tool-Rahmen) und hängen pro Tool eine **Definition** dran.

### Was schon da ist (implizit)

| Baustein | Pfad | Deckt ab |
| --- | --- | --- |
| PDF-Engine | `_shared/pdf/*` | compress, redact, form-fill, merge, sign |
| Bild-Pipeline | `_shared/image/*` | convert, compress, resize, rotate, exif |
| Varianten-Matrix | `image/variants.ts` + `ToolVariant` | 1 Engine → viele SEO-Einstiege |
| Sticky Footer | `ToolStickyFooter.tsx` | Editor-Tools (redact) |
| UI-Primitives | `_shared/_shared.tsx` | ResultCard, InfoGrid, ProgressBar |
| Job-Queue | `shell/jobs` | Stapel-Verarbeitung (Bilder) |

**Fehlt noch:** explizite Shells für Formular-only-Tools (Rechner, Checker, Generator, Paste-Analyse).

### Sieben Shell-Typen

```text
calc       Felder ──live──► Ergebnis-Karte (InfoGrid)
check      Eingabe ──► gültig/ungültig + Detailzeilen
generate   Formular ──► Text | QR | JSON | Download
file       Dropzone ──► Optionen ──► Progress ──► Download
paste      Textarea/URL ──► Parser ──► Report (Liste/Warnungen)
editor     Vorschau/Canvas + Undo + Sticky-Footer-Aktionen
extract    Datei/Text ──► strukturierte Felder (kopierbar)
```

#### 1. `calc` — CalculatorToolShell

**UX:** Eingabefelder links/oben, Ergebnis live darunter (debounced). Kein Submit-Button nötig — außer wenn Berechnung teuer ist.

**Passt zu:** `vat-calculator`, `skonto-calculator`, `amount-in-words`, `invoice-due-date`, `kleinunternehmer-check`, `payment-split`, `seo-title-length`, `seo-keyword-density`

**Pro Tool nur:**
- Feld-Schema (Typ, Label, Default, Validierung)
- `compute(values) → { rows, tone?, hint? }`
- optional Presets (z. B. MwSt 19 % / 7 %)

**Beispiel-Definition (Konzept):**

```typescript
defineCalcTool({
  catalog: { /* wie bisher */ },
  fields: [
    { id: 'amount', type: 'currency', label: 'Betrag', default: '' },
    { id: 'mode', type: 'segment', label: 'Richtung', options: [
      { value: 'gross-to-net', label: 'Brutto → Netto' },
      { value: 'net-to-gross', label: 'Netto → Brutto' },
    ]},
    { id: 'rate', type: 'segment', label: 'MwSt', options: [19, 7] },
  ],
  compute: ({ amount, mode, rate }) => vatCalc(amount, mode, rate),
});
```

**Einheitlichkeit:** gleiche Feld-Labels (`font-display uppercase`), gleiche ResultCard, gleiche Fehlercopy bei ungültigen Zahlen.

#### 2. `check` — CheckToolShell

**UX:** 1–2 Inputs, optional Button „Prüfen“, dann ResultCard success/danger/info. Netzwerk-Tools zeigen Trust-Badge („sendet Prefix-Hash“).

**Passt zu:** `iban-validate` ✅, `pwned-check`, `breach-password-check`, `password-strength`, `url-phishing-check`, `id-photo-check`, `image-dpi-check`

**Refactor-Kandidat:** `IbanCheckTool` → erste Implementierung der Shell; Widgets (`QuickIbanWidget`) nutzen dieselbe `check()`-Funktion.

#### 3. `generate` — GenerateToolShell

**UX:** Formular → Output-Panel (QR, Code-Block, Vorschau). Copy/Download-Buttons einheitlich.

**Passt zu:** `girocode-gen` ✅, `password-generator`, `totp-generator`, `seo-slug-generator`, `seo-schema-generator`, `seo-meta-preview`, `seo-og-preview`

**Refactor-Kandidat:** `GiroCodeTool` — fast schon Generate-Shell, fehlt nur Extraktion.

#### 4. `file` — FilePipelineToolShell

**UX:** Dropzone → Einstellungen → Progress/Preview → Download. Sticky Footer optional.

**Passt zu:** alle Bild-PDF-Tools ✅, die meisten Behörden/Dokumente-`file`-Tools

**Ausbau:** generisches `FilePipelineToolShell` mit Hooks:
- `accept`, `process(file, settings)`, `settingsPanel`, `previewPanel`
- PDF-Familie teilt `_shared/pdf/io` + job pattern wie Bilder

#### 5. `paste` — PasteAnalyzeToolShell

**UX:** großes Textfeld (oder URL), „Analysieren“, Report als Liste/Sections mit Severity (ok/warn/error).

**Passt zu:** SEO-Checker (sitemap, robots, structured-data, canonical, hreflang), Security (`jwt-inspector`, `email-header-check`, `cert-viewer`, `pgp-key-info`, `privacy-redact-text`)

**Besonderheit:** optional Tab „URL laden“ mit explizitem Netzwerk-Hinweis.

#### 6. `editor` — EditorToolShell

**UX:** große Vorschau, Werkzeuge, Undo/Redo, `ToolStickyFooter` für Primäraktion.

**Passt zu:** `pdf-redact`, `pdf-sign`, `pdf-form-fill`, `pdf-page-reorder`, `pdf-compare`, `image-crop`, `image-brightness`, `image-watermark`

**Bereits:** Footer-Pattern steht; Editor-Shell wäre Wrapper um Canvas + History-Hook.

#### 7. `extract` — ExtractToolShell

**UX:** Datei oder Text rein → strukturierte Ergebnisfelder + „Kopieren“ pro Feld.

**Passt zu:** `epc-read`, `sepa-qr-read`, `ocr-local`, `pdf-extract-text`

**Overlap mit `check`:** Extract zeigt immer Daten; Check bewertet zusätzlich gut/schlecht.

---

### Verteilung über die Roadmap (inkl. neue Bereiche)

| Shell | Anzahl Tools (ca.) | Priorität Shell-Bau |
| --- | ---: | --- |
| `calc` | ~55+ | **höchste** — Zeit, Einheiten, Wohnen, Steuern, Buchhaltung |
| `generate` | ~30+ | **hoch** — Kommunikation, Kreativ, Web, Text |
| `paste` | ~25+ | **hoch** — SEO, Web, Text, Security, A11y |
| `file` | ~30 | mittel — PDF/Bild schon vorhanden |
| `check` | ~15 | hoch — IBAN/Pwned als Vorlage |
| `editor` | ~10 | niedrig — Footer shared |
| `extract` | ~5 | mittel — OCR/EPC |

---

### Ordnerstruktur (Vorschlag)

```text
tools/_shared/shells/
  CalcToolShell.tsx
  CheckToolShell.tsx
  GenerateToolShell.tsx
  FilePipelineToolShell.tsx
  PasteAnalyzeToolShell.tsx
  EditorToolShell.tsx      # dünn — hauptsächlich Layout + Footer-Slot
  ExtractToolShell.tsx
  fields/                  # CurrencyField, SegmentField, DateField, …
  defineCalcTool.ts        # Factory → config.ts bleibt dünn
  types.ts
```

Pro Tool dann:

```text
tools/vat-calculator/
  config.ts          # catalog + calcDefinition
  compute.ts         # reine Logik + Tests
  # kein VatCalculatorTool.tsx nötig
```

---

### Varianten innerhalb einer Shell

Analog `image-convert` / `ToolVariant`:

- **MwSt-Rechner** Varianten: `brutto-netto`, `netto-brutto` (SEO-Slug)
- **Passwort-Generator** Varianten: `pin`, `passphrase`, `hex`
- **PDF split** Varianten: `eine-seite-pro-datei`, `seitenbereich`

Eine Shell + Varianten-Matrix ersetzt Dutzend Mini-Pages.

---

### Umsetzungsreihenfolge Shells

1. **`calc` + Feld-Bibliothek** → 6 Buchhaltung-Tools + 2 SEO in einem Sprint
2. **`check`** ← `iban-validate` refactoren; dann Security-Cluster
3. **`paste`** → SEO-Checker-Bundle (8 Tools, eine Shell)
4. **`generate`** ← `girocode-gen` refactoren
5. **`file`** — PDF-Standardpipeline (`split`, `rotate`, `grayscale`) auf Image-Pipeline-Muster
6. **`extract`** / **`editor`** — wenn spezifische Tools es verlangen

---

## Querschnitt: Shared Tools & Dedup

| Tool-ID | Primär | Sekundär / Merge |
| --- | --- | --- |
| `epc-read` | Buchhaltung | Dokumente |
| `pdf-split` | Behörden | Dokumente |
| `pdf-page-rotate` | Behörden | Dokumente |
| `pdf-page-reorder` | Behörden | Dokumente |
| `pdf-flatten` | Dokumente | Behörden |
| `image-to-pdf` | Bilder | Behörden, Dokumente |
| `vat-calculator` / `vat-reverse` | Buchhaltung | Steuern — **ein Tool, zwei Areas** |
| `kleinunternehmer-check` / `kleinunternehmer-limit` | Buchhaltung | Steuern — **merge** |
| `jwt-inspector` / `jwt-decode-dev` | Security | Web — **ein Tool** |
| `text-diff` / `diff-code` | Text | Web — gleiches Diff, andere Defaults |
| `seo-heading-outline` / `heading-a11y` | SEO | Barrierefreiheit — shared Parser |
| `contrast-check` | Barrierefreiheit | Kreativ |
| `invoice-due-date` | Buchhaltung | Zeit (Story-Link) |
| `pdf-redact` + Vermieter-Story | Behörden | Wohnen (Story-Link) |

---

## Umsetzungswellen (Vorschlag)

**Welle 0 — Shells**

1. `calc` + Feld-Bibliothek
2. `paste` + `generate`
3. `check` (IBAN-Refactor)

**Welle A — Bestehende Bereiche auf ≥10**

1. Buchhaltung (`calc`-Cluster)
2. SEO (`paste`/`generate`)
3. Behörden/Dokumente (`file`-PDF shared)
4. Security (`check`/`paste`)
5. Bilder (Rest `file`/`editor`)

**Welle B — Phase-1-Bereiche (neu im Katalog)**

1. Text & Schreiben
2. Zeit & Fristen
3. Einheiten & Umrechnen *(schnell, fast nur `calc`)*
4. Wohnen & Miete
5. Web & Entwickler

**Welle C — Phase-2-Bereiche**

1. Kommunikation *(fast nur `generate`)*
2. Kreativ & Farbe
3. Barrierefreiheit
4. Steuern *(Disclaimer + Jahres-Konstanten)*
5. Recht & Vertrag *(stärkste Disclaimer-Pflicht zuletzt)*

**Welle D — Polish**

- Area-Accent-Farben + Icons für neue Bereiche
- Stories + Search-Slots + Embeddings
- Dedup-Merges aus Querschnitt-Tabelle

---

## Nächste Schritte (wenn umgesetzt werden soll)

1. Phase-1-Bereiche priorisieren (Vorschlag: Text → Zeit → Einheiten).
2. Keyword-Cluster vor erstem Launch mit Keyword-Planer (DE) gegenprüfen — Tools mit totem Intent streichen.
3. Pro Welle: Shell zuerst, dann Tool-Batch (nicht 100 Tools einzeln).
4. Katalog: neue `AreaId`s + Accents erst wenn Welle B startet.
5. Optional Validator: Warnung wenn `area.toolCount < 10`.

## Nicht in Scope

- Server-side Konvertierung (DOCX→PDF, Cloud-OCR)
- Behörden-Workspace-Pipeline
- Automatisches Anlegen aller 📋-Tools als `PlannedTool`-Stubs im Katalog
- Sofortiger Refactor aller bestehenden ✅-Tools auf Shells (schrittweise bei Berührung)
- KI-Textumschreibung, Live-Währungskurse, AGB-/Impressum-„Legal-Generator“ mit Rechtswirkung
- Exakte Keyword-Volumina in diesem Dokument (Intent-Cluster reichen für Planung)