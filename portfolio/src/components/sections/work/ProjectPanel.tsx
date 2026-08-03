"use client";

import FramerMoveableThumbnails from "@/components/ui/framer-moveable-thumbnails";
import type { Project } from "@/lib/constants";

/**
 * One project, laid out as a centered spread rather than a card. Structure comes
 * from the grid and the horizontal hairlines, not from a container box.
 */
export default function ProjectPanel({ project }: { project: Project }) {
  return (
    // Top-aligned (not centered): iPhone vs iPad frames have different total
    // heights, and justify-center would push the grid pair to different Y.
    <article className="work-panel relative flex max-w-full flex-col justify-start overflow-x-clip">
      {/* w-full is load-bearing: container-custom's auto margins would otherwise
          stop this flex item from stretching and shrink-wrap it to its content */}
      <div className="work-container w-full">
        {/* Text flush left (same edge as „PROJEKTE"); device stays in the right
            1fr column and is centered there — same X as the old centered pair. */}
        <div className="mt-[clamp(1.75rem,4vh,3rem)]">
          <div className="grid w-full max-w-full grid-cols-1 items-center gap-y-10 lg:grid-cols-[minmax(0,48ch)_1fr] lg:gap-x-[clamp(3rem,5vw,5rem)] lg:gap-y-0">
            <div className="min-w-0 max-w-[48ch]">
              <header>
                <h3 className="font-display text-[clamp(1.9rem,3.1vw,3.1rem)] font-bold leading-[0.98] tracking-tighter text-[#0a0a0a] uppercase">
                  {project.title}
                </h3>

                <p className="mt-3 max-w-[46ch] font-body text-body-md text-[#3a3a3a]">
                  {project.subtitle}
                </p>
              </header>

              <p className="mt-6 max-w-[46ch] font-body text-body-sm leading-relaxed text-[#3a3a3a]">
                {project.description}
              </p>

              <ul className="mt-7 border-t border-[#0a0a0a]/12">
                {project.features.map((feature, i) => (
                  <li
                    key={feature.title}
                    className="grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-[#0a0a0a]/12 py-2.5"
                  >
                    <span className="font-mono text-caption tabular-nums text-[#6a6a6a]">
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

            {/* No min-w-0 here: it lets the auto column collapse and max-w-full
                then squeezes the device frame to 0 width. */}
            <div className="relative shrink-0 justify-self-center">
              <FramerMoveableThumbnails
                items={project.gallery}
                frame={project.device}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
