import type { Dictionary } from "../types.ts";

/**
 * Deutsche Texte der Seite, zeichengleich zum Stand vor der Zweisprachigkeit
 * — Eigenheiten eingeschlossen („Lust auf ein Projekt ?", „schreib mir - dann
 * starten wir.", „Strasse und Hausnummer"). Ein `\n` in Display-Titeln ist
 * der gesetzte Zeilenumbruch.
 *
 * Nur auf dem Server importieren (über `getDictionary`): eine
 * Client-Komponente, die das hier zieht, packt den Text ins Bundle.
 */
export const de = {
  meta: {
    title: "Luca Arnoldi — Fullstack Developer & Digital Experience Engineer",
    description:
      "Ich baue digitale Erlebnisse, die nicht nur funktionieren — sie faszinieren. Fullstack Developer spezialisiert auf React, Next.js, KI-Integration & Premium Web Experiences.",
    ogDescription: "Herzlich Willkommen auf meiner Homepage.",
    knowsAbout: [
      "Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "Individuelle Software",
      "Prozess Automationen",
      "KI Integrationen",
      "Website Design",
    ],
  },

  common: {
    skipToContent: "Zum Inhalt springen",
    logoAlt: "LAAS – Luca As A Service",
  },

  nav: {
    items: {
      "#services": "Leistungen",
      "#process": "Prozess",
      "#work": "Projekte",
      "#about": "Über mich",
      "#contact": "Kontakt",
    },
    menuToggle: "Navigationsmenü umschalten",
    languageNav: "Sprache",
    languageNames: { de: "Deutsch", en: "English" },
  },

  hero: {
    greeting: "Hey, ich bin Luca",
    focusLabel: "Mein Fokus",
    rotatingWords: [
      "Web-Apps",
      "mobile Apps",
      "KI Integration",
      "Prozessautomationen",
      "Website Design",
    ],
    scrollHint: "Scrollen",
  },

  services: {
    eyebrow: "Was ich anbiete",
    headline: "LEISTUNGEN",
    /** Große Aussage — steht im aria-Label der Landschaft. */
    statement: "Wenn Standardtools nicht reichen, baue ich dir den Weg.",
    sectionLabel: "Leistungen",
    landscapeLabel:
      "{statement} Ziehen wechselt zwischen zugestelltem und geräumtem Arbeitsplatz.",
    landscapeValue: "{value} Prozent Chaos",
    items: {
      software: {
        title: "Individuelle Software",
        description:
          "Maßgeschneiderte Web-Apps und Interfaces, die zu deinem Alltag passen. Statt Standardsoftware, die du verbiegen musst.",
      },
      automation: {
        title: "Prozess Automationen",
        description:
          "Wiederkehrende Abläufe digitalisieren, verbinden und entlasten. Weniger Copy-Paste, mehr ruhiger Betrieb.",
      },
      ai: {
        title: "KI Integrationen",
        description:
          "KI dort einbauen, wo sie echten Hebel hat: in bestehende Produkte und Workflows, nicht als Spielerei.",
      },
      website: {
        title: "Website Design",
        description:
          "Markante Websites mit klarer Botschaft und ruhiger Bedienung. Design und Umsetzung aus einem Guss, kein Template-Feeling.",
      },
    },
  },

  process: {
    eyebrow: "So arbeiten wir zusammen",
    headline: "WIE FUNKTIONIERTS?",
    mediaLabel: "{subtitle}: kurze Comic-Animation",
    cycleLabels: { idea: "Idee", plan: "Plan", build: "Build", cycle: "Loop" },
    steps: {
      idea: {
        title: "DEINE IDEE ODER DEIN PROBLEM",
        subtitle: "Der Ausgangspunkt",
        description:
          "Du kommst mit einer Idee, einem Engpass oder einem Prozess, der dich bremst. Genau dort starten wir.",
        points: [
          {
            title: "Was dich bremst",
            description:
              "Manuelle Arbeit, fehlende Tools oder eine Idee ohne Form. Oft steckt dahinter kein Großprojekt, sondern ein wiederkehrender Reibungspunkt.",
          },
          {
            title: "Was du brauchst",
            description:
              "Klarheit, ob Software, Automatisierung oder beides hilft. Wir trennen Symptom von Ursache, bevor etwas gebaut wird.",
          },
          {
            title: "Was du mitbringst",
            description:
              "Kontext aus deinem Alltag. Mehr brauchst du erstmal nicht. Ein Walkthrough oder eine Liste nerviger Schritte reicht.",
          },
        ],
      },
      plan: {
        title: "BESPRECHEN &\nPLANEN",
        subtitle: "Gemeinsam den Weg festlegen",
        description:
          "Wir klären Ziel, Umfang und Prioritäten. Du weißt danach, was gebaut wird, warum, und in welcher Reihenfolge.",
        points: [
          {
            title: "Umfang klären",
            description:
              "Was muss rein, was kann warten, was ist Nice-to-have. So bleibt der erste Wurf fokussiert und finanzierbar.",
          },
          {
            title: "Ansatz wählen",
            description:
              "App, Workflow, Integration oder eine Kombination. Technik folgt dem Alltag, nicht umgekehrt.",
          },
          {
            title: "Plan aufsetzen",
            description:
              "Konkrete Schritte, Timeline und klare nächste Actions. Du siehst, was wann passiert und was von dir gebraucht wird.",
          },
        ],
      },
      build: {
        title: "AUTOMATISIERUNG & SOFTWARE",
        subtitle: "Bauen, vernetzen, live nehmen",
        description:
          "Ich baue die maßgeschneiderte Lösung: Automatisierungen, Apps und Interfaces, die sich in deinen Alltag einfügen.",
        points: [
          {
            title: "Automatisieren",
            description:
              "Wiederkehrende Aufgaben laufen ohne Copy-Paste. Systeme sprechen miteinander, statt dass du Daten hin- und herschiebst.",
          },
          {
            title: "Software bauen",
            description:
              "Native- und Web-Apps mit klarer UI und stabilem Stack. Gebaut für deinen Prozess, nicht für Feature-Listen.",
          },
          {
            title: "Live bringen",
            description:
              "Deploy, Feinschliff und Übergabe, die du wirklich nutzen kannst. Arbeitsfähig, kein reiner Prototyp.",
          },
        ],
      },
      cycle: {
        title: "VON VORNE\nANFANGEN",
        subtitle: "Der Loop geht weiter",
        description:
          "Neue Idee, neues Problem, nächster Hebel. Was läuft, wird verbessert. Was fehlt, wird als Nächstes gebaut.",
        points: [
          {
            title: "Feedback nutzen",
            description:
              "Was im Alltag hakt, wird der nächste Baustein. Echtes Nutzungsverhalten schlägt Annahmen aus dem Kickoff.",
          },
          {
            title: "Weiter verbessern",
            description:
              "Kleine Verbesserungen statt einmal und fertig. Jede Runde macht das Setup ruhiger und robuster.",
          },
          {
            title: "Wachsendes System",
            description:
              "Mit jedem Durchlauf wird dein Setup schlauer und ruhiger. Der Loop ist Absicht, kein Zeichen für Scheitern.",
          },
        ],
      },
    },
  },

  work: {
    eyebrow: "Eine Auswahl meiner Arbeit",
    headline: "PROJEKTE",
    gallery: {
      previous: "Vorheriges Bild",
      next: "Nächstes Bild",
      list: "Aufnahmen dieses Projekts",
      item: "Aufnahme {current} von {total}",
    },
    projects: {
      "wintersport-verleih": {
        title: "WINTERSPORT\nVERLEIH SYSTEM",
        subtitle: "Verleihsystem für Intersport Gemo",
        features: [
          {
            title: "Digitale Kundenanmeldung",
            description:
              "Tagesverleih-Formular mit Kontaktdaten und Ausweis-Upload. Gäste melden sich selbst an, bevor sie in den Shop kommen.",
          },
          {
            title: "Neue Anmeldungen im Shop",
            description:
              "Inbox für unbearbeitete Anmeldungen: Team sieht Kontaktdaten, Verleihart und startet direkt die Ausrüstungserfassung.",
          },
          {
            title: "Kasse & Zahlungsstatus",
            description:
              "Unbezahlte und abgeschlossene Leihen im Blick, klar getrennt, damit nichts an der Kasse untergeht.",
          },
          {
            title: "Administration & Stammdaten",
            description:
              "Produkte, Kategorien, User-Rollen und Umsatz-Statistiken zentral steuern, ohne Extra-Tools daneben.",
          },
        ],
        galleryTitles: [
          "Verleihtyp wählen",
          "Kundendaten erfassen",
          "Neue Anmeldungen",
          "Ausrüstung & Mietdauer",
          "Verleih-Management",
          "Statistiken & Umsatz",
        ],
      },
      "powershop-service": {
        title: "POWER SHOP\nSERVICE APP",
        subtitle: "Operations & Management Web-App",
        features: [
          {
            title: "Tagesgeschäft-Management",
            description:
              "Zentrale Oberfläche zur Steuerung des täglichen Geschäftsbetriebs mit Echtzeit-Übersichten und Aufgabenverwaltung.",
          },
          {
            title: "Mitarbeiter- & Eventplanung",
            description:
              "Integrierte Planung für Schichten, Verfügbarkeiten und Events mit automatischer Konflikterkennung.",
          },
          {
            title: "Workflow-Automatisierungen",
            description:
              "Automatisierte Geschäftsprozesse, die repetitive Aufgaben eliminieren und den operativen Alltag beschleunigen.",
          },
          {
            title: "KI-Prozesse & Funktionen",
            description:
              "Intelligente Funktionen auf Basis von KI, von automatisierten Auswertungen bis zur smarten Entscheidungsunterstützung.",
          },
        ],
        galleryTitles: [
          "Mitarbeiter-Anmeldung",
          "Dashboard",
          "Service Center",
          "Probefahrt erfassen",
          "Urlaubs- & Abwesenheitsplanung",
          "Workflow-Automatisierungen",
        ],
      },
      "powershop-madness": {
        title: "POWER SHOP\nMADNESS",
        subtitle: "Arcade Mobile Game",
        features: [
          {
            title: "Arcade-Gameplay",
            description:
              "Kurze, intensive Sessions mit steigendem Tempo und klaren Highscore-Momenten.",
          },
          {
            title: "Markenwelt im Spiel",
            description:
              "Visuelle und thematische Anbindung an den Power Shop. Erkennbar, ohne den Flow zu stören.",
          },
          {
            title: "Mobile-First UX",
            description:
              "Touch-optimierte Steuerung und Interfaces, die auf dem Smartphone sofort verständlich sind.",
          },
          {
            title: "Verfügbarkeit",
            description:
              "Für alle Geräte konzipiert, mit einheitlicher Spielerfahrung auf Smartphone und Tablet.",
          },
        ],
        galleryTitles: [
          "Game Screen 01",
          "Game Screen 02",
          "Game Screen 03",
          "Game Screen 04",
          "Game Screen 05",
        ],
      },
      "motools-service": {
        title: "moTools\nSERVICE APP",
        subtitle: "Interne Tool-Plattform für Logistik & Telematik",
        // Beschreibungen auf zwei Zeilen getrimmt (84–90 Zeichen), damit die
        // Feature-Liste dieselbe Höhe hat wie bei den übrigen Projekten.
        features: [
          {
            title: "Telematik-Werkzeuge",
            description:
              "Vorgänge rund um Fahrzeuge und GPS-Boxen per VIN finden, bearbeiten und abschließen.",
          },
          {
            title: "Benutzer- & Rollenverwaltung",
            description:
              "Portaluser nach Rolle oder Kunde verwalten, vom Super-Administrator bis zum Fahrer.",
          },
          {
            title: "Fahrer- & Stammdatenpflege",
            description:
              "Geführte Formulare legen Fahrer samt Kundenzuordnung und Zugangsdaten in einem Schritt an.",
          },
          {
            title: "Team-Board & Ideenabstimmung",
            description:
              "Notizen, Schnellzugriffe und Merch-Vorschläge, über die das Team direkt abstimmen kann.",
          },
        ],
        galleryTitles: [
          "Anmeldung",
          "Startseite mit Schnellzugriffen",
          "Fehler-Tracking der GPS-Boxen",
          "Benutzerverwaltung nach Rolle",
          "Fahrer anlegen",
          "Ideen-Management",
        ],
      },
      "wedding-app": {
        title: "WEDDING\nORGANIZER APP",
        subtitle: "RSVP, Guides & Infos für Hochzeitsgäste",
        features: [
          {
            title: "RSVP & Gäste-Rückmeldung",
            description:
              "Teilnahme, Tage und Kontaktdaten digital erfassen. Klar, persönlich und ohne Papierchaos.",
          },
          {
            title: "Outfit-Guide pro Event",
            description:
              "Stilvorschläge für jeden Anlass im Hochzeitsprogramm, inkl. Shopping-Tipps und Dresscode-Hinweisen.",
          },
          {
            title: "Anreise & Local Tips",
            description:
              "Empfehlungen zu Restaurants, Cafés und Shopping vor Ort, direkt mit Maps-Links.",
          },
          {
            title: "FAQ & Infos auf einen Blick",
            description:
              "Dresscode, Ankunft, Transport und weitere Fragen als übersichtliches Akkordeon.",
          },
        ],
        galleryTitles: [
          "Countdown",
          "RSVP Screen",
          "Local Tips",
          "Outfits Guide",
          "Location",
        ],
      },
      "individuelle-website": {
        title: "INDIVIDUELLE\nWEBSITE",
        subtitle: "Maßgeschneiderte Website statt Template",
        features: [
          {
            title: "Eigenes Design, kein Template",
            description:
              "Visuelle Sprache und Layout wachsen aus Marke und Inhalt. Erkennbar, ohne Baukasten-Feeling.",
          },
          {
            title: "Klare Botschaft zuerst",
            description:
              "Eine starke Einstiegsseite, die sofort sagt, wer du bist und warum jemand bleiben soll.",
          },
          {
            title: "Ruhige Bedienung",
            description:
              "Wenige, gezielte Abschnitte und CTAs. Lesbar am Desktop, selbstverständlich auf dem Handy.",
          },
          {
            title: "Design und Code aus einem Guss",
            description:
              "Vom Look bis zur Live-Seite alles aus einer Hand, ohne Bruch zwischen Entwurf und Umsetzung.",
          },
        ],
        galleryTitles: ["Website-Durchlauf"],
      },
    },
  },

  clients: {
    sectionLabel: "Ausgewählte Kunden",
    names: {
      powershop: "Harley Davidson Powershop",
      intersport: "Intersport Gemo",
      mobileobjects: "Mobile Objects",
      private: "Für Privatpersonen",
      ashprojects: "Ash Projects",
      lacilentana: "La Cilentana Pastamanufaktur",
    },
  },

  about: {
    eyebrow: "Wer dich unterstützt",
    headline: "ÜBER MICH",
    greeting: "Hey, ich bin",
    /** Zwei Zeilen — Umbruch nach „Technik,". */
    subtitle: [
      "Ich interessiere mich für Technik,",
      "KI und das ganze verrückte Zeug.",
    ],
    rolesHeading: "Was ich gerade beruflich mache",
    toolsHeading: "Tools die ich mag",
    portraitAlt: "Luca Arnoldi",
    roles: {
      feldschloesschen: "Teamleiter Logistic System & Process Development",
      mobileobjects: "Full Stack Developer (Teilzeit)",
      laas: "Selbstständig",
    },
  },

  cta: {
    headline: "Lust auf ein Projekt ?",
    subline: "schreib mir - dann starten wir.",
    button: "Projekt starten",
    socialLabel: "{platform}-Profil besuchen",
  },

  legalLinks: {
    agb: "AGB",
    datenschutz: "Datenschutz",
    impressum: "Impressum",
  },

  legalChrome: {
    eyebrow: "Rechtliches",
    updatedLabel: "Stand:",
    backHome: "Zur Startseite",
    moreLegal: "Weitere rechtliche Hinweise",
    tocLabel: "Inhalt dieses Dokuments",
    tocHeading: "Inhalt",
    fillLabel: "Noch auszufüllen: {label}",
    streetLabel: "Strasse und Hausnummer",
    translationNotice: null,
  },

  notFound: {
    metaTitle: "Seite nicht gefunden — Luca Arnoldi App Solutions",
    eyebrow: "Fehler 404",
    title: "NICHTS ZU SEHEN",
    lede: "Diese Seite gibt es nicht — jedenfalls nicht mehr, oder noch nicht. Vielleicht hat sich ein Tippfehler in die Adresse geschlichen, vielleicht ist der Link älter als die Seite dahinter.",
    whereTo: "Wohin stattdessen",
    sectionsLabel: "Bereiche der Startseite",
  },
} satisfies Dictionary;
