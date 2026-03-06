"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

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
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[var(--z-nav)] transition-all duration-700 ease-out-expo opacity-0",
        isScrolled ? "py-3" : "py-6"
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-[var(--container-max)] transition-all duration-700 ease-out-expo flex items-center justify-between",
          isScrolled
            ? "mx-6 md:mx-8 px-6 py-3 glass border border-glass-border rounded-full"
            : "px-[var(--container-padding)] py-4"
        )}
      >
        {/* Logo */}
        <a href="#" className="relative group">
          <Image
            src="/liftapp.png"
            alt="LAAS - Luca Arnoldi App Studio"
            width={120}
            height={40}
            className="h-8 w-auto brightness-0 invert"
            priority
          />
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="relative text-caption font-mono uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors duration-300 group"
            >
              <span className="text-text-muted/50 mr-1">0{i + 1}</span>
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent-primary transition-all duration-500 ease-out-expo group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a
            href="#contact"
            className="relative px-6 py-2.5 text-caption font-mono uppercase tracking-widest text-bg-primary bg-text-primary rounded-full hover:bg-accent-primary transition-colors duration-500 ease-out-expo"
          >
            Kontakt
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Navigationsmenü umschalten"
          aria-expanded={isMobileMenuOpen}
        >
          <motion.span
            className="w-6 h-[1px] bg-text-primary block"
            animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-6 h-[1px] bg-text-primary block"
            animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-0 bg-bg-primary/98 backdrop-blur-xl z-[-1] flex flex-col items-center justify-center gap-8"
            initial={{ clipPath: "circle(0% at top right)" }}
            animate={{ clipPath: "circle(150% at top right)" }}
            exit={{ clipPath: "circle(0% at top right)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-display-sm font-display font-bold tracking-tighter"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
