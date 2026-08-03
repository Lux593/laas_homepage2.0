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
      { y: 0, opacity: 1, duration: 1, delay: 2.5, ease: "expo.out" }
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
        // env()-Werte 0, dann bleibt es bei py-5 / --container-padding.
        className="fixed top-0 left-0 right-0 z-[var(--z-nav)] pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 pl-[max(var(--container-padding),env(safe-area-inset-left))] pr-[max(var(--container-padding),env(safe-area-inset-right))] opacity-0"
      >
        <div className="mx-auto max-w-[var(--container-max)] flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="relative">
            <Image
              src="/liftapp.png"
              alt="LAAS - Luca Arnoldi App Studio"
              width={120}
              height={40}
              className="nav-logo h-8 w-auto"
              priority
            />
          </a>

          {/* Menu Button */}
          <button
            className="relative flex flex-col justify-center items-center gap-1.5 w-10 h-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Navigationsmenü umschalten"
            aria-expanded={isMenuOpen}
          >
            <motion.span
              className="w-6 h-[1.5px] block bg-[var(--ui-fg)] transition-colors duration-300"
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="w-6 h-[1.5px] block bg-[var(--ui-fg)] transition-colors duration-300"
              animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
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
            initial={{ clipPath: "circle(0% at calc(100% - 2rem) 2rem)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2rem) 2rem)" }}
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
