"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { NAV_ITEMS } from "@/lib/constants";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const tween = gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.65, ease: "expo.out" }
    );
    return () => { tween.kill(); };
  }, []);

  return (
    <>
      {/* Nav Bar */}
      <div
        ref={navRef}
        // The overlay is dark and sits *below* the nav, so force dark chrome while
        // the menu is open — otherwise the logo goes dark-on-dark over cream sections.
        data-ui-theme={isMenuOpen ? "dark" : undefined}
        // Safe-Area: das Layout läuft mit viewportFit "cover", die feste Leiste
        // säße im Querformat sonst unter dem Notch. Ohne Notch sind die
        // env()-Werte 0 — Logo und Menü sitzen am Viewport-Rand, nicht im
        // Content-Container.
        className="fixed top-0 left-0 right-0 z-[var(--z-nav)] pt-[max(1.5rem,env(safe-area-inset-top))] pb-8 pl-[max(3rem,env(safe-area-inset-left))] pr-[max(3rem,env(safe-area-inset-right))] opacity-0"
      >
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <a href="#" className="relative shrink-0">
            <Image
              src="/laas-logo.svg"
              alt="LAAS – Luca As A Service"
              width={200}
              height={54}
              className="nav-logo h-5 w-auto md:h-6"
              priority
            />
          </a>

          {/* Menu Button */}
          <button
            className="relative flex shrink-0 flex-col justify-center items-center gap-2 w-12 h-12 md:w-14 md:h-14"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Navigationsmenü umschalten"
            aria-expanded={isMenuOpen}
          >
            <motion.span
              className="w-8 h-[2px] md:w-9 block bg-[var(--ui-fg)] transition-colors duration-300"
              animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="w-8 h-[2px] md:w-9 block bg-[var(--ui-fg)] transition-colors duration-300"
              animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </div>

      {/* Fullscreen Menu Overlay — outside nav to avoid transform inheritance */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[calc(var(--z-nav)-1)] bg-bg-primary/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-center"
            initial={{ clipPath: "circle(0% at calc(100% - 2.25rem) 2.75rem)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.25rem) 2.75rem)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-display-sm font-display font-bold tracking-tighter hover:text-accent-primary transition-colors duration-300"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
