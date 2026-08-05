import type {
  DeviceFrame,
  ScreenFit,
} from "@/components/ui/framer-moveable-thumbnails";

export const SITE_CONFIG = {
  name: "Luca Arnoldi App Studio",
  title: "Fullstack Developer & Digital Experience Engineer",
  tagline: "Code, die sich lebendig anfühlt",
  /** Live-Domain — Basis für metadataBase, OG-Tags, Sitemap und JSON-LD. */
  url: "https://laas.website",
  email: "hello@lucaarnoldi.com",
  socials: {
    github: "https://github.com/Lux593",
    linkedin: "https://www.linkedin.com/in/luca-arnoldi-2893521ba/",
    instagram: "https://www.instagram.com/luca_85ar/",
  },
} as const;

/** Anrede und Name stehen getrennt, weil sie in der Iris zwei Typo-Grade sind:
 *  die Anrede klein über dem Namen im Displaygrad. */
export const ABOUT_INTRO = {
  greeting: "Hey, ich bin",
  name: "Luca Arnoldi",
  /** Zwei Zeilen — Umbruch nach „Technik,". */
  subtitle: [
    "Ich interessiere mich für Technik,",
    "KI und das ganze verrückte Zeug.",
  ],
  location: "79576 Weil am Rhein",
} as const;

export interface AboutRole {
  company: string;
  position: string;
  /**
   * Optionales Porträt für genau diese Rolle. Steht hier ein Pfad, wechselt die
   * Platte in „Über mich", sobald die Annotation gehovert oder fokussiert wird
   * — ein Gesicht, drei Leben. Fehlt der Pfad, bleibt ABOUT_PORTRAIT stehen;
   * die Section funktioniert vollständig mit einem einzigen Foto.
   */
  image?: string;
  /** Nur nötig, wenn `image` gesetzt ist: was auf dem Foto zu sehen ist. */
  imageAlt?: string;
}

/** B&W-Porträt links im About-Streifen. Freigestellt ist es nicht — der weiße
 *  Studiogrund verschmilzt per `mix-blend-mode: multiply` mit der Cremeplatte,
 *  genau wie die Bauzeichnung in „Leistungen" im Cremegrund verschwindet. */
export const ABOUT_PORTRAIT = {
  src: "/personal_pic.jpg",
  width: 1206,
  height: 953,
  alt: "Luca Arnoldi",
} as const;

/** Beruflicher Werdegang — mittlere Spalte im About-Streifen. */
export const ABOUT_ROLES: AboutRole[] = [
  {
    company: "Feldschlösschen Getränke AG",
    position: "Teamleiter Logistic System & Process Development",
  },
  {
    company: "mobileObjects GmbH",
    position: "Full Stack Developer (Teilzeit)",
  },
  {
    company: "LAAS – Luca Arnoldi App Solutions",
    position: "Selbstständig",
  },
];

/** Section-Header + linke Spalte der Leistungen-Aufteilung. */
export const SERVICES_INTRO = {
  eyebrow: "Was ich anbiete",
  headline: "LEISTUNGEN",
  /** Große Aussage — bleibt als aria-Label / Fallback-Text für die Landschaft. */
  statement: "Wenn Standardtools nicht reichen, baue ich dir den Weg.",
  support:
    "Software, die passt. Websites, die sitzen. Prozesse, die laufen. KI, die wirklich hilft: klar, direkt, ohne Theater.",
  /**
   * Zwei Handskizzen desselben Arbeitsplatzes, zugestellt und geräumt. Die
   * geräumte ist aus der zugestellten heraus gezeichnet, damit Tischplatte
   * und Bodenlinie aufeinander liegen — die Ziehkante darf keinen Sprung im
   * Tisch zeigen. Papier ist reines Weiß: so lässt das multiply der Section
   * ihr Creme unberührt und die Zeichnung liegt ohne Blatt darauf.
   */
  visualBefore: "/services/arbeitsplatz-chaos-v2.webp",
  visualAfter: "/services/arbeitsplatz-aufgeraeumt-v2.webp",
} as const;

export interface AboutTool {
  name: string;
  icon: string;
  url: string;
}

/** Tools-Raster unter den Hobbys in „Über mich". */
export const ABOUT_TOOLS: AboutTool[] = [
  { name: "Cursor", icon: "/cursor-icon-white.svg", url: "https://www.cursor.com" },
  { name: "n8n", icon: "/n8n-icon.svg", url: "https://n8n.io" },
  { name: "Supabase", icon: "/supabase-icon.svg", url: "https://supabase.com" },
  { name: "GitHub", icon: "/github-icon.svg", url: "https://github.com" },
  { name: "Spotify", icon: "/spotify-icon.svg", url: "https://www.spotify.com" },
  { name: "YouTube", icon: "/youtube-icon.svg", url: "https://www.youtube.com" },
];

export interface ClientTickerItem {
  name: string;
  /** Vorhandenes Kunden-Logo; fehlt → Platzhalter vor dem Namen. */
  icon?: string;
  /**
   * Extra Klassen fürs Logo im Icon-Slot
   * (Crop/Zoom gegen schwarzen Bildrand / feine Striche).
   */
  iconClass?: string;
  /** Override für den Slot (z. B. Querformat bei Wordmarks). */
  slotClass?: string;
}

/** Kunden-Ticker zwischen Projekte und Über mich. */
export const CLIENTS: ClientTickerItem[] = [
  {
    name: "Harley Davidson Powershop",
    icon: "/power-shop-icon.svg",
  },
  {
    name: "Intersport Gemo",
    icon: "/intersport-icon.svg",
    // Flaches Wordmark: breiter, etwas niedrigerer Slot.
    slotClass: "h-8 w-[10.5rem] md:h-10 md:w-[13rem]",
    iconClass: "object-contain",
  },
  {
    name: "Mobile Objects",
    icon: "/mobileobjects-icon.svg",
    // Nur Markenzeichen (m + Ring); Wordmark flackerte im Marquee.
    slotClass: "h-11 w-[5rem] md:h-[3.25rem] md:w-[5.75rem]",
    iconClass: "object-contain",
  },
  {
    name: "Für Privatpersonen",
    icon: "/privatpersonen-icon.svg",
    iconClass: "object-contain",
  },
  {
    name: "Ash Projects",
    icon: "/ashprojects-icon.svg",
    iconClass: "object-contain",
  },
  {
    name: "La Cilentana Pastamanufaktur",
    icon: "/lacilentana-icon.svg",
    // Querformat-Logo: etwas breiterer Slot, volle Marke sichtbar.
    slotClass: "w-[4.75rem] md:w-[5.25rem]",
    iconClass: "object-contain",
  },
];

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectGalleryItem {
  id: number;
  url: string;
  title: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  tech: string[];
  description: string;
  details: string;
  features: ProjectFeature[];
  gallery: ProjectGalleryItem[];
  color: string;
  /** Device mockup the gallery screenshots are shown in. Defaults to "ipad". */
  device?: DeviceFrame;
  /**
   * How screenshots fill the device cutout. Defaults to the frame fit
   * (iPad contain / iPhone cover). `cover-top` fills width and crops the bottom.
   */
  fit?: ScreenFit;
  /** Backdrop color behind letterboxed screenshots in the device cutout. */
  screenColor?: string;
  /** Inset screenshots inside the cutout (0–0.4) so they read smaller. */
  screenInset?: number;
  /** Bypass Next image optimizer for this project's gallery. */
  unoptimized?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "powershop-service",
    title: "POWER SHOP\nSERVICE APP",
    subtitle: "Operations & Management Web-App",
    category: "Fullstack / Web-App",
    year: "2024 – heute",
    tech: ["React", "Next.js", "Python", "OpenAI", "PostgreSQL"],
    description:
      "Maßgeschneiderte Web-App für Tagesgeschäft, Planung und Automatisierung – mit KI-gestützten Prozessen.",
    details:
      "Für den Power Shop habe ich eine umfassende Management-Plattform entwickelt, die sämtliche operative Abläufe digitalisiert und optimiert.",
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
          "Implementierung intelligenter Funktionen auf Basis von KI – von automatisierten Auswertungen bis zur smarten Entscheidungsunterstützung.",
      },
    ],
    gallery: [
      { id: 1, url: "/vorschaubilder/powershop1.webp", title: "Dashboard Overview" },
      { id: 2, url: "/vorschaubilder/powershop2.webp", title: "Scheduling View" },
      { id: 3, url: "/vorschaubilder/powershop3.webp", title: "Operations Detail" },
      { id: 4, url: "/vorschaubilder/powershop4.webp", title: "Workflow Screen" },
      { id: 5, url: "/vorschaubilder/powershop5.webp", title: "Analytics View" },
    ],
    color: "#C49F7B",
  },
  {
    id: "powershop-madness",
    title: "POWER SHOP MADNESS",
    subtitle: "Arcade Mobile Game",
    category: "Mobile / Game",
    year: "2025",
    tech: ["Unity", "C#", "Mobile"],
    description:
      "Ein mobiles Arcade-Game rund um den Power Shop – schnelle Sessions, markante Optik und spielerische Markenwelt.",
    details:
      "Power Shop Madness übersetzt die Markenwelt in ein kurzweiliges Mobile Game mit klaren Levels und starker Visual Language.",
    features: [
      {
        title: "Arcade-Gameplay",
        description:
          "Kurze, intensive Sessions mit steigendem Tempo und klaren Highscore-Momenten.",
      },
      {
        title: "Markenwelt im Spiel",
        description:
          "Visuelle und thematische Anbindung an den Power Shop – erkennbar, ohne den Flow zu stören.",
      },
      {
        title: "Mobile-First UX",
        description:
          "Touch-optimierte Steuerung und Interfaces, die auf dem Smartphone sofort verständlich sind.",
      },
      {
        title: "Verfügbarkeit",
        description:
          "Für alle Geräte konzipiert – einheitliche Spielerfahrung auf Smartphone und Tablet.",
      },
    ],
    gallery: [
      { id: 1, url: "/vorschaubilder/game1.webp", title: "Game Screen 01" },
      { id: 2, url: "/vorschaubilder/game2.webp", title: "Game Screen 02" },
      { id: 3, url: "/vorschaubilder/game3.webp", title: "Game Screen 03" },
      { id: 4, url: "/vorschaubilder/game4.webp", title: "Game Screen 04" },
      { id: 5, url: "/vorschaubilder/game5.webp", title: "Game Screen 05" },
    ],
    color: "#DFBE9F",
    device: "iphone",
  },
  {
    id: "wintersport-verleih",
    title: "WINTERSPORT\nVERLEIH SYSTEM",
    subtitle: "Verleihsystem für Intersport Gemo",
    category: "Fullstack / Web-App",
    year: "2025 – heute",
    tech: ["React", "Next.js", "TypeScript", "Supabase"],
    description:
      "End-to-End-Verleihsystem für Skiausrüstung: von der Online-Anmeldung über Ausrüstungserfassung und Kasse bis zur Administration.",
    details:
      "Für Intersport Gemo habe ich ein digitales Wintersport-Verleihsystem gebaut, das Kundenanmeldung, Shop-Workflow und Backoffice in einer Oberfläche verbindet — für Tages- und Saisonverleih.",
    features: [
      {
        title: "Digitale Kundenanmeldung",
        description:
          "Tagesverleih-Formular mit Kontaktdaten und Ausweis-Upload — Gäste melden sich selbst an, bevor sie in den Shop kommen.",
      },
      {
        title: "Neue Anmeldungen im Shop",
        description:
          "Inbox für unbearbeitete Anmeldungen: Team sieht Kontaktdaten, Verleihart und startet direkt die Ausrüstungserfassung.",
      },
      {
        title: "Kasse & Zahlungsstatus",
        description:
          "Unbezahlte und abgeschlossene Leihen im Blick — klar getrennt, damit nichts an der Kasse untergeht.",
      },
      {
        title: "Administration & Stammdaten",
        description:
          "Produkte, Kategorien, User-Rollen und Umsatz-Statistiken zentral steuern — ohne Extra-Tools daneben.",
      },
    ],
    gallery: [
      { id: 1, url: "/vorschaubilder/gemo-full-1.webp", title: "Tagesverleih Anmeldung" },
      { id: 2, url: "/vorschaubilder/gemo-full-2.webp", title: "Neue Anmeldungen" },
      { id: 3, url: "/vorschaubilder/gemo-full-3.webp", title: "Kasse" },
      { id: 4, url: "/vorschaubilder/gemo-full-4.webp", title: "Administration" },
    ],
    color: "#7A8FA0",
    // Full captures (logo at top). Cover from the top so only the empty
    // bottom of the screenshot is clipped — never the header.
    fit: "cover-top",
    screenColor: "#F2F6FC",
    unoptimized: true,
  },
  {
    id: "wedding-app",
    title: "WEDDING APP",
    subtitle: "Gäste-App für eine Destination Wedding",
    category: "Mobile / Web-App",
    year: "2025 – 2026",
    tech: ["React", "Next.js", "Supabase", "TypeScript"],
    description:
      "Eine elegante Gäste-App für eine Destination Wedding in Udaipur – von der Rückmeldung über Outfit-Guides bis zu lokalen Tipps, alles an einem Ort.",
    details:
      "Die Wedding App bündelt alle Informationen für die Gäste einer mehrtägigen Hochzeit: RSVP, Ablauf, Outfits, Anreise und FAQ – mehrsprachig und mobil optimiert.",
    features: [
      {
        title: "RSVP & Gäste-Rückmeldung",
        description:
          "Teilnahme, Tage und Kontaktdaten digital erfassen – klar, persönlich und ohne Papierchaos.",
      },
      {
        title: "Outfit-Guide pro Event",
        description:
          "Stilvorschläge für jeden Anlass – von der Ceremony bis zum Sangeet, inkl. Shopping-Tipps.",
      },
      {
        title: "Anreise & Local Tips",
        description:
          "Empfehlungen zu Restaurants, Cafés und Shopping in Udaipur – direkt mit Maps-Links.",
      },
      {
        title: "FAQ & Infos auf einen Blick",
        description:
          "Dresscode, Ankunft, Transport und weitere Fragen – als übersichtliches Akkordeon.",
      },
    ],
    gallery: [
      { id: 1, url: "/vorschaubilder/wedding1.webp", title: "RSVP Screen" },
      { id: 2, url: "/vorschaubilder/wedding2.webp", title: "Navigation Menu" },
      { id: 3, url: "/vorschaubilder/wedding3.webp", title: "Outfits Guide" },
      { id: 4, url: "/vorschaubilder/wedding4.webp", title: "Local Tips" },
      { id: 5, url: "/vorschaubilder/wedding5.webp", title: "FAQ Screen" },
    ],
    color: "#B8897A",
    device: "iphone",
  },
];

export interface ProcessStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  points: { title: string; description: string }[];
  /** Looping comic clip (muted). Optional until all steps have assets. */
  video?: string;
  /** Poster / reduced-motion fallback for the clip. */
  poster?: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "idea",
    title: "DEINE IDEE ODER DEIN PROBLEM",
    subtitle: "Der Ausgangspunkt",
    description:
      "Du kommst mit einer Idee, einem Engpass oder einem Prozess, der dich bremst. Genau dort starten wir.",
    video: "/process/step-01-idea.mp4",
    poster: "/process/step-01-idea-poster.webp",
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
          "Kontext aus deinem Alltag. Mehr brauchst du erstmal nicht — ein Walkthrough oder eine Liste nerviger Schritte reicht.",
      },
    ],
  },
  {
    id: "plan",
    title: "BESPRECHEN &\nPLANEN",
    subtitle: "Gemeinsam den Weg festlegen",
    description:
      "Wir klären Ziel, Umfang und Prioritäten. Du weißt danach, was gebaut wird, warum, und in welcher Reihenfolge.",
    video: "/process/step-02-plan.mp4",
    poster: "/process/step-02-plan.webp",
    points: [
      {
        title: "Umfang klären",
        description:
          "Was muss rein, was kann warten, was ist Nice-to-have. So bleibt der erste Wurf fokussiert und finanzierbar.",
      },
      {
        title: "Ansatz wählen",
        description:
          "App, Workflow, Integration oder eine Kombination. Technik folgt dem Alltag — nicht umgekehrt.",
      },
      {
        title: "Plan aufsetzen",
        description:
          "Konkrete Schritte, Timeline und klare nächste Actions. Du siehst, was wann passiert und was von dir gebraucht wird.",
      },
    ],
  },
  {
    id: "build",
    title: "AUTOMATISIERUNG & SOFTWARE",
    subtitle: "Bauen, vernetzen, live nehmen",
    description:
      "Ich baue die maßgeschneiderte Lösung: Automatisierungen, Apps und Interfaces, die sich in deinen Alltag einfügen.",
    video: "/process/step-03-build.mp4",
    poster: "/process/step-03-build.webp",
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
          "Deploy, Feinschliff und Übergabe, die du wirklich nutzen kannst — arbeitsfähig, kein reiner Prototyp.",
      },
    ],
  },
  {
    id: "cycle",
    title: "VON VORNE\nANFANGEN",
    subtitle: "Der Loop geht weiter",
    description:
      "Neue Idee, neues Problem, nächster Hebel. Was läuft, wird verbessert. Was fehlt, wird als Nächstes gebaut.",
    video: "/process/step-04-loop.mp4",
    poster: "/process/step-04-loop.webp",
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
          "Mit jedem Durchlauf wird dein Setup schlauer und ruhiger. Der Loop ist Absicht — kein Zeichen für Scheitern.",
      },
    ],
  },
];

export interface Service {
  id: string;
  /** Marker in der Kreismarke — 1 / 2 / 3 / 4 */
  mark: string;
  title: string;
  description: string;
}

/** Angebot (Was) — bewusst getrennt von PROCESS_STEPS (Wie wir zusammenarbeiten). */
export const SERVICES: Service[] = [
  {
    id: "software",
    mark: "1",
    title: "Individuelle Software",
    description:
      "Maßgeschneiderte Web-Apps und Interfaces, die zu deinem Alltag passen. Statt Standardsoftware, die du verbiegen musst.",
  },
  {
    id: "automation",
    mark: "2",
    title: "Prozess Automationen",
    description:
      "Wiederkehrende Abläufe digitalisieren, verbinden und entlasten. Weniger Copy-Paste, mehr ruhiger Betrieb.",
  },
  {
    id: "ai",
    mark: "3",
    title: "KI Integrationen",
    description:
      "KI dort einbauen, wo sie echten Hebel hat: in bestehende Produkte und Workflows, nicht als Spielerei.",
  },
  {
    id: "website",
    mark: "4",
    title: "Website Design",
    description:
      "Markante Websites mit klarer Botschaft und ruhiger Bedienung. Design und Umsetzung aus einem Guss — kein Template-Feeling.",
  },
];

export const NAV_ITEMS = [
  { label: "Leistungen", href: "#services" },
  { label: "Prozess", href: "#process" },
  { label: "Projekte", href: "#work" },
  { label: "Über mich", href: "#about" },
  { label: "Kontakt", href: "#contact" },
] as const;
