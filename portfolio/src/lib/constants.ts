import type {
  DeviceFrame,
  ScreenFit,
} from "@/components/ui/framer-moveable-thumbnails";

/*
 * Nur Sprachneutrales: IDs, Asset-Pfade, Farben, Tech-, Firmen- und
 * Markennamen. Jeder Text, der übersetzt wird, steht in
 * lib/i18n/dictionaries; lib/i18n/content.ts führt beides über die IDs zu den
 * Typen weiter unten zusammen.
 *
 * Die Reihenfolge der Asset-Listen ist die Anzeigereihenfolge.
 */

export const SITE_CONFIG = {
  name: "Luca Arnoldi App Studio",
  /** Live-Domain — Basis für metadataBase, OG-Tags, Sitemap und JSON-LD. */
  url: "https://laas.website",
  email: "hello@laas.website",
  socials: {
    github: "https://github.com/Lux593",
    linkedin: "https://www.linkedin.com/in/luca-arnoldi-2893521ba/",
    instagram: "https://www.instagram.com/luca_85ar/",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* IDs                                                                        */
/* -------------------------------------------------------------------------- */

/* Die Wörterbücher führen ihre Listen als Record über diese IDs. Damit
   erzwingt TypeScript, dass jede ID in jeder Sprache Text hat. */

export type ServiceId = "software" | "automation" | "ai" | "website";
export type ProcessStepId = "idea" | "plan" | "build" | "cycle";
export type ProjectId =
  | "powershop-onlineshop"
  | "wintersport-verleih"
  | "powershop-service"
  | "powershop-madness"
  | "motools-service"
  | "wedding-app"
  | "individuelle-website";
export type ClientId =
  | "powershop"
  | "intersport"
  | "mobileobjects"
  | "private"
  | "ashprojects"
  | "lacilentana";
export type RoleId = "feldschloesschen" | "mobileobjects" | "laas";
export type NavHash = "#services" | "#process" | "#work" | "#about" | "#contact";

/** Section-Anker der Startseite in Menü-Reihenfolge — in beiden Sprachen gleich. */
export const NAV_HASHES: readonly NavHash[] = [
  "#services",
  "#process",
  "#work",
  "#about",
  "#contact",
];

/* -------------------------------------------------------------------------- */
/* Über mich                                                                  */
/* -------------------------------------------------------------------------- */

/** Name und Ort der Intro. Die Anrede davor steht im Wörterbuch
 *  (`about.greeting`): sie ist in der Iris ein eigener Typo-Grad, klein über
 *  dem Namen im Displaygrad. */
export const ABOUT_INTRO = {
  name: "Luca Arnoldi",
  location: "79576 Weil am Rhein",
} as const;

export interface AboutRoleAsset {
  id: RoleId;
  company: string;
  /**
   * Optionales Porträt für genau diese Rolle. Steht hier ein Pfad, wechselt die
   * Platte in „Über mich", sobald die Annotation gehovert oder fokussiert wird
   * — ein Gesicht, drei Leben. Fehlt der Pfad, bleibt ABOUT_PORTRAIT stehen;
   * die Section funktioniert vollständig mit einem einzigen Foto. Der Alt-Text
   * dazu gehört dann ins Wörterbuch.
   */
  image?: string;
}

export interface AboutRole extends AboutRoleAsset {
  position: string;
}

/** B&W-Porträt links im About-Streifen. Freigestellt ist es nicht — der weiße
 *  Studiogrund verschmilzt per `mix-blend-mode: multiply` mit der Cremeplatte,
 *  genau wie die Bauzeichnung in „Leistungen" im Cremegrund verschwindet.
 *  Der Alt-Text steht im Wörterbuch (`about.portraitAlt`). */
export const ABOUT_PORTRAIT = {
  src: "/personal_pic.jpg",
  width: 1206,
  height: 953,
} as const;

/** Beruflicher Werdegang — mittlere Spalte im About-Streifen. */
export const ABOUT_ROLE_ASSETS: readonly AboutRoleAsset[] = [
  { id: "feldschloesschen", company: "Feldschlösschen Getränke AG" },
  { id: "mobileobjects", company: "mobileObjects GmbH" },
  { id: "laas", company: "LAAS – Luca Arnoldi App Solutions" },
];

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

/* -------------------------------------------------------------------------- */
/* Kunden                                                                     */
/* -------------------------------------------------------------------------- */

export interface ClientAsset {
  id: ClientId;
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

export interface ClientTickerItem extends ClientAsset {
  name: string;
}

/** Kunden-Ticker zwischen Projekte und Über mich. */
export const CLIENT_ASSETS: readonly ClientAsset[] = [
  {
    id: "powershop",
    icon: "/power-shop-icon.svg",
  },
  {
    id: "intersport",
    icon: "/intersport-icon.svg",
    // Flaches Wordmark: breiter, etwas niedrigerer Slot.
    slotClass: "h-8 w-[10.5rem] md:h-10 md:w-[13rem]",
    iconClass: "object-contain",
  },
  {
    id: "mobileobjects",
    icon: "/mobileobjects-icon.svg",
    // Nur Markenzeichen (m + Ring); Wordmark flackerte im Marquee.
    slotClass: "h-11 w-[5rem] md:h-[3.25rem] md:w-[5.75rem]",
    iconClass: "object-contain",
  },
  {
    id: "private",
    icon: "/privatpersonen-icon.svg",
    iconClass: "object-contain",
  },
  {
    id: "ashprojects",
    icon: "/ashprojects-icon.svg",
    iconClass: "object-contain",
  },
  {
    id: "lacilentana",
    icon: "/lacilentana-icon.svg",
    // Querformat-Logo: etwas breiterer Slot, volle Marke sichtbar.
    slotClass: "w-[4.75rem] md:w-[5.25rem]",
    iconClass: "object-contain",
  },
];

/* -------------------------------------------------------------------------- */
/* Projekte                                                                   */
/* -------------------------------------------------------------------------- */

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectGalleryAsset {
  id: number;
  url: string;
  /** Defaults to image. Use `video` for a looping cutout clip (muted). */
  type?: "image" | "video";
  /** Poster / fallback still for video slides (shown on spare reel copies). */
  poster?: string;
}

export interface ProjectGalleryItem extends ProjectGalleryAsset {
  title: string;
}

export interface ProjectAsset {
  id: ProjectId;
  tech: string[];
  gallery: ProjectGalleryAsset[];
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
  /**
   * Soft-blur a band at the top of the cutout (0–0.15 of cutout height) to
   * hide OS status-bar chrome without cropping the screenshot.
   * iPad frames only — do not set on `device: "iphone"` projects.
   */
  screenBlurTop?: number;
  /** Bypass Next image optimizer for this project's gallery. */
  unoptimized?: boolean;
}

export interface Project extends Omit<ProjectAsset, "gallery"> {
  title: string;
  subtitle: string;
  features: ProjectFeature[];
  gallery: ProjectGalleryItem[];
}

export const PROJECT_ASSETS: readonly ProjectAsset[] = [
  {
    id: "powershop-onlineshop",
    tech: ["Shopify", "Liquid", "JavaScript", "GSAP"],
    gallery: [
      // Hero der Shop-Startseite, genau ein Umlauf der drei Modellfilme. Nur im
      // Aufnahme-Browser mit 7 statt 18 s pro Slide, sonst wäre die Schleife
      // fast eine Minute lang und rund viermal so groß.
      {
        id: 1,
        url: "/vorschaubilder/powershop-onlineshop-loop.mp4",
        type: "video",
        poster: "/vorschaubilder/powershop-onlineshop1.webp",
      },
      { id: 2, url: "/vorschaubilder/powershop-onlineshop2.webp" },
      { id: 3, url: "/vorschaubilder/powershop-onlineshop3.webp" },
      { id: 4, url: "/vorschaubilder/powershop-onlineshop4.webp" },
      { id: 5, url: "/vorschaubilder/powershop-onlineshop5.webp" },
      { id: 6, url: "/vorschaubilder/powershop-onlineshop6.webp" },
      { id: 7, url: "/vorschaubilder/powershop-onlineshop7.webp" },
    ],
    color: "#D9571A",
    // Browser-Captures 1280x844 (≈ 1.517) passen fast exakt in den
    // iPad-Ausschnitt (1.516). cover füllt randlos, ohne Statusleiste zum
    // Ausblenden, daher kein screenBlurTop.
    fit: "cover",
    screenColor: "#0A0A0A",
  },
  {
    // RentDesk, der Neubau der Verleih-App (id bleibt, damit nichts anderes bricht)
    id: "wintersport-verleih",
    tech: ["React", "Vite", "TypeScript", "Supabase"],
    gallery: [
      // Aufnahmen aus dem Demo-Modus (nur fiktive Daten), als installierte App
      // auf einem iPhone mit 402 pt Breite: Safe-Area oben 62 / unten 34 und
      // eine nachgebaute Statusleiste wie bei den echten Bildschirmfotos zuvor.
      { id: 1, url: "/vorschaubilder/rentdesk1.webp" },
      { id: 2, url: "/vorschaubilder/rentdesk2.webp" },
      { id: 3, url: "/vorschaubilder/rentdesk3.webp" },
      { id: 4, url: "/vorschaubilder/rentdesk4.webp" },
      { id: 5, url: "/vorschaubilder/rentdesk5.webp" },
      { id: 6, url: "/vorschaubilder/rentdesk6.webp" },
      { id: 7, url: "/vorschaubilder/rentdesk7.webp" },
      { id: 8, url: "/vorschaubilder/rentdesk8.webp" },
      { id: 9, url: "/vorschaubilder/rentdesk9.webp" },
    ],
    color: "#7A8FA0",
    device: "iphone",
    // Hochformat-Captures (1206x2622 ≈ 2.174) im iPhone-Ausschnitt (2.139):
    // cover schneidet nur ~1.6% Höhe weg. Von oben decken, damit Statusleiste
    // und Kopf stehen bleiben und unten nur Rand der Navigation wegfällt.
    fit: "cover-top",
    screenColor: "#F2F6FC",
    unoptimized: true,
  },
  {
    id: "powershop-service",
    tech: ["React", "Next.js", "Python", "OpenAI", "PostgreSQL"],
    gallery: [
      // Dateinamen bewusst neu vergeben (vorher powershop1-5.webp). Der
      // Image-Optimizer cached nach (URL, Breite, Qualitaet) mit 4h TTL und
      // prueft die Quelldatei in der Zeit nicht nach — ein In-Place-Austausch
      // unter gleichem Namen hat alte Renditionen weiterleben lassen. Neue URL
      // = neuer Cache-Key in Next, im hcdn und im Browser.
      {
        id: 1,
        url: "/vorschaubilder/powershop-app-loop.mp4",
        type: "video",
        poster: "/vorschaubilder/powershop-app1.webp",
      },
      { id: 2, url: "/vorschaubilder/powershop-app2.webp" },
      { id: 3, url: "/vorschaubilder/powershop-app3.webp" },
      { id: 4, url: "/vorschaubilder/powershop-app4.webp" },
      { id: 5, url: "/vorschaubilder/powershop-app5.webp" },
      { id: 6, url: "/vorschaubilder/powershop-app6.webp" },
    ],
    color: "#C49F7B",
    // iPadOS-Statusleiste in den Captures weich ausblenden — Crop würde das
    // Seitenverhältnis ändern und bei object-contain schwarze Balken erzeugen.
    screenBlurTop: 0.042,
  },
  {
    id: "powershop-madness",
    tech: ["Unity", "C#", "Mobile"],
    gallery: [
      { id: 1, url: "/vorschaubilder/mobilegame1.webp" },
      { id: 2, url: "/vorschaubilder/mobilegame2.webp" },
      { id: 3, url: "/vorschaubilder/mobilegame3.webp" },
      { id: 4, url: "/vorschaubilder/mobilegame4.webp" },
      { id: 5, url: "/vorschaubilder/mobilegame5.webp" },
    ],
    color: "#DFBE9F",
    device: "iphone",
  },
  {
    id: "motools-service",
    tech: ["Next.js", "React", "TypeScript", "Supabase", "OpenAI"],
    gallery: [
      {
        id: 1,
        url: "/vorschaubilder/motools-app-loop.mp4",
        type: "video",
        poster: "/vorschaubilder/motools-app1.webp",
      },
      { id: 2, url: "/vorschaubilder/motools-app2.webp" },
      { id: 3, url: "/vorschaubilder/motools-app3.webp" },
      { id: 4, url: "/vorschaubilder/motools-app4.webp" },
      { id: 5, url: "/vorschaubilder/motools-app5.webp" },
      { id: 6, url: "/vorschaubilder/motools-app6.webp" },
    ],
    color: "#8A9A8B",
    screenBlurTop: 0.042,
  },
  {
    id: "wedding-app",
    tech: ["React", "Next.js", "Supabase", "TypeScript"],
    gallery: [
      { id: 1, url: "/vorschaubilder/wedding1.webp" },
      { id: 2, url: "/vorschaubilder/wedding2.webp" },
      { id: 3, url: "/vorschaubilder/wedding3.webp" },
      { id: 4, url: "/vorschaubilder/wedding4.webp" },
      { id: 5, url: "/vorschaubilder/wedding5.webp" },
    ],
    color: "#B8897A",
    device: "iphone",
    unoptimized: true,
  },
  {
    id: "individuelle-website",
    tech: ["Next.js", "React", "TypeScript", "Design"],
    gallery: [
      {
        id: 1,
        url: "/vorschaubilder/qimo-ipad-loop.mp4",
        type: "video",
        poster: "/vorschaubilder/qimo-ipad-loop.webp",
      },
    ],
    color: "#6E8A9A",
    device: "ipad",
    fit: "cover",
    screenColor: "#F2EEE8",
  },
];

/* -------------------------------------------------------------------------- */
/* Prozess                                                                    */
/* -------------------------------------------------------------------------- */

export interface ProcessStepAsset {
  id: ProcessStepId;
  /** Looping comic clip (muted). Optional until all steps have assets. */
  video?: string;
  /** Poster / reduced-motion fallback for the clip. */
  poster?: string;
}

export interface ProcessStep extends ProcessStepAsset {
  title: string;
  subtitle: string;
  description: string;
  points: { title: string; description: string }[];
}

export const PROCESS_ASSETS: readonly ProcessStepAsset[] = [
  {
    id: "idea",
    video: "/process/step-01-idea.mp4",
    poster: "/process/step-01-idea-poster.webp",
  },
  {
    id: "plan",
    video: "/process/step-02-plan.mp4",
    poster: "/process/step-02-plan.webp",
  },
  {
    id: "build",
    video: "/process/step-03-build.mp4",
    poster: "/process/step-03-build.webp",
  },
  {
    id: "cycle",
    video: "/process/step-04-loop.mp4",
    poster: "/process/step-04-loop.webp",
  },
];

/* -------------------------------------------------------------------------- */
/* Leistungen                                                                 */
/* -------------------------------------------------------------------------- */

/** Visual der Leistungen-Aufteilung (linke Spalte auf dem Desktop). */
export const SERVICES_LANDSCAPE = {
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

export interface ServiceAsset {
  id: ServiceId;
  /** Marker in der Kreismarke — 1 / 2 / 3 / 4 */
  mark: string;
  /**
   * Die Räumungsstufe der Arbeitsplatz-Zeichnung, die zu diesem Kapitel gehört.
   *
   * Vier Stände desselben Blatts: die Ziehkante des Desktop-Visuals steht auf
   * 100 % / 60 % / 38 % / 0 % Chaos — was dort der Finger fährt, fährt im
   * gestapelten Aufbau der Scroll. Deshalb hängt das Bild am Kapitel und nicht
   * an der Sektion: die Zuordnung 1:1 ist die Aussage, nicht die Reihenfolge.
   *
   * Bewusst PNG und nicht die WebP-Fassungen des Desktop-Blatts: die Zeichnungen
   * kamen so aus der Hand, Next optimiert sie beim Ausliefern ohnehin.
   */
  visual: string;
}

export interface Service extends ServiceAsset {
  title: string;
  description: string;
}

/** Angebot (Was) — bewusst getrennt von PROCESS_ASSETS (Wie wir zusammenarbeiten). */
export const SERVICE_ASSETS: readonly ServiceAsset[] = [
  { id: "software", mark: "1", visual: "/services/mobile-leistung1.png" },
  { id: "automation", mark: "2", visual: "/services/mobile-leistung2.png" },
  { id: "ai", mark: "3", visual: "/services/mobile-leistung3.png" },
  { id: "website", mark: "4", visual: "/services/mobile-leistung4.png" },
];
