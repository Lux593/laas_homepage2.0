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

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  tech: string[];
  description: string;
  image: string;
  logo: string;
  color: string;
}

export const PROJECTS: Project[] = [
  {
    id: "harley",
    title: "Harley-Davidson Powershop",
    subtitle: "E-Commerce & Markenportal",
    category: "Fullstack / E-Commerce",
    year: "2025",
    tech: ["React", "Next.js", "Python", "OpenAI", "PostgreSQL"],
    description:
      "Eine intelligente Oberfläche, die sich durch neuronale Mustererkennung und Echtzeit-KI-Inferenz an das Nutzerverhalten anpasst.",
    image: "/images/projects/nexus-hero.webp",
    logo: "/harley-davidson-logo.png",
    color: "#c8ff00",
  },
  {
    id: "intersport",
    title: "Intersport GEMO",
    subtitle: "Digitale Sporthandel-Plattform",
    category: "Mobile / Handel",
    year: "2025",
    tech: ["Swift", "SwiftUI", "Core Data", "Plaid API"],
    description:
      "Ein Premium-Banking-Erlebnis mit biometrischer Sicherheit, Echtzeit-Analysen und gestengesteuerter Navigation.",
    image: "/images/projects/aura-hero.webp",
    logo: "/intersport-gemo-logo.png",
    color: "#00d4ff",
  },
  {
    id: "mobileobjects",
    title: "mobileObjects",
    subtitle: "Workflow-Automatisierungsplattform",
    category: "SaaS / Automatisierung",
    year: "2024",
    tech: ["Next.js", "n8n", "PostgreSQL", "Docker", "AWS"],
    description:
      "Enterprise-Workflow-Automatisierung, die manuelle Prozesse durch intelligente Pipeline-Orchestrierung um 80% reduziert.",
    image: "/images/projects/flow-hero.webp",
    logo: "/mobileobjects-logo.png",
    color: "#ff6b35",
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
}

export const TECH_STACK: TechItem[] = [
  { name: "n8n", icon: "/n8n-icon.svg" },
  { name: "Supabase", icon: "/supabase-icon.svg" },
  { name: "Firebase", icon: "/firebase-icon.svg" },
  { name: "Firefly", icon: "/firefly-icon.svg" },
  { name: "Hostinger", icon: "/hostinger-icon.svg" },
  { name: "Make", icon: "/make-icon.svg" },
  { name: "Cursor AI", icon: "/cursor-icon-white.svg" },
  { name: "Anthropic", icon: "/anthropic-icon.svg" },
  { name: "Gemini", icon: "/gemini-icon.svg" },
];

export const NAV_ITEMS = [
  { label: "Projekte", href: "#work" },
  { label: "Über mich", href: "#about" },
  { label: "Expertise", href: "#expertise" },
  { label: "Kontakt", href: "#contact" },
] as const;
