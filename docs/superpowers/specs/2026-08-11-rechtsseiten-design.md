# Rechtsseiten: AGB, Datenschutz, Impressum (+ 404)

Stand: 11.08.2026 — freigegeben

## Ausgangslage

Die Fusszeile der Kontaktkarte (`components/sections/GiganticCTA.tsx:364-367`) verlinkt
auf `/agb`, `/datenschutz` und `/impressum`. Diese Routen existieren nicht — die Seite
hat genau eine Route (`app/page.tsx`). Jeder Klick landet auf Nexts nackter
Standard-404 ohne Design.

## Ziel

Die drei Rechtsseiten existieren, sind rechtlich vollständig gegliedert und lesen sich
als Teil dieser Website — nicht als angeklebtes PDF. Fehlende Angaben stehen als
sichtbare, auffindbare Platzhalter drin und lassen sich später an genau einer Stelle
nachfüllen. Die 404 bekommt dieselbe Formensprache.

**Rechtsraum:** Deutschland. Die Geschäftsadresse steht im Code als 79576 Weil am Rhein
(`ABOUT_INTRO.location`).

**Kein Rechtsrat.** Strukturell vollständige Entwürfe nach geltenden Vorschriften,
aber vor dem Live-Gang gehören sie einmal über den Tisch einer zugelassenen Person —
besonders die Haftungs- und Nutzungsrechtsklauseln der AGB, die vom tatsächlichen
Geschäftsmodell abhängen.

## Architektur

### Neue Dateien

| Datei | Rolle |
|---|---|
| `src/lib/legal.ts` | Alle nachfüllbaren Daten an einer Stelle. `null` = Platzhalter. |
| `src/hooks/useLightChrome.ts` | Feste Leiste für die Dauer der Seite auf hell schalten. |
| `src/components/legal/LegalPage.tsx` | Geteilte Hülle: Leiste, Spine, Kopf, Kapitel, Verzeichnis, Fusszeile. |
| `src/components/legal/LegalSection.tsx` | Nummeriertes Kapitel (`01`, `02`, …) plus der Typ `LegalSectionData`. |
| `src/components/legal/Fill.tsx` | Wert oder markierter Platzhalter. |
| `src/app/impressum/page.tsx` | Route + `metadata`. |
| `src/app/datenschutz/page.tsx` | Route + `metadata`. |
| `src/app/agb/page.tsx` | Route + `metadata`. |
| `src/app/not-found.tsx` | 404 in derselben Formensprache. |

### Geänderte Dateien

| Datei | Änderung |
|---|---|
| `src/components/ui/Navigation.tsx` | `usePathname()`: auf `/` bleiben die hrefs byte-identisch, auf Unterseiten werden `/#services` und `/` daraus. |
| `src/app/sitemap.ts` | Die drei Rechtsrouten nachtragen. |

### Warum eine Client-Hülle

`LegalPage` ist `"use client"`, weil sie zwei Client-Dinge braucht: `useLightChrome`
und `TextReveal` (GSAP). Die Routen-Dateien bleiben Server-Components und exportieren
`metadata` — die Trennung hält die SEO-Angaben serverseitig.

### Warum `useLightChrome` und nicht `useLightSection`

`useLightSection` hängt an einem ScrollTrigger und schaltet um, wenn eine Section die
Oberkante besitzt. Eine durchgehend cremefarbene Seite hat keinen solchen Übergang —
hier ist Hell ein Zustand, kein Ereignis. Der Hook setzt `data-ui-theme="light"` beim
Mount und stellt beim Unmount auf `dark` zurück, damit die Startseite ihren eigenen
Wechsel unverändert fährt.

## Layout

```
container-custom                                (die bestehende Spine)
  └── ab lg zwei Spalten: [68ch] [1fr]
       ├── Textspalte max-w-[68ch]              (Lesebreite, nicht 1440px)
       │    ├── RECHTLICHES                     mono, uppercase, tracking-[0.2em], #6a6a6a
       │    ├── IMPRESSUM                       font-display, bold, leading-[0.95], tracking-tighter
       │    ├── Lede                            #3a3a3a
       │    ├── Stand: 11.08.2026               mono caption, #9a9a9a
       │    ├── ─────────────                    Haarlinie #0a0a0a/10
       │    ├── 01 · Anbieter                   Nummer mono über dem Titel
       │    ├── 02 · Kontakt
       │    ├── …
       │    └── ← Zur Startseite · AGB · Datenschutz · Impressum
       └── INHALT (klebend, erst ab lg)         01 Geltungsbereich, 02 …
```

**Warum das Verzeichnis.** Im ersten Durchgang stand die Textspalte allein: auf
1440px blieb rechts die halbe Fläche leer, während die AGB 7440px hoch sind. Das
Verzeichnis füllt sie mit Funktion statt mit Dekor und gibt einem 15 Kapitel
langen Dokument einen Einstieg, der nicht Scrollen heisst. Unter 1024px entfällt
es — dort gäbe es keine Spalte dafür, und eine ausklappbare Liste über dem
Dokument wäre ein zweiter Scrollweg statt einer Abkürzung.

Damit Text und Verzeichnis nicht auseinanderlaufen können, kommen die Kapitel als
Datenliste (`LegalSectionData[]`) in die Hülle und nicht als Kinder. Die
Nummerierung ergibt sich aus der Reihenfolge — ein eingeschobener Abschnitt
nummeriert alle folgenden von selbst um, und Querverweise im Text zeigen auf
Anker statt auf Nummern.

Farben und Typo sind die der bestehenden Cremeflächen (`SelectedWork`, `GiganticCTA`):
Grund `#f2ede4`, Tinte `#0a0a0a`, Fliesstext `#3a3a3a`, Nebentext `#6a6a6a`/`#9a9a9a`.

Die Nummerierung `01 / 02 / 03` ist bewusst dieselbe Marke, die Leistungen und Projekte
tragen. Sie steht über dem Kapiteltitel statt daneben, damit sie die 68ch-Lesebreite
nicht anknabbert.

Oberer Abstand `clamp(7rem, 18svh, 11rem)`: die feste Leiste misst mobil 64px und ab
lg 112px — der Wert deckt beide mit Luft.

## Platzhalter

`src/lib/legal.ts` hält jeden nachfüllbaren Wert; `null` heisst „fehlt noch".
`<Fill>` rendert entweder den Wert oder einen markierten Platzhalter:
Akzentfarbe `#A07850`, gestrichelte Unterlinie, Mono. Beim Nachfüllen in `legal.ts`
verschwindet die Markierung von selbst — die Texte müssen nicht angefasst werden.

## Inhalte

### Impressum
§ 5 DDG, Kontakt, Umsatzsteuer/Kleinunternehmer, § 18 Abs. 2 MStV, Berufliches,
Verbraucherschlichtung, Haftung für Inhalte, Haftung für Links, Urheberrecht.

**Ohne OS-Plattform-Link.** Die EU-Streitbeilegungsplattform ist seit dem 20.07.2025
eingestellt; ein Link darauf wäre heute falsch. Stattdessen die Erklärung nach § 36 VSBG.

### Datenschutzerklärung (DSGVO Art. 13)
Verantwortlicher, Hosting, Server-Logfiles (Art. 6 I f), Kontakt per E-Mail (Art. 6 I b/f),
Schriftarten, Cookies & Reichweitenmessung, externe Links, Speicherdauer,
Betroffenenrechte (Art. 15–21), Beschwerderecht, Widerspruchsrecht (Art. 21), TLS,
Änderungen.

Zwei Punkte lassen sich wahrheitsgemäss knapp halten, weil der Code es hergibt:
`next/font` lädt die Schriften zur Buildzeit und liefert sie vom eigenen Server (keine
Google-Verbindung beim Aufruf, siehe `app/layout.tsx:16-34`), und es gibt kein Tracking —
im gesamten Projekt existiert kein Analytics-Snippet.

### AGB
Geltungsbereich, Vertragsschluss, Leistungsgegenstand, Mitwirkungspflichten, Vergütung,
Termine, Abnahme, Nutzungsrechte, Drittleistungen, Gewährleistung, Haftung,
Vertraulichkeit & Referenzen, Laufzeit & Kündigung, **Widerrufsrecht für Verbraucher**,
Schlussbestimmungen.

Das Widerrufsrecht ist Pflicht und keine Kür: die Kundenliste führt „Für Privatpersonen"
(`CLIENTS` in `lib/constants.ts`), es gibt also Verbraucherverträge.

## Abnahme

- Die drei Links in der Kontakt-Fusszeile führen auf gestaltete Seiten statt auf 404.
- Von jeder Rechtsseite führt ein Weg zurück und zu den beiden anderen.
- Das Menü funktioniert auf den Unterseiten (Sprung auf die Startseite plus Anker).
- Die Startseite verhält sich unverändert — insbesondere die Menü-hrefs auf `/`.
- `tsc --noEmit` und `eslint` laufen sauber.
- Kein `next build`, solange der Dev-Server läuft (er überschreibt dessen `.next`).
