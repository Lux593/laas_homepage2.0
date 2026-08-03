import type { DeviceFrame } from "@/components/ui/framer-moveable-thumbnails";

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

export const MANIFESTO_TEXT =
  "Ich verstehe dein Problem und löse es mit Code. Kurze Wege und ehrliche Kommunikation. Ich baue dir, was du brauchst – ohne bla bla.";

export interface AboutFact {
  label: string;
  value: string;
  href?: string;
}

/** Faktenzeile unter dem Manifest-Satz in „Über mich". */
export const ABOUT_FACTS: AboutFact[] = [
  { label: "Rolle", value: "Fullstack Developer" },
  { label: "Fokus", value: "Web-Apps & KI-Integration" },
  { label: "Stack", value: "Next.js · TypeScript · Supabase" },
  { label: "Erreichbar", value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
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
}

export const PROJECTS: Project[] = [
  {
    id: "powershop-service",
    title: "POWER SHOP SERVICE APP",
    subtitle: "Operations & Management Web-App",
    category: "Fullstack / Web-App",
    year: "2024 – heute",
    tech: ["React", "Next.js", "Python", "OpenAI", "PostgreSQL"],
    description:
      "Eine maßgeschneiderte Web-App für das Management des Tagesgeschäfts, der Mitarbeiter- und Eventplanung – ergänzt durch Workflow-Automatisierungen und KI-gestützte Prozesse.",
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
      { id: 1, url: "/vorschaubilder/powershop1.png", title: "Dashboard Overview" },
      { id: 2, url: "/vorschaubilder/powershop2.png", title: "Scheduling View" },
      { id: 3, url: "/vorschaubilder/powershop3.png", title: "Operations Detail" },
      { id: 4, url: "/vorschaubilder/powershop4.png", title: "Workflow Screen" },
      { id: 5, url: "/vorschaubilder/powershop5.png", title: "Analytics View" },
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
    ],
    gallery: [
      { id: 1, url: "/vorschaubilder/game1.png", title: "Game Screen 01" },
      { id: 2, url: "/vorschaubilder/game2.png", title: "Game Screen 02" },
      { id: 3, url: "/vorschaubilder/game3.png", title: "Game Screen 03" },
      { id: 4, url: "/vorschaubilder/game4.png", title: "Game Screen 04" },
      { id: 5, url: "/vorschaubilder/game5.png", title: "Game Screen 05" },
    ],
    color: "#DFBE9F",
    device: "iphone",
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
      { id: 1, url: "/vorschaubilder/wedding1.png", title: "RSVP Screen" },
      { id: 2, url: "/vorschaubilder/wedding2.png", title: "Navigation Menu" },
      { id: 3, url: "/vorschaubilder/wedding3.png", title: "Outfits Guide" },
      { id: 4, url: "/vorschaubilder/wedding4.png", title: "Local Tips" },
      { id: 5, url: "/vorschaubilder/wedding5.png", title: "FAQ Screen" },
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
    poster: "/process/step-01-idea.png",
    points: [
      {
        title: "Was dich bremst",
        description: "Manuelle Arbeit, fehlende Tools oder eine Idee ohne Form.",
      },
      {
        title: "Was du brauchst",
        description: "Klarheit, ob Software, Automatisierung oder beides hilft.",
      },
      {
        title: "Was du mitbringst",
        description: "Kontext aus deinem Alltag. Mehr brauchst du erstmal nicht.",
      },
    ],
  },
  {
    id: "plan",
    title: "BESPRECHEN & PLANEN",
    subtitle: "Gemeinsam den Weg festlegen",
    description:
      "Wir klären Ziel, Umfang und Prioritäten. Du weißt danach, was gebaut wird, warum, und in welcher Reihenfolge.",
    video: "/process/step-02-plan.mp4",
    poster: "/process/step-02-plan.png",
    points: [
      {
        title: "Scope schärfen",
        description: "Was muss rein, was kann warten, was ist Nice-to-have.",
      },
      {
        title: "Ansatz wählen",
        description: "App, Workflow, Integration oder eine Kombination.",
      },
      {
        title: "Plan aufsetzen",
        description: "Konkrete Schritte, Timeline und klare nächste Actions.",
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
    poster: "/process/step-03-build.png",
    points: [
      {
        title: "Automatisieren",
        description: "Wiederkehrende Aufgaben laufen ohne Copy-Paste.",
      },
      {
        title: "Software bauen",
        description: "Native- und Web-Apps mit klarer UI und stabilem Stack.",
      },
      {
        title: "Live bringen",
        description: "Deploy, Feinschliff und Übergabe, die du wirklich nutzen kannst.",
      },
    ],
  },
  {
    id: "cycle",
    title: "VON VORNE ANFANGEN",
    subtitle: "Der Loop geht weiter",
    description:
      "Neue Idee, neues Problem, nächster Hebel. Was läuft, wird verbessert. Was fehlt, wird als Nächstes gebaut.",
    video: "/process/step-04-loop.mp4",
    poster: "/process/step-04-loop.png",
    points: [
      {
        title: "Feedback nutzen",
        description: "Was im Alltag hakt, wird der nächste Baustein.",
      },
      {
        title: "Iterieren",
        description: "Kleine Verbesserungen statt einmal und fertig.",
      },
      {
        title: "Wachsendes System",
        description: "Mit jedem Durchlauf wird dein Setup schlauer und ruhiger.",
      },
    ],
  },
];

export interface TechItem {
  name: string;
  icon: string;
  url: string;
}

export const TECH_STACK: TechItem[] = [
  { name: "n8n", icon: "/n8n-icon.svg", url: "https://n8n.io" },
  { name: "Supabase", icon: "/supabase-icon.svg", url: "https://supabase.com" },
  { name: "Hostinger", icon: "/hostinger-icon.svg", url: "https://www.hostinger.com" },
  { name: "Cursor AI", icon: "/cursor-icon-white.svg", url: "https://www.cursor.com" },
  { name: "GitHub", icon: "/github-icon.svg", url: "https://github.com" },
  { name: "Spotify", icon: "/spotify-icon.svg", url: "https://www.spotify.com" },
  { name: "YouTube", icon: "/youtube-icon.svg", url: "https://www.youtube.com" },
];

export const NAV_ITEMS = [
  { label: "Projekte", href: "#work" },
  { label: "Prozess", href: "#process" },
  { label: "Über mich", href: "#about" },
  { label: "Kontakt", href: "#contact" },
] as const;
