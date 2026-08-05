"use client";

import FramerMoveableThumbnails from "@/components/ui/framer-moveable-thumbnails";
import type { Project } from "@/lib/constants";

/**
 * One project, laid out as a centered spread rather than a card. Structure comes
 * from the grid and the horizontal hairlines, not from a container box.
 *
 * The data-reveal hooks are for the stacked layout only (useStackReveal, below
 * 1024px). Pinned, the panels slide in horizontally and nothing reads them.
 */
export default function ProjectPanel({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    // Pinned: vertically center the spread. The device column keeps a
    // --frame-h slot so landscape iPads share the iPhone's midline instead of
    // sitting flush under PROJEKTE. Stacked stays top-flowing.
    <article className="work-panel relative flex max-w-full flex-col justify-start overflow-x-clip lg:justify-center">
      {/* w-full is load-bearing: container-custom's auto margins would otherwise
          stop this flex item from stretching and shrink-wrap it to its content */}
      <div className="work-container w-full">
        {/* Text flush left (same edge as „PROJEKTE"); device stays in the right
            1fr column and is centered there — same X as the old centered pair. */}
        <div className="mt-[clamp(1.75rem,4vh,3rem)] lg:mt-0">
          {/* Text track stays at ~48ch (same measure as the iPhone panels). The
              device track is minmax(0,1fr) so a landscape iPad can shrink instead
              of stealing width from the copy via the default 1fr min-size:auto. */}
          <div className="grid w-full max-w-full grid-cols-1 items-center gap-y-10 lg:grid-cols-[minmax(40ch,48ch)_minmax(0,1fr)] lg:gap-x-[clamp(3rem,5vw,5rem)] lg:gap-y-0">
            <div className="min-w-0 w-full max-w-[48ch]">
              {/* Stacked, the header counter is out of sight by the time a panel
                  is on screen — so the position belongs to the panel itself.
                  Pinned, the counter in the section header already says it. */}
              <div
                data-reveal="copy"
                className="mb-7 flex items-center gap-4 lg:hidden"
                aria-hidden
              >
                <span className="shrink-0 font-mono text-caption tabular-nums tracking-[0.2em] text-[#6a6a6a]">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
                <span
                  data-reveal="rule"
                  className="h-px flex-1 bg-[#0a0a0a]/15"
                />
              </div>

              <header data-reveal="copy">
                <h3 className="whitespace-pre-line font-display text-[clamp(1.9rem,3.1vw,3.1rem)] font-bold leading-[0.98] tracking-tighter text-[#0a0a0a] uppercase">
                  {project.title}
                </h3>

                <p className="mt-3 max-w-[46ch] font-body text-body-md text-[#3a3a3a]">
                  {project.subtitle}
                </p>
              </header>

              <ul className="mt-7 border-t border-[#0a0a0a]/12">
                {project.features.map((feature, i) => (
                  <li
                    key={feature.title}
                    data-reveal="copy"
                    className="grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-[#0a0a0a]/12 py-2.5"
                  >
                    <span className="font-display text-caption font-bold tracking-tighter tabular-nums text-[#6a6a6a]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-body-sm font-semibold text-[#0a0a0a]">
                        {feature.title}
                      </p>
                      {/* The feature list is the vertical budget valve: in the pinned
                          layout the panel must fit inside 100svh, so descriptions only
                          appear when the viewport is both wide and tall enough. */}
                      <p className="mt-1 line-clamp-2 max-xl:hidden [@media(max-height:900px)]:hidden font-body text-caption leading-relaxed text-[#6a6a6a]">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* --frame-h slot = iPhone height budget. iPad centers inside it so
                both devices share one midline when the track slides. min-w-0 +
                w-full keep max-w-full on the frame honest. */}
            <div
              data-reveal="media"
              className="relative flex min-w-0 w-full items-center justify-center justify-self-center lg:min-h-[var(--frame-h)]"
            >
              <FramerMoveableThumbnails
                items={project.gallery}
                frame={project.device}
                fit={project.fit}
                screenColor={project.screenColor}
                screenInset={project.screenInset}
                unoptimized={project.unoptimized}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
