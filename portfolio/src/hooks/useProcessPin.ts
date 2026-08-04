"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Timeline units: resting beat before/after each shuttle move. */
const HOLD = 0.4;
/** Timeline units the image wipe takes. */
const MOVE = 1.15;
/** Vertical scroll (in pinned-box heights) consumed per timeline unit. */
const SCROLL_UNIT = 0.95;

const COUNTER_DIGIT = "data-counter-digit";

function styleDigit(el: HTMLElement) {
  el.style.display = "block";
  el.style.height = "1em";
  el.style.flexShrink = "0";
}

function rollCounter(
  viewport: HTMLElement,
  nextLabel: string,
  direction: 1 | -1
) {
  const liveStrip = viewport.querySelector<HTMLElement>(".pin-counter__strip");
  if (liveStrip) {
    gsap.killTweensOf(liveStrip);
    const pending = viewport.dataset.counterPending;
    const settle = document.createElement("span");
    settle.setAttribute(COUNTER_DIGIT, "");
    settle.className = "block h-[1em]";
    settle.textContent = pending || nextLabel;
    styleDigit(settle);
    viewport.replaceChildren(settle);
    delete viewport.dataset.counterPending;
  }

  const current = viewport.querySelector<HTMLElement>(`[${COUNTER_DIGIT}]`);
  if (!current) {
    viewport.textContent = nextLabel;
    return;
  }
  if (current.textContent === nextLabel) return;

  const incoming = current.cloneNode(false) as HTMLElement;
  incoming.setAttribute(COUNTER_DIGIT, "");
  incoming.textContent = nextLabel;
  styleDigit(incoming);
  styleDigit(current);

  const strip = document.createElement("span");
  strip.className = "pin-counter__strip";
  strip.style.display = "flex";
  strip.style.flexDirection = "column";
  strip.style.willChange = "transform";

  viewport.dataset.counterPending = nextLabel;

  const finish = () => {
    viewport.replaceChildren(incoming);
    delete viewport.dataset.counterPending;
  };

  if (direction >= 0) {
    strip.append(incoming, current);
    viewport.replaceChildren(strip);
    gsap.fromTo(
      strip,
      { yPercent: -50 },
      { yPercent: 0, duration: 0.45, ease: "power3.out", onComplete: finish }
    );
  } else {
    strip.append(current, incoming);
    viewport.replaceChildren(strip);
    gsap.fromTo(
      strip,
      { yPercent: 0 },
      { yPercent: -50, duration: 0.45, ease: "power3.out", onComplete: finish }
    );
  }
}

/** Even steps: media in column 2 (x=0). Odd steps: media in column 1 (x=shift). */
function mediaX(index: number, shift: () => number) {
  return index % 2 === 0 ? 0 : shift();
}

/**
 * Pins the process stage and scrubs a media shuttle: the image wipes across
 * the outgoing copy while the next step fades in on the opposite side.
 * Desktop + motion only — mobile / reduced-motion keep the stacked layout.
 */
export function useProcessPin(stepCount: number) {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shuttleRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const stage = stageRef.current;
    const shuttle = shuttleRef.current;
    if (!pin || !stage || !shuttle || stepCount < 2) return;

    const mm = gsap.matchMedia();

    // MUST stay byte-identical to the @media query for .process-pin in process.css
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const steps = stepCount - 1;
        const totalUnits = HOLD + steps * (MOVE + HOLD);
        const track = stage.querySelector<HTMLElement>(
          ".process-shuttle-track"
        );
        if (!track) return;

        const copies = gsap.utils
          .toArray<HTMLElement>("[data-process-copy]", stage)
          .sort(
            (a, b) =>
              Number(a.getAttribute("data-process-copy")) -
              Number(b.getAttribute("data-process-copy"))
          );
        const mediaLayers = gsap.utils
          .toArray<HTMLElement>("[data-process-media]", shuttle)
          .sort(
            (a, b) =>
              Number(a.getAttribute("data-process-media")) -
              Number(b.getAttribute("data-process-media"))
          );

        /** One column + gap — moves the shuttle from column 2 into column 1. */
        const shift = () => {
          const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
          const colW = Math.max(0, (track.clientWidth - gap) / 2);
          return -(colW + gap);
        };

        gsap.set(shuttle, { x: 0, force3D: true });
        gsap.set(copies, { autoAlpha: 0, y: 0 });
        gsap.set(mediaLayers, { autoAlpha: 0 });
        if (copies[0]) gsap.set(copies[0], { autoAlpha: 1 });
        if (mediaLayers[0]) gsap.set(mediaLayers[0], { autoAlpha: 1 });
        copies.forEach((copy, i) =>
          copy.setAttribute("aria-hidden", i === 0 ? "false" : "true")
        );

        let lastIndex = -1;

        const settledIndex = (progressUnits: number) => {
          let cursor = HOLD;
          let index = 0;
          for (let i = 0; i < steps; i++) {
            const mid = cursor + MOVE / 2;
            if (progressUnits < mid) {
              index = i;
              break;
            }
            cursor += MOVE + HOLD;
            index = i + 1;
          }
          return gsap.utils.clamp(0, steps, index);
        };

        const applyStep = (index: number, animateCounter: boolean) => {
          if (index === lastIndex) return;
          const prev = lastIndex;
          lastIndex = index;

          if (counterRef.current) {
            const label = String(index + 1).padStart(2, "0");
            if (!animateCounter || prev < 0) {
              const digit = counterRef.current.querySelector<HTMLElement>(
                `[${COUNTER_DIGIT}]`
              );
              if (digit) digit.textContent = label;
              else counterRef.current.textContent = label;
            } else {
              rollCounter(
                counterRef.current,
                label,
                index > prev ? 1 : -1
              );
            }
          }

          copies.forEach((copy, i) =>
            copy.setAttribute("aria-hidden", i === index ? "false" : "true")
          );

          mediaLayers.forEach((layer, i) => {
            const video = layer.querySelector("video");
            if (!video) return;
            if (i === index) void video.play().catch(() => {});
            else video.pause();
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () =>
              "+=" + Math.round(totalUnits * pin.offsetHeight * SCROLL_UNIT),
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.65,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            // onUpdate feuert oft erst bei Progress-Änderung — beim Eintritt
            // in den Pin (progress=0) sonst kein play(), und das Poster bleibt
            // stehen, bis man weiter scrollt.
            onEnter: (self) =>
              applyStep(settledIndex(self.progress * totalUnits), false),
            onEnterBack: (self) =>
              applyStep(settledIndex(self.progress * totalUnits), false),
            onUpdate: (self) =>
              applyStep(settledIndex(self.progress * totalUnits), true),
          },
        });

        tl.to({}, { duration: HOLD });

        for (let i = 0; i < steps; i++) {
          const from = i;
          const to = i + 1;
          const fromSide = from % 2 === 0 ? "right" : "left";
          const toSide = to % 2 === 0 ? "right" : "left";
          const outCopy = copies[from];
          const inCopy = copies[to];
          const outMedia = mediaLayers[from];
          const inMedia = mediaLayers[to];
          const label = `wipe-${from}-${to}`;

          tl.addLabel(label);

          tl.fromTo(
            shuttle,
            { x: () => mediaX(from, shift) },
            {
              x: () => mediaX(to, shift),
              duration: MOVE,
              ease: "none",
              immediateRender: false,
            },
            label
          );

          if (outCopy) {
            tl.to(
              outCopy,
              {
                autoAlpha: 0,
                y: fromSide === "right" ? 10 : -10,
                duration: MOVE * 0.5,
                ease: "power1.in",
              },
              label
            );
          }

          if (inCopy) {
            tl.fromTo(
              inCopy,
              {
                autoAlpha: 0,
                y: toSide === "left" ? 18 : -18,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: MOVE * 0.62,
                ease: "power2.out",
                immediateRender: false,
              },
              `${label}+=${MOVE * 0.3}`
            );
          }

          if (outMedia && inMedia) {
            // Overlap the crossfade so the shuttle never goes empty mid-wipe
            tl.to(
              outMedia,
              { autoAlpha: 0, duration: MOVE * 0.5, ease: "power1.inOut" },
              `${label}+=${MOVE * 0.35}`
            );
            tl.fromTo(
              inMedia,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: MOVE * 0.5,
                ease: "power1.inOut",
                immediateRender: false,
              },
              `${label}+=${MOVE * 0.2}`
            );
          }

          tl.to({}, { duration: HOLD });
        }

        requestAnimationFrame(() => {
          const st = tl.scrollTrigger;
          if (st) applyStep(settledIndex(st.progress * totalUnits), false);
          ScrollTrigger.refresh();
        });

        return () => {
          gsap.set(shuttle, { clearProps: "transform" });
          gsap.set(copies, { clearProps: "opacity,visibility,transform" });
          gsap.set(mediaLayers, { clearProps: "opacity,visibility" });
          copies.forEach((copy) => copy.removeAttribute("aria-hidden"));
        };
      }
    );

    return () => mm.revert();
  }, [stepCount]);

  return { pinRef, stageRef, shuttleRef, counterRef };
}
