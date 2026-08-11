"use client";

import { useEffect } from "react";

import { retainLightChrome } from "@/hooks/useLightSection";

/**
 * Schaltet die feste Leiste samt Fortschrittsbalken für die Lebensdauer der
 * Seite auf die dunkle Schrift — für Seiten, die durchgehend auf Creme stehen.
 *
 * Beim Verlassen wird zurückgegeben statt gesetzt: die Startseite fährt ihren
 * Wechsel über useLightSection selbst, und ein hartes `dark` beim Unmount würde
 * ihr dazwischenfunken, wenn sie gerade über einer hellen Section steht.
 */
export function useLightChrome() {
  useEffect(() => retainLightChrome(), []);
}
