"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectGalleryItem } from "@/lib/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Device bezels are RGBA overlays with a fully transparent screen area, so the
 * screenshots sit underneath and show through the cutout.
 *
 * Geometry is measured off each asset by flood-filling the enclosed transparent
 * region from the centre — never eyeballed. Adding a device means running that
 * measurement first, including its corner radius.
 *
 * `fit` differs per device because every screenshot is a 16:9 capture:
 *  - iPad (screen 1.516) → `contain`, so nothing is cropped off the dashboards.
 *  - iPhone (screen 0.468) → `cover`, whose window lands on x 36.9%–63.1% of the
 *    source. The game canvas sits at 37.0%–62.9%, so cover trims exactly the dead
 *    dark margins around it. `contain` would shrink it to a thin strip instead.
 */
const FRAMES = {
  ipad: {
    src: "/ipad-frame.webp",
    // frame 940x644, cutout x=24 y=29 w=893 h=589, corner radius ~30px.
    // Its square cutout corners are covered by opaque bezel (alpha ~235).
    aspect: "940 / 644",
    screen: { left: "2.5532%", top: "4.5031%", width: "95%", height: "91.4596%" },
    radius: "3.36% / 5.09%",
    fit: "object-contain",
    // Always width-driven so aspect-ratio derives the height and the bezel can
    // never desync from the absolutely positioned screen. --frame-h (the pinned
    // 100svh budget, see globals.css) sets a definite width — percentages of an
    // auto-sized parent collapse to 0 once the project spread shrink-wraps.
    //
    // --frame-avail is the second term for the same reason: stacked, --frame-h
    // is a share of the viewport HEIGHT, and on a portrait phone that made the
    // landscape iPad ~740px wide. max-w-full cannot catch it (see --frame-w in
    // globals.css), so the cap has to be part of the width itself. Arrow
    // clearance is already deducted inside --frame-avail by .device-well.
    box: "w-[min(calc(var(--frame-h)*1.4596),var(--frame-avail))] max-w-full",
    // Beside the device once pinned. Stacked, the frame fills the column edge to
    // edge and there is no room outside it, so the arrows go back on the screen
    // and flip to cream-on-dark to stay legible there.
    nav: {
      left: "left-5 lg:-left-14",
      right: "right-5 lg:-right-14",
      color:
        "bg-[#f0ede8] text-[#0a0a0a] focus-visible:outline-[#f0ede8] lg:bg-[#0a0a0a] lg:text-[#f0ede8] lg:focus-visible:outline-[#0a0a0a]",
    },
  },
  iphone: {
    src: "/iphone-frame.webp",
    // frame 566x1156, cutout x=23 y=17 w=525 h=1123, corner radius ~62px.
    // These corners are transparent, so the radius below is load-bearing.
    aspect: "566 / 1156",
    screen: { left: "4.0636%", top: "1.4706%", width: "92.7562%", height: "97.1453%" },
    radius: "11.81% / 5.52%",
    fit: "object-cover",
    // Portrait: always height-driven, or w-full would make it ~1430px tall. Both
    // axes are stated explicitly off the same height term (566/1156 = 0.4896) —
    // Safari resolves an aspect-ratio flex item's inline size before applying the
    // definite height, so `w-auto` collapses the box to 0 there and only the nav
    // arrows remain visible. The --frame-avail term (1156/566 = 2.0424 converts
    // the width budget into a height) keeps it inside the column on narrow phones.
    box: "h-[min(var(--frame-h),calc(var(--frame-avail)*2.0424))] w-[calc(min(var(--frame-h),calc(var(--frame-avail)*2.0424))*0.4896)] max-w-full shrink-0",
    // The portrait screen is only ~180px wide — arrows on top would bury the game.
    // Narrow enough that they fit beside the device at every viewport.
    nav: {
      left: "-left-14",
      right: "-right-14",
      color: "bg-[#0a0a0a] text-[#f0ede8] focus-visible:outline-[#0a0a0a]",
    },
  },
} as const;

export type DeviceFrame = keyof typeof FRAMES;

/**
 * Override the frame's default object-fit.
 * - `contain-top`: whole screenshot, smaller in the cutout, aligned to the top
 * - `cover-top`: fills width and crops the bottom
 */
export type ScreenFit = "contain" | "contain-top" | "cover" | "cover-top";

const SCREEN_FIT: Record<ScreenFit, string> = {
  contain: "object-contain",
  "contain-top": "object-contain object-top",
  cover: "object-cover",
  "cover-top": "object-cover object-top",
};

interface FramerMoveableThumbnailsProps {
  items: ProjectGalleryItem[];
  frame?: DeviceFrame;
  /** Override the frame default (iPad contain / iPhone cover). */
  fit?: ScreenFit;
  /** Backdrop behind letterboxed screenshots. Defaults to near-black. */
  screenColor?: string;
  /**
   * Inset the screenshot inside the cutout (0–0.4). Makes the image read
   * smaller without changing the device bezel size.
   */
  screenInset?: number;
  /** Skip the Next image optimizer (avoids stale resized crops while iterating assets). */
  unoptimized?: boolean;
}

/** Positive-safe modulo — JS `%` keeps the sign of the dividend. */
function wrap(i: number, len: number) {
  return ((i % len) + len) % len;
}

export default function FramerMoveableThumbnails({
  items,
  frame = "ipad",
  fit,
  screenColor = "#0a0a0a",
  screenInset = 0,
  unoptimized = false,
}: FramerMoveableThumbnailsProps) {
  // Unbounded on purpose: it counts steps taken, not which slide is showing.
  // Going left from the first slide gives -1, and the transform follows without
  // ever hitting a wall — that is what makes the loop endless. `wrap()` maps it
  // back onto a real item wherever one is needed.
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const didInit = useRef(false);
  // Read by the resize observer, which must not re-subscribe on every step.
  const indexRef = useRef(0);
  const x = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const device = FRAMES[frame];
  const imageFit = fit ? SCREEN_FIT[fit] : device.fit;
  const insetPct = Math.min(Math.max(screenInset, 0), 0.4) * 100;
  const len = items.length;

  // With motion there is a settle to hide the re-base behind, so the index may
  // sit outside 0..len-1 until `onComplete` folds it. Without motion there is no
  // such moment, so fold up front and let the reel's spare copies cover the one
  // frame where the slide crosses a set boundary.
  const step = (delta: number) =>
    setIndex((i) => (prefersReducedMotion ? wrap(i + delta, len) : i + delta));

  // Where slide `i` sits, in pixels. The `+ len` is the offset onto the middle
  // copy of the reel, so index 0 shows the first item of that copy and index -1
  // reaches back into the first copy rather than off the front edge.
  const slotX = useCallback(
    (i: number, width: number) => -(i + len) * width,
    [len]
  );

  // Mirrored into a ref rather than read from a closure: the resize observer
  // below must not resubscribe per step, or its initial callback would fire mid
  // animation and snap the slide to its target.
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (isDragging || !screenRef.current) return;

    const el = screenRef.current;
    const targetX = slotX(index, el.offsetWidth || 1);

    // First paint has to land on the middle copy without animating there from
    // x=0, which would look like the reel scrolling in on load.
    if (!didInit.current || prefersReducedMotion) {
      didInit.current = true;
      x.set(targetX);
      return;
    }

    const controls = animate(x, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      onComplete: () => {
        // Re-base once the slide has settled. The reel is only three copies
        // wide, so an index left to run would eventually point past its end and
        // render blank. Folding it back into the middle copy while shifting `x`
        // by exactly the same number of widths keeps the pixels identical — the
        // jump is in the numbers only, so the loop never runs out of reel.
        const folded = wrap(index, len);
        if (folded !== index) {
          x.set(slotX(folded, el.offsetWidth || 1));
          setIndex(folded);
        }
      },
    });

    return () => controls.stop();
  }, [index, x, isDragging, prefersReducedMotion, len, slotX]);

  // The pinned frame is sized off viewport height, so a resize changes the slide
  // width under a transform that is already in pixels. Without this the reel
  // drifts off-centre after any resize.
  useEffect(() => {
    const el = screenRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      x.set(slotX(indexRef.current, el.offsetWidth || 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [x, slotX]);

  if (len === 0) return null;

  // Render the set three times and sit on the middle copy. The strip is only
  // ever translated by whole screen-widths, so a neighbour is already mounted
  // in the direction of travel and the slide reads as continuous instead of
  // snapping back. One spare copy each side is enough: the transform is
  // re-based (see below) before the index can walk past it.
  const reel = [...items, ...items, ...items];

  return (
    <div className="mx-auto w-fit max-w-full">
      {/* Frame box — the bezel stays put, the screenshots slide behind it.
          .device-well carries the clearance for the off-bezel arrows and hands
          the remaining width down as --frame-avail (see globals.css). */}
      <div className={`device-well device-well--${frame}`}>
        <div
          className={`relative ${device.box}`}
          style={{ aspectRatio: device.aspect }}
        >
          <div
            ref={screenRef}
            className="absolute overflow-hidden touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              ...device.screen,
              // Backdrop for whatever the screenshot's aspect leaves uncovered
              backgroundColor: screenColor,
              borderRadius: device.radius,
            }}
          >
            <motion.div
              className="flex h-full"
              drag="x"
              dragElastic={0.2}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(_e, info) => {
                setIsDragging(false);
                const screenWidth = screenRef.current?.offsetWidth || 1;
                const offset = info.offset.x;
                const velocity = info.velocity.x;

                let newIndex = index;

                if (Math.abs(velocity) > 500) {
                  newIndex = velocity > 0 ? index - 1 : index + 1;
                } else if (Math.abs(offset) > screenWidth * 0.3) {
                  newIndex = offset > 0 ? index - 1 : index + 1;
                }

                // No clamp — the drag wraps in both directions like the arrows.
                step(newIndex - index);
              }}
              // The offset onto the middle copy lives in `x` (see slotX), never in
              // a margin: this box is width:auto, so a negative margin-left would
              // widen it by the same amount instead of just moving it — and the
              // w-full slides would inherit that inflated width.
              style={{ x }}
            >
              {reel.map((item, i) => {
                // Only the middle copy is described. The outer two are the same
                // pictures again, purely there to cover the wrap, so leaving them
                // labelled would read every screenshot out three times.
                const isSpare = i < len || i >= len * 2;
                return (
                <div
                  key={`${item.id}-${i}`}
                  className="relative h-full w-full shrink-0"
                  aria-hidden={isSpare || undefined}
                  style={
                    insetPct
                      ? { padding: `${insetPct}%` }
                      : undefined
                  }
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={item.url}
                      alt={isSpare ? "" : item.title}
                      fill
                      sizes="(max-width: 1024px) 92vw, 50vw"
                      className={`${imageFit} select-none pointer-events-none`}
                      style={{ objectPosition: imageFit.includes("object-top") ? "top" : undefined }}
                      draggable={false}
                      priority={!isSpare && i === len}
                      unoptimized={unoptimized}
                    />
                  </div>
                </div>
                );
              })}
            </motion.div>
          </div>

          <Image
            src={device.src}
            alt=""
            fill
            sizes="(max-width: 1024px) 92vw, 50vw"
            className="pointer-events-none select-none object-contain"
            aria-hidden
            priority={false}
          />

          {/* Positioned against the frame box, not the screen, so the portrait
              device can place them outside the bezel instead of over the content.
              Never disabled now — both directions always have somewhere to go. */}
          <motion.button
            type="button"
            aria-label="Vorheriges Bild"
            onClick={() => step(-1)}
            className={`absolute ${device.nav.left} ${device.nav.color} top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full opacity-90 transition-transform hover:scale-110 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </motion.button>

          <motion.button
            type="button"
            aria-label="Nächstes Bild"
            onClick={() => step(1)}
            className={`absolute ${device.nav.right} ${device.nav.color} top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full opacity-90 transition-transform hover:scale-110 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
