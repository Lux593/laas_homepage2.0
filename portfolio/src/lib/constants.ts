export const SITE_CONFIG = {
  name: "Luca Arnoldi App Studio",
  title: "Fullstack Developer & Digital Experience Engineer",
  tagline: "Code, die sich lebendig anfühlt",
  email: "hello@lucaarnoldi.com",
  socials: {
    github: "https://github.com/Lux593",
    linkedin: "https://www.linkedin.com/in/luca-arnoldi-2893521ba/",
    instagram: "https://www.instagram.com/luca_85ar/",
  },
} as const;

export const MANIFESTO_TEXT =
  "Ich verstehe dein Problem und löse es mit Code. Kurze Wege und ehrliche Kommunikation. Ich baue dir, was du brauchst – ohne bla bla.";

export interface ProjectFeature {
  title: string;
  description: string;
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
  image: string;
  logo: string;
  color: string;
}

export const PROJECTS: Project[] = [
  {
    id: "harley",
    title: "Harley-Davidson Powershop",
    subtitle: "Operations & Management Web-App",
    category: "Fullstack / Web-App",
    year: "2024 – heute",
    tech: ["React", "Next.js", "Python", "OpenAI", "PostgreSQL"],
    description:
      "Eine maßgeschneiderte Web-App für das Management des Tagesgeschäfts, der Mitarbeiter- und Eventplanung – ergänzt durch Workflow-Automatisierungen und KI-gestützte Prozesse.",
    details:
      "Für den Harley-Davidson Powershop habe ich eine umfassende Management-Plattform entwickelt, die sämtliche operative Abläufe digitalisiert und optimiert.",
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
    image: "/images/projects/nexus-hero.webp",
    logo: "/harley-davidson-logo.png",
    color: "#C49F7B",
  },
  {
    id: "intersport",
    title: "Intersport GEMO",
    subtitle: "Verleih-App & Management Dashboard",
    category: "Fullstack / Web-App",
    year: "2025",
    tech: ["React", "Next.js", "Supabase", "Tailwind CSS"],
    description:
      "Eine Verleih-App zur digitalen Abwicklung des gesamten Verleihprozesses zwischen Kunde und Intersport GEMO – inklusive Management-View für KPIs.",
    details:
      "Für Intersport GEMO habe ich eine vollständige Verleih-Plattform entwickelt, die den Prozess von der Kundenanfrage bis zur Rückgabe digital abbildet.",
    features: [
      {
        title: "Digitaler Verleihprozess",
        description:
          "End-to-End Abwicklung des Verleihs – von der Reservierung über die Ausgabe bis zur Rückgabe, vollständig digital und papierlos.",
      },
      {
        title: "Kunden-Interface",
        description:
          "Intuitive Oberfläche für Kunden zur Auswahl, Buchung und Verwaltung ihrer Verleih-Artikel.",
      },
      {
        title: "Management-View & KPIs",
        description:
          "Dashboard für das Management mit Echtzeit-KPIs zu Auslastung, Umsatz und Bestandsübersicht.",
      },
    ],
    image: "/images/projects/aura-hero.webp",
    logo: "/intersport-gemo-logo.png",
    color: "#DFBE9F",
  },
  {
    id: "mobileobjects",
    title: "mobileObjects",
    subtitle: "Feature-Entwicklung für bestehende Apps",
    category: "Fullstack / Zusatzentwicklung",
    year: "seit 2025",
    tech: ["Next.js", "n8n", "PostgreSQL", "Docker", "AWS"],
    description:
      "Entwicklung von Zusatzfunktionen für bestehende Applikationen – von Messaging-Systemen über Benutzerverwaltung bis hin zu operativen Tools.",
    details:
      "Für mobileObjects entwickle ich fortlaufend neue Features und Module, die nahtlos in die bestehende App-Landschaft integriert werden.",
    features: [
      {
        title: "Messaging-System",
        description:
          "Integriertes Nachrichtensystem für die direkte Kommunikation zwischen Nutzern innerhalb der Plattform.",
      },
      {
        title: "Benutzerverwaltung & Rollenkonzept",
        description:
          "Feingranulares Rollen- und Berechtigungssystem zur Steuerung von Zugriffen und Funktionen je nach Nutzerrolle.",
      },
      {
        title: "Operative Tools",
        description:
          "Praxisnahe Werkzeuge für den operativen Alltag, die Arbeitsabläufe vereinfachen und die Effizienz steigern.",
      },
    ],
    image: "/images/projects/flow-hero.webp",
    logo: "/mobileobjects-logo.png",
    color: "#A07850",
  },
];

export const EXPERTISE = [
  {
    title: "App-Entwicklung",
    description: "Maßgeschneiderte Native- und Web-Apps mit perfektem UI/UX-Design nach modernsten Standards.",
    icon: "layers",
  },
  {
    title: "Automatisierung",
    description: "KI-Modelle einbauen, Prozesse automatisieren, Daten auswerten. Smart Workflows, die deine Tools vernetzen — kein Copy-Paste mehr.",
    icon: "brain",
  },
  {
    title: "Premium Hosting",
    description: "Blitzschnelles, DSGVO-konformes Hosting. Server, Backups und Skalierung laufen vollautomatisch.",
    icon: "server",
  },
] as const;

export interface TechItem {
  name: string;
  icon: string;
  url: string;
}

export const TECH_STACK: TechItem[] = [
  { name: "n8n", icon: "/n8n-icon.svg", url: "https://n8n.io" },
  { name: "Supabase", icon: "/supabase-icon.svg", url: "https://supabase.com" },
  { name: "Firebase", icon: "/firebase-icon.svg", url: "https://firebase.google.com" },
  { name: "Firefly", icon: "/firefly-icon.svg", url: "https://www.adobe.com/products/firefly.html" },
  { name: "Hostinger", icon: "/hostinger-icon.svg", url: "https://www.hostinger.com" },
  { name: "Make", icon: "/make-icon.svg", url: "https://www.make.com" },
  { name: "Cursor AI", icon: "/cursor-icon-white.svg", url: "https://www.cursor.com" },
  { name: "Anthropic", icon: "/anthropic-icon.svg", url: "https://www.anthropic.com" },
  { name: "Gemini", icon: "/gemini-icon.svg", url: "https://gemini.google.com" },
  { name: "GitHub", icon: "/github-icon.svg", url: "https://github.com" },
  { name: "Spotify", icon: "/spotify-icon.svg", url: "https://www.spotify.com" },
  { name: "YouTube", icon: "/youtube-icon.svg", url: "https://www.youtube.com" },
];

export const NAV_ITEMS = [
  { label: "Projekte", href: "#work" },
  { label: "Expertise", href: "#expertise" },
  { label: "Über mich", href: "#about" },
  { label: "Kontakt", href: "#contact" },
] as const;
