import type { ProcessStep } from "@/lib/constants";

/**
 * Process step copy block — used in the pinned shuttle stage and mobile stack.
 */
export default function ProcessCopy({ step }: { step: ProcessStep }) {
  return (
    // data-reveal markiert die Ziele für useStackReveal im gestapelten Aufbau.
    // Im gepinnten Desktop-Layout ist es wirkungslos: dort blendet useProcessPin
    // die ganze Copy-Ebene, und der Stapel-Hook läuft erst unter 1024px.
    <div className="process-copy-inner min-w-0 max-w-[48ch]">
      <header data-reveal="copy">
        <h3 className="font-display text-[clamp(1.7rem,3vw,2.85rem)] font-bold leading-[0.98] tracking-tighter text-[#f2ede4] uppercase">
          {step.title}
        </h3>
        <p className="mt-3 max-w-[46ch] font-body text-body-md text-[#f2ede4]/70">
          {step.subtitle}
        </p>
      </header>

      <p
        data-reveal="copy"
        className="mt-6 max-w-[46ch] font-body text-body-sm leading-relaxed text-[#f2ede4]/70"
      >
        {step.description}
      </p>

      <ul className="process-points relative z-20 mt-7">
        {step.points.map((point, i) => (
          <li
            key={point.title}
            data-reveal="copy"
            className="process-point grid grid-cols-[2.25rem_minmax(0,46ch)] items-baseline gap-x-3 py-4"
          >
            <span className="font-mono text-caption tabular-nums text-[#f2ede4]/55">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="font-display text-body-sm font-semibold text-[#f2ede4]">
                {point.title}
              </p>
              <p className="mt-1 line-clamp-2 max-xl:hidden [@media(max-height:900px)]:hidden font-body text-caption leading-relaxed text-[#f2ede4]/55">
                {point.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
