# Inhalts-Übersicht — Luca Arnoldi App Studio (LAAS) Website

Stand: 2026-08-03 · Quelle: `src/`
One-Pager (Next.js App Router), Sprache **Deutsch**, Dark Theme.

**Seitenreihenfolge:** Hero → Was ich gebaut habe → Expertise → Über mich → Kontakt/CTA
(zwischen allen Sections ein `SectionDivider`)

---

## 0. Globale Daten & Meta

### Stammdaten (`src/lib/constants.ts` → `SITE_CONFIG`)

| Feld | Wert |
|---|---|
| Name | Luca Arnoldi App Studio |
| Titel | Fullstack Developer & Digital Experience Engineer |
| Tagline | „Code, die sich lebendig anfühlt" *(nirgends auf der Seite ausgegeben)* |
| E-Mail | hello@lucaarnoldi.com |
| GitHub | https://github.com/Lux593 |
| LinkedIn | https://www.linkedin.com/in/luca-arnoldi-2893521ba/ |
| Instagram | https://www.instagram.com/luca_85ar/ |

### SEO / Metadaten (`src/app/layout.tsx`)

- **Browser-Titel:** „Luca Arnoldi — Fullstack Developer & Digital Experience Engineer"
- **Meta-Description:** „Ich baue digitale Erlebnisse, die nicht nur funktionieren — sie faszinieren. Fullstack Developer spezialisiert auf React, Next.js, KI-Integration & Premium Web Experiences."
- **Keywords:** Fullstack Developer, Web Developer, React, Next.js, TypeScript, AI Integration, Digital Experience
- **OpenGraph / Twitter:** Titel „Luca Arnoldi — Fullstack Developer", Text „Ich baue digitale Erlebnisse, die faszinieren.", Bild `/images/og-image.png` (1200×630), Locale `de_DE`, URL `https://lucaarnoldi.com`
- **Structured Data (JSON-LD):** Schema.org `Person` — Name Luca Arnoldi, jobTitle „Fullstack Developer", sameAs = die 3 Socials, knowsAbout = Web Development, React, Next.js, TypeScript, AI Integration
- **Skip-Link (Barrierefreiheit):** „Zum Inhalt springen"
- **Favicon:** `/favicon.svg` · **Theme-Color:** `#050505`
- **robots.txt:** alles erlaubt, Sitemap → `https://lucaarnoldi.com/sitemap.xml`
- **sitemap.ts:** enthält nur die Startseite (Priorität 1, monatlich)

### Schriften
- **Display/Headlines:** DM Sans (als `--font-clash`)
- **Body:** DM Sans (als `--font-satoshi`)
- **Serif:** Instrument Serif (normal + italic, als `--font-instrument`)

---

## 1. Navigation (`components/ui/Navigation.tsx`)

Fixierte Leiste oben, fährt nach 2,5 s Verzögerung von oben ein.

| Element | Inhalt |
|---|---|
| Logo (links) | Bild `/liftapp.png`, Alt-Text „LAAS - Luca Arnoldi App Studio", verlinkt auf `#` |
| Button (rechts) | 2-Strich-Burger, wird zum X; Aria-Label „Navigationsmenü umschalten" |

**Fullscreen-Overlay-Menü** (Kreis-Wipe von oben rechts), Einträge aus `NAV_ITEMS`:

| Label | Ziel |
|---|---|
| Projekte | `#work` |
| Expertise | `#expertise` |
| Über mich | `#about` |
| Kontakt | `#contact` |

Zusätzlich global: `ScrollProgress` (Fortschrittsbalken), `GrainOverlay` (Film-Grain), `SmoothScroll` (Lenis).

---

## 2. Hero (`components/sections/Hero.tsx`) — `#hero`

Vollbild, Hintergrund `#050505`, dahinter 3D-Canvas (`HeroCanvas`, 80 % Deckkraft, Blend-Mode „screen"). Text folgt leicht der Maus (Desktop). Einblendung nach 2,2 s.

**Textinhalt:**

| Zeile | Text |
|---|---|
| Zeile 1 (groß, fett) | **Hey, ich bin Luca** |
| Zeile 2 (leicht, sekundär) | Ich biete |
| Zeile 3 (rotierend, Farbverlauf) | siehe unten |

**Rotierende Wörter** — Wechsel alle 3 Sekunden im Loop:
1. Web-Apps
2. Native Apps
3. KI-Integration
4. Prozessautomation

**Scroll-Indikator (unten mittig):** Text „Scrollen" (Farbe `#DFBE9F`) + animierte vertikale Linie.

---

## 3. Was ich gebaut habe (`components/sections/SelectedWork.tsx`) — `#work`

**Section-Header:**
- Kicker: „01 — Was ich gebaut habe."
- Headline: **„Was ich gebaut habe."**

> Hinweis: Kicker und Headline sind identisch — üblicherweise steht im Kicker nur ein Label (z. B. „01 — Projekte").

**Darstellung:** 3 gepinnte `FlipCard`s. Jede Karte wird beim Scrollen fixiert und dreht sich um die X-Achse von der Vorder- auf die Rückseite.

- **Vorderseite:** große Nummer (01/02/03) im Hintergrund, Kundenlogo, Kategorie · Jahr, Titel, Untertitel, Kurzbeschreibung
- **Rückseite:** Titel + Jahr-Badge, ausführlicher Text, Feature-Kacheln, Tech-Stack-Pills

### Projekt 01 — Harley-Davidson Powershop

| Feld | Inhalt |
|---|---|
| Untertitel | Operations & Management Web-App |
| Kategorie | Fullstack / Web-App |
| Jahr | 2024 – heute |
| Akzentfarbe | `#C49F7B` |
| Logo | `/harley-davidson-logo.png` |
| Tech | React, Next.js, Python, OpenAI, PostgreSQL |

**Kurzbeschreibung (Vorderseite):**
> Eine maßgeschneiderte Web-App für das Management des Tagesgeschäfts, der Mitarbeiter- und Eventplanung – ergänzt durch Workflow-Automatisierungen und KI-gestützte Prozesse.

**Detailtext (Rückseite):**
> Für den Harley-Davidson Powershop habe ich eine umfassende Management-Plattform entwickelt, die sämtliche operative Abläufe digitalisiert und optimiert.

**Features (4):**

| Feature | Beschreibung |
|---|---|
| Tagesgeschäft-Management | Zentrale Oberfläche zur Steuerung des täglichen Geschäftsbetriebs mit Echtzeit-Übersichten und Aufgabenverwaltung. |
| Mitarbeiter- & Eventplanung | Integrierte Planung für Schichten, Verfügbarkeiten und Events mit automatischer Konflikterkennung. |
| Workflow-Automatisierungen | Automatisierte Geschäftsprozesse, die repetitive Aufgaben eliminieren und den operativen Alltag beschleunigen. |
| KI-Prozesse & Funktionen | Implementierung intelligenter Funktionen auf Basis von KI – von automatisierten Auswertungen bis zur smarten Entscheidungsunterstützung. |

### Projekt 02 — Intersport GEMO

| Feld | Inhalt |
|---|---|
| Untertitel | Verleih-App & Management Dashboard |
| Kategorie | Fullstack / Web-App |
| Jahr | 2025 |
| Akzentfarbe | `#DFBE9F` |
| Logo | `/intersport-gemo-logo.png` |
| Tech | React, Next.js, Supabase, Tailwind CSS |

**Kurzbeschreibung:**
> Eine Verleih-App zur digitalen Abwicklung des gesamten Verleihprozesses zwischen Kunde und Intersport GEMO – inklusive Management-View für KPIs.

**Detailtext:**
> Für Intersport GEMO habe ich eine vollständige Verleih-Plattform entwickelt, die den Prozess von der Kundenanfrage bis zur Rückgabe digital abbildet.

**Features (3):**

| Feature | Beschreibung |
|---|---|
| Digitaler Verleihprozess | End-to-End Abwicklung des Verleihs – von der Reservierung über die Ausgabe bis zur Rückgabe, vollständig digital und papierlos. |
| Kunden-Interface | Intuitive Oberfläche für Kunden zur Auswahl, Buchung und Verwaltung ihrer Verleih-Artikel. |
| Management-View & KPIs | Dashboard für das Management mit Echtzeit-KPIs zu Auslastung, Umsatz und Bestandsübersicht. |

### Projekt 03 — mobileObjects

| Feld | Inhalt |
|---|---|
| Untertitel | Feature-Entwicklung für bestehende Apps |
| Kategorie | Fullstack / Zusatzentwicklung |
| Jahr | seit 2025 |
| Akzentfarbe | `#A07850` |
| Logo | `/mobileobjects-logo.png` |
| Tech | Next.js, n8n, PostgreSQL, Docker, AWS |

**Kurzbeschreibung:**
> Entwicklung von Zusatzfunktionen für bestehende Applikationen – von Messaging-Systemen über Benutzerverwaltung bis hin zu operativen Tools.

**Detailtext:**
> Für mobileObjects entwickle ich fortlaufend neue Features und Module, die nahtlos in die bestehende App-Landschaft integriert werden.

**Features (3):**

| Feature | Beschreibung |
|---|---|
| Messaging-System | Integriertes Nachrichtensystem für die direkte Kommunikation zwischen Nutzern innerhalb der Plattform. |
| Benutzerverwaltung & Rollenkonzept | Feingranulares Rollen- und Berechtigungssystem zur Steuerung von Zugriffen und Funktionen je nach Nutzerrolle. |
| Operative Tools | Praxisnahe Werkzeuge für den operativen Alltag, die Arbeitsabläufe vereinfachen und die Effizienz steigern. |

---

## 4. Expertise (`components/sections/BentoGrid.tsx`) — `#expertise`

**Section-Header:**
- Kicker: „02 — Expertise"
- Headline: **„Was ich mitbringe."**

**Layout:** Bento-Grid, 3 Karten (1 volle Breite + 2 halbe).

### Karte 1 — App-Entwicklung *(volle Breite)*

- **Label:** App-Entwicklung
- **Headline:** Deine Idee als fertige App
- **Text:** Maßgeschneiderte Native- und Web-Apps mit perfektem UI/UX-Design nach modernsten Standards.
- **Code-Snippet (Deko):**
  ```js
  const app = { ui: 'pixel-perfect', stack: 'React + Native', deploy: 'überall' };
  ```

### Karte 2 — Automatisierung

- **Label:** Automatisierung
- **Headline:** Weniger Handarbeit, mehr Ergebnis
- **Text:** KI-Modelle einbauen, Prozesse automatisieren, Daten auswerten. Smart Workflows, die deine Tools vernetzen — kein Copy-Paste mehr.
- **Visual:** 3D-Workflow-Animation (`WorkflowScene`)

### Karte 3 — Tech Stack

- **Label:** Tech Stack
- **Headline:** Tools die ich mag
- **Inhalt:** 12 verlinkte Tool-Icons (Graustufen, bei Hover farbig)

| Tool | Link |
|---|---|
| n8n | https://n8n.io |
| Supabase | https://supabase.com |
| Firebase | https://firebase.google.com |
| Firefly | https://www.adobe.com/products/firefly.html |
| Hostinger | https://www.hostinger.com |
| Make | https://www.make.com |
| Cursor AI | https://www.cursor.com |
| Anthropic | https://www.anthropic.com |
| Gemini | https://gemini.google.com |
| GitHub | https://github.com |
| Spotify | https://www.spotify.com |
| YouTube | https://www.youtube.com |

> Hinweis: In `EXPERTISE` gibt es einen **dritten Eintrag „Premium Hosting"** („Blitzschnelles, DSGVO-konformes Hosting. Server, Backups und Skalierung laufen vollautomatisch.") — dieser wird auf der Seite **nicht angezeigt**, weil Karte 3 stattdessen den Tech Stack zeigt. Die hinterlegten `icon`-Werte (`layers`, `brain`, `server`) werden ebenfalls nicht verwendet.

---

## 5. Über mich / Manifest (`components/sections/Manifesto.tsx`) — `#about`

**Section-Header:**
- Kicker: „03 — Manifest"
- Headline: **„Über mich."**

**Layout:** Text links, Portraitfoto rechts (auf Mobil oberhalb). Foto: `/personal_pic.jpg`, Alt „Luca Arnoldi", 30 % Graustufen, auf Desktop sticky mit Parallax.

**Manifest-Text** (`MANIFESTO_TEXT`) — wird Wort für Wort beim Scrollen von grau auf weiß aufgehellt, über 250vh Scrollstrecke:

> **Ich verstehe dein Problem und löse es mit Code. Kurze Wege und ehrliche Kommunikation. Ich baue dir, was du brauchst – ohne bla bla.**

---

## 6. Kontakt / CTA (`components/sections/GiganticCTA.tsx`) — `#contact`

Vollbild-Section, **heller Hintergrund `#f0ede8`** (Farb-Umkehr zum Rest der Seite). Die Karte wird beim Scrollen von unten hereingewischt (Mobil: Fullscreen-Wipe, Desktop: Scale + abgerundete Ecken).

**Inhalt (zentriert):**

| Element | Text |
|---|---|
| Headline | **Lust auf ein Projekt ?** |
| Unterzeile | schreib mir - dann starten wir. |
| Button (magnetisch) | **Projekt starten →** → `mailto:hello@lucaarnoldi.com` |

**Social-Links** (Icon + Kleinbuchstaben-Label, öffnen in neuem Tab):
- github → https://github.com/Lux593
- linkedin → https://www.linkedin.com/in/luca-arnoldi-2893521ba/
- instagram → https://www.instagram.com/luca_85ar/

**Footer (unterer Rand):**
- Links: `© {aktuelles Jahr} Luca Arnoldi App Studio`
- Rechts: **AGB** (`/agb`) · **Datenschutz** (`/datenschutz`) · **Impressum** (`/impressum`)

---

## 7. Inhaltliche Lücken & Auffälligkeiten

| # | Punkt | Details |
|---|---|---|
| 1 | **Rechtsseiten fehlen komplett** | Footer verlinkt `/agb`, `/datenschutz`, `/impressum` — es existiert aber nur `src/app/page.tsx`. Alle drei Links führen zu 404. Für eine geschäftliche Website in DE/AT/CH ist ein Impressum + Datenschutzerklärung Pflicht. |
| 2 | **OG-Bild fehlt** | `metadata` verweist auf `/images/og-image.png`, die Datei existiert nicht → Link-Vorschauen in WhatsApp/LinkedIn/Slack bleiben leer. |
| 3 | **„Premium Hosting" wird nie gezeigt** | Dritte Expertise-Leistung steht in `constants.ts`, erscheint aber auf keiner Karte. Entweder Karte ergänzen oder Eintrag entfernen. |
| 4 | **Kicker = Headline in Section 01** | „01 — Was ich gebaut habe." über „Was ich gebaut habe." — doppelt. Sections 02/03 machen es richtig („02 — Expertise", „03 — Manifest"). |
| 5 | **Ungenutzte Projekt-Bilder** | `project.image` (`/images/projects/*.webp`) ist in allen 3 Projekten gesetzt, der Ordner ist leer und `FlipCard` nutzt das Feld gar nicht — nur `logo`. |
| 6 | **Tagline erscheint nirgends** | „Code, die sich lebendig anfühlt" steht in `SITE_CONFIG`, wird aber nicht gerendert. |
| 7 | **Preloader deaktiviert** | In `layout.tsx` auskommentiert; die referenzierte Videodatei `/Firmenlogo_Animation_Für_Loading_Screen.mp4` fehlt ohnehin im `public/`-Ordner. |
| 8 | **Sitemap unvollständig** | Enthält nur `/`. Sobald die Rechtsseiten existieren, sollten sie ergänzt werden. |
| 9 | **Kleinere Typo-Punkte** | „Lust auf ein Projekt ?" — Leerzeichen vor Fragezeichen (französische Konvention, im Deutschen unüblich). „schreib mir - dann starten wir." nutzt Bindestrich statt Gedankenstrich „–". Social-Labels erscheinen kleingeschrieben („github", „linkedin", „instagram"), weil der Objektschlüssel direkt ausgegeben wird. |
| 10 | **Kein Leistungs-/Preis-Bereich** | Die Seite beschreibt Können und Projekte, aber keinen Ablauf, keine Pakete/Preise und kein Kontaktformular — einziger Konversionspfad ist der `mailto:`-Link. |

---

## 8. Kurzfassung: Wo steht welcher Text?

| Inhalt | Datei |
|---|---|
| Stammdaten, Socials, E-Mail | `src/lib/constants.ts` → `SITE_CONFIG` |
| Manifest-Text | `constants.ts` → `MANIFESTO_TEXT` |
| Alle Projektdaten | `constants.ts` → `PROJECTS` |
| Expertise-Texte | `constants.ts` → `EXPERTISE` |
| Tool-Liste | `constants.ts` → `TECH_STACK` |
| Menüpunkte | `constants.ts` → `NAV_ITEMS` |
| Hero-Headline + rotierende Wörter | `components/sections/Hero.tsx` |
| Section-Headlines & Bento-Headlines | jeweils in der Section-Komponente hartkodiert |
| CTA-Texte + Footer-Links | `components/sections/GiganticCTA.tsx` |
| SEO/Meta/JSON-LD | `src/app/layout.tsx` |
