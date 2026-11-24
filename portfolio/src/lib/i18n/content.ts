/**
 * Führt sprachneutrale Daten (lib/constants.ts) und Texte (Wörterbuch) über
 * die IDs zusammen. Die Reihenfolge kommt immer aus den Asset-Listen.
 *
 * Reine Funktionen: das Wörterbuch kommt als Argument herein, diese Datei
 * importiert selbst keins. Aufgerufen werden sie von Server-Komponenten, die
 * das Ergebnis als Props an die Sections reichen.
 */

import {
  ABOUT_ROLE_ASSETS,
  CLIENT_ASSETS,
  NAV_HASHES,
  PROCESS_ASSETS,
  PROJECT_ASSETS,
  SERVICE_ASSETS,
  type AboutRole,
  type ClientTickerItem,
  type ProcessStep,
  type Project,
  type Service,
} from "../constants.ts";
import { LEGAL_SLUGS } from "../legal.ts";
import { type Locale, localizePath } from "./locales.ts";
import type { Dictionary, LegalLink, NavCopy } from "./types.ts";

export function getNavCopy(dict: Dictionary): NavCopy {
  return {
    items: NAV_HASHES.map((href) => ({ label: dict.nav.items[href], href })),
    menuToggle: dict.nav.menuToggle,
    logoAlt: dict.common.logoAlt,
    languageNav: dict.nav.languageNav,
    languageNames: dict.nav.languageNames,
  };
}

export function getServices(dict: Dictionary): Service[] {
  return SERVICE_ASSETS.map((asset) => ({
    ...asset,
    ...dict.services.items[asset.id],
  }));
}

export function getProcessSteps(dict: Dictionary): ProcessStep[] {
  return PROCESS_ASSETS.map((asset) => ({
    ...asset,
    ...dict.process.steps[asset.id],
  }));
}

/**
 * Die Galerie-Titel stehen im Wörterbuch als Liste, ein Titel je Aufnahme.
 * Passt die Zahl nicht, bricht der Build: sonst hinge ein Titel an der
 * falschen Aufnahme oder eine Aufnahme hätte keinen.
 */
export function getProjects(dict: Dictionary): Project[] {
  return PROJECT_ASSETS.map((asset) => {
    const copy = dict.work.projects[asset.id];
    if (copy.galleryTitles.length !== asset.gallery.length) {
      throw new Error(
        `Projekt "${asset.id}": ${copy.galleryTitles.length} Galerie-Titel für ${asset.gallery.length} Aufnahmen`,
      );
    }
    return {
      ...asset,
      title: copy.title,
      subtitle: copy.subtitle,
      features: copy.features,
      gallery: asset.gallery.map((item, i) => ({
        ...item,
        title: copy.galleryTitles[i],
      })),
    };
  });
}

export function getClients(dict: Dictionary): ClientTickerItem[] {
  return CLIENT_ASSETS.map((asset) => ({
    ...asset,
    name: dict.clients.names[asset.id],
  }));
}

export function getAboutRoles(dict: Dictionary): AboutRole[] {
  return ABOUT_ROLE_ASSETS.map((asset) => ({
    ...asset,
    position: dict.about.roles[asset.id],
  }));
}

/** Rechtslinks mit Pfad in der Sprache der Seite (`/agb` bzw. `/en/agb`). */
export function getLegalLinks(dict: Dictionary, locale: Locale): LegalLink[] {
  return LEGAL_SLUGS.map((slug) => ({
    slug,
    href: localizePath(`/${slug}`, locale),
    label: dict.legalLinks[slug],
  }));
}
