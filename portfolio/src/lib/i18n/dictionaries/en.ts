import type { Dictionary } from "../types.ts";

/**
 * Englische Texte der Seite (US-Englisch, „du" → „you", sinngemäß statt
 * wörtlich). Marken-, Firmen- und Eigennamen bleiben wie im Deutschen. Ein
 * `\n` in Display-Titeln ist der gesetzte Zeilenumbruch und trifft etwa die
 * deutsche Zeilenlänge, damit die Display-Zeilen nicht breiter laufen.
 *
 * Nur auf dem Server importieren (über `getDictionary`): eine
 * Client-Komponente, die das hier zieht, packt den Text ins Bundle.
 */
export const en = {
  meta: {
    title: "Luca Arnoldi — Fullstack Developer & Digital Experience Engineer",
    description:
      "I build digital experiences that don't just work — they captivate. Fullstack developer specializing in React, Next.js, AI integration & premium web experiences.",
    ogDescription: "Welcome to my homepage.",
    knowsAbout: [
      "Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "Custom Software",
      "Process Automation",
      "AI Integration",
      "Website Design",
    ],
  },

  common: {
    skipToContent: "Skip to content",
    logoAlt: "LAAS – Luca As A Service",
  },

  nav: {
    items: {
      "#services": "Services",
      "#process": "Process",
      "#work": "Projects",
      "#about": "About me",
      "#contact": "Contact",
    },
    menuToggle: "Toggle navigation menu",
    languageNav: "Language",
    languageNames: { de: "Deutsch", en: "English" },
  },

  hero: {
    greeting: "Hey, I'm Luca",
    focusLabel: "My focus",
    rotatingWords: [
      "Web Apps",
      "Mobile Apps",
      "AI Integration",
      "Process Automation",
      "Website Design",
    ],
    scrollHint: "Scroll",
  },

  services: {
    eyebrow: "What I offer",
    headline: "SERVICES",
    /** Große Aussage — steht im aria-Label der Landschaft. */
    statement:
      "When off-the-shelf tools fall short, I build you a way through.",
    sectionLabel: "Services",
    landscapeLabel:
      "{statement} Drag to switch between a cluttered and a cleared-up desk.",
    landscapeValue: "{value} percent chaos",
    items: {
      software: {
        title: "Custom Software",
        description:
          "Tailor-made web apps and interfaces that fit the way you work. Instead of off-the-shelf software you have to bend into shape.",
      },
      automation: {
        title: "Process Automation",
        description:
          "Digitize, connect and offload the workflows you repeat every day. Less copy-paste, calmer operations.",
      },
      ai: {
        title: "AI Integration",
        description:
          "AI built in where it gives you real leverage: into existing products and workflows, not as a gimmick.",
      },
      website: {
        title: "Website Design",
        description:
          "Distinctive websites with a clear message and calm, easy navigation. Design and build in one seamless piece, no template feel.",
      },
    },
  },

  process: {
    eyebrow: "How we work together",
    headline: "HOW DOES IT WORK?",
    mediaLabel: "{subtitle}: short comic animation",
    cycleLabels: { idea: "Idea", plan: "Plan", build: "Build", cycle: "Loop" },
    steps: {
      idea: {
        title: "YOUR IDEA OR YOUR PROBLEM",
        subtitle: "The starting point",
        description:
          "You come to me with an idea, a bottleneck or a process that's slowing you down. That's exactly where we start.",
        points: [
          {
            title: "What slows you down",
            description:
              "Manual work, missing tools or an idea that hasn't taken shape yet. Often it's not a big project, just a point of friction that keeps coming back.",
          },
          {
            title: "What you need",
            description:
              "Clarity on whether software, automation or both will help. We separate symptom from cause before anything gets built.",
          },
          {
            title: "What you bring",
            description:
              "Context from your day-to-day. That's all you need for now. A walkthrough or a list of annoying steps is enough.",
          },
        ],
      },
      plan: {
        title: "DISCUSS &\nPLAN",
        subtitle: "Mapping out the path together",
        description:
          "We pin down goals, scope and priorities. Afterwards you know what gets built, why, and in what order.",
        points: [
          {
            title: "Define the scope",
            description:
              "What has to be in, what can wait, what's nice-to-have. That keeps the first version focused and affordable.",
          },
          {
            title: "Pick the approach",
            description:
              "App, workflow, integration or a mix. The tech follows your day-to-day, not the other way around.",
          },
          {
            title: "Set up the plan",
            description:
              "Concrete steps, a timeline and clear next actions. You see what happens when, and what's needed from you.",
          },
        ],
      },
      build: {
        title: "AUTOMATION & SOFTWARE",
        subtitle: "Build, connect, go live",
        description:
          "I build the tailor-made solution: automations, apps and interfaces that fit right into your day-to-day.",
        points: [
          {
            title: "Automate",
            description:
              "Recurring tasks run without copy-paste. Systems talk to each other instead of you shuffling data back and forth.",
          },
          {
            title: "Build software",
            description:
              "Native and web apps with a clear UI and a solid stack. Built for your process, not for feature lists.",
          },
          {
            title: "Go live",
            description:
              "Deployment, polish and a handover you can actually use. Ready for real work, not just a prototype.",
          },
        ],
      },
      cycle: {
        title: "BACK TO\nTHE START",
        subtitle: "The loop keeps going",
        description:
          "New idea, new problem, next lever. What works gets better. What's missing gets built next.",
        points: [
          {
            title: "Use the feedback",
            description:
              "Whatever snags in daily use becomes the next building block. Real usage beats assumptions from the kickoff.",
          },
          {
            title: "Keep improving",
            description:
              "Small improvements instead of one-and-done. Every round makes the setup calmer and more robust.",
          },
          {
            title: "A growing system",
            description:
              "With every round your setup gets smarter and calmer. The loop is intentional, not a sign of failure.",
          },
        ],
      },
    },
  },

  work: {
    eyebrow: "A selection of my work",
    headline: "PROJECTS",
    gallery: {
      previous: "Previous image",
      next: "Next image",
      list: "Screenshots of this project",
      item: "Screenshot {current} of {total}",
    },
    projects: {
      "powershop-onlineshop": {
        title: "SHOPIFY\nONLINE STORE",
        subtitle: "E-commerce for a Harley-Davidson dealer",
        // Wie im Deutschen je zwei volle Zeilen (95–110 Zeichen).
        features: [
          {
            title: "Custom Shopify store",
            description:
              "Its own theme instead of a template. Pages, filters, cart and animations are all built from the ground up.",
          },
          {
            title: "Personalized for the dealer",
            description:
              "Their own bikes, team, location and opening hours make the store feel like the dealership itself.",
          },
          {
            title: "Showcasing the services",
            description:
              "Workshop, custom builds you can open up one by one, test rides and financing, each with a direct inquiry.",
          },
          {
            title: "Product management & reporting",
            description:
              "Products and stock are maintained automatically, checked against the warehouse and analyzed in reports.",
          },
        ],
        galleryTitles: [
          "Home page with motorcycle films in the hero",
          "Opened custom build “Project Falk”",
          "Motorcycles with a film in the header",
          "New motorcycles with filters",
          "Men's collection",
          "Product page for a leather jacket",
          "Open cart with three items",
        ],
      },
      "wintersport-verleih": {
        title: "RENTDESK\nRENTAL SYSTEM",
        subtitle: "Rental app for Intersport Gemo",
        // Wie im Deutschen je zwei volle Zeilen (100–110 Zeichen).
        features: [
          {
            title: "Digital customer check-in",
            description:
              "Guests sign up on their own phone via QR code, ID photo included. The team takes it straight into the rental.",
          },
          {
            title: "Rental, register & analytics",
            description:
              "Equipment step by step, a signature on the device, a register with daily closing and revenue per employee.",
          },
          {
            title: "Vacation planner & work schedule",
            description:
              "Vacation requests with approval, leave balances and a team calendar, plus the work schedule in 30-minute slots.",
          },
          {
            title: "Newsletter for customers",
            description:
              "Built from blocks and sent to customer groups. Customers opt in themselves when they sign up for a rental.",
          },
        ],
        galleryTitles: [
          "QR sign-up: choose the rental type",
          "Photograph the ID",
          "Overview with key figures and vacation",
          "Rental: choose skis & boards",
          "Signature on the device",
          "Weekly work schedule",
          "Monthly vacation calendar",
          "Newsletter preview before sending",
          "Season analytics",
        ],
      },
      "powershop-service": {
        title: "POWER SHOP\nSERVICE APP",
        subtitle: "Operations & Management Web App",
        features: [
          {
            title: "Day-to-day management",
            description:
              "One central interface for running daily operations, with real-time overviews and task management.",
          },
          {
            title: "Staff & event planning",
            description:
              "Built-in planning for shifts, availability and events, with automatic conflict detection.",
          },
          {
            title: "Workflow automations",
            description:
              "Automated business processes that eliminate repetitive tasks and speed up day-to-day operations.",
          },
          {
            title: "AI processes & features",
            description:
              "Smart AI-powered features, from automated reports to intelligent decision support.",
          },
        ],
        galleryTitles: [
          "Staff sign-in",
          "Dashboard",
          "Service Center",
          "Log a test ride",
          "Vacation & absence planning",
          "Workflow automations",
        ],
      },
      "powershop-madness": {
        title: "POWER SHOP\nMADNESS",
        subtitle: "Arcade Mobile Game",
        features: [
          {
            title: "Arcade gameplay",
            description:
              "Short, intense sessions with rising speed and clear high-score moments.",
          },
          {
            title: "The brand, in the game",
            description:
              "Visual and thematic ties to the Power Shop. Recognizable without breaking the flow.",
          },
          {
            title: "Mobile-first UX",
            description:
              "Touch-optimized controls and interfaces that make sense instantly on a smartphone.",
          },
          {
            title: "Availability",
            description:
              "Designed for every device, with the same game experience on smartphone and tablet.",
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
        subtitle: "Internal tool platform for logistics & telematics",
        // Wie im Deutschen auf zwei Zeilen gehalten (80–90 Zeichen), damit die
        // Feature-Liste dieselbe Höhe hat wie bei den übrigen Projekten.
        features: [
          {
            title: "Telematics tools",
            description:
              "Find, edit and close out cases involving vehicles and GPS boxes, all by their VIN.",
          },
          {
            title: "User & role management",
            description:
              "Manage portal users by role or customer, from super administrator all the way to driver.",
          },
          {
            title: "Driver & master data",
            description:
              "Guided forms set up drivers, including customer assignment and login details, in one step.",
          },
          {
            title: "Team board & idea voting",
            description:
              "Notes, shortcuts and merch suggestions that the whole team can vote on directly.",
          },
        ],
        galleryTitles: [
          "Sign-in",
          "Home with shortcuts",
          "GPS box error tracking",
          "User management by role",
          "Add a driver",
          "Idea management",
        ],
      },
      "wedding-app": {
        title: "WEDDING\nORGANIZER APP",
        subtitle: "RSVP, guides & info for wedding guests",
        features: [
          {
            title: "RSVP & guest replies",
            description:
              "Collect attendance, days and contact details digitally. Clear, personal, no paper chaos.",
          },
          {
            title: "Outfit guide per event",
            description:
              "Style ideas for every occasion on the wedding schedule, incl. shopping tips and dress code notes.",
          },
          {
            title: "Travel & local tips",
            description:
              "Recommendations for restaurants, cafés and shopping nearby, with direct Maps links.",
          },
          {
            title: "FAQ & info at a glance",
            description:
              "Dress code, arrival, transport and other questions in a clear accordion.",
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
        title: "CUSTOM\nWEBSITE",
        subtitle: "A tailor-made website instead of a template",
        features: [
          {
            title: "Original design, no template",
            description:
              "Visual language and layout grow out of brand and content. Recognizable, no site-builder feel.",
          },
          {
            title: "Clear message first",
            description:
              "A strong landing page that instantly says who you are and why someone should stay.",
          },
          {
            title: "Calm navigation",
            description:
              "A few focused sections and CTAs. Easy to read on desktop, effortless on mobile.",
          },
          {
            title: "Design and code in one piece",
            description:
              "From look to live site, all from a single source, with no gap between design and build.",
          },
        ],
        galleryTitles: ["Website walkthrough"],
      },
    },
  },

  clients: {
    sectionLabel: "Selected clients",
    names: {
      powershop: "Harley Davidson Powershop",
      intersport: "Intersport Gemo",
      mobileobjects: "Mobile Objects",
      private: "Private Clients",
      ashprojects: "Ash Projects",
      lacilentana: "La Cilentana Pastamanufaktur",
    },
  },

  about: {
    eyebrow: "Who's in your corner",
    headline: "ABOUT ME",
    greeting: "Hey, I'm",
    /** Zwei Zeilen — Umbruch nach „technology,". */
    subtitle: ["I'm into technology,", "AI and all that crazy stuff."],
    rolesHeading: "What I do for work right now",
    toolsHeading: "Tools I like",
    portraitAlt: "Luca Arnoldi",
    roles: {
      feldschloesschen: "Team Lead, Logistics Systems & Process Development",
      mobileobjects: "Full Stack Developer (part-time)",
      laas: "Self-employed",
    },
  },

  cta: {
    headline: "Got a project in mind?",
    subline: "drop me a line - let's get started.",
    button: "Start a project",
    socialLabel: "Visit my {platform} profile",
  },

  legalLinks: {
    agb: "Terms",
    datenschutz: "Privacy",
    impressum: "Legal Notice",
  },

  legalChrome: {
    eyebrow: "Legal",
    updatedLabel: "Last updated:",
    backHome: "Back to home",
    moreLegal: "More legal information",
    tocLabel: "Contents of this document",
    tocHeading: "Contents",
    fillLabel: "Still to be filled in: {label}",
    streetLabel: "Street address",
    translationNotice: {
      text: "This is a courtesy translation. Only the German version is legally binding.",
      linkLabel: "Read the German version",
    },
  },

  notFound: {
    metaTitle: "Page not found — Luca Arnoldi App Solutions",
    eyebrow: "Error 404",
    title: "NOTHING TO SEE",
    lede: "This page doesn't exist — at least not anymore, or not yet. Maybe a typo crept into the address, maybe the link is older than the page behind it.",
    whereTo: "Where to go instead",
    sectionsLabel: "Sections of the home page",
  },
} satisfies Dictionary;
