import gsap from "gsap";

export const EASE = {
  outExpo: "expo.out",
  outQuint: "quint.out",
  inOutQuart: "quart.inOut",
  outBack: "back.out(1.7)",
  outElastic: "elastic.out(1, 0.5)",
} as const;

export const ANIMATION = {
  revealUp: {
    from: { y: 120, opacity: 0, rotateX: -40 },
    to: { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: EASE.outExpo },
  },

  revealClip: {
    from: { clipPath: "inset(100% 0% 0% 0%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: EASE.outQuint },
  },

  fadeIn: {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: EASE.outQuint },
  },

  scaleIn: {
    from: { scale: 0.85, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 1, ease: EASE.outExpo },
  },

  stagger: {
    fast: 0.05,
    medium: 0.1,
    slow: 0.15,
  },

  scrollTrigger: {
    start: "top 85%",
    end: "bottom 15%",
    toggleActions: "play none none none" as const,
  },
} as const;

export function createStaggerReveal(
  container: HTMLElement,
  childSelector: string,
  options?: gsap.TweenVars
) {
  const children = container.querySelectorAll(childSelector);

  return gsap.fromTo(
    children,
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: EASE.outQuint,
      stagger: ANIMATION.stagger.medium,
      ...options,
    }
  );
}
