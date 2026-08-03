/**
 * Scroll-Fortschritt des Hero-Rückzugs (0 = oben, 1 = Hero vollständig raus).
 *
 * Bewusst ein mutables Modul-Singleton statt React-State: ScrollTrigger schreibt
 * bei jedem Scroll-Frame, der r3f-`useFrame`-Loop in HeroCanvas liest. Über State
 * wären das Re-Renders im Frame-Takt.
 */
export const heroScroll = { progress: 0 };
