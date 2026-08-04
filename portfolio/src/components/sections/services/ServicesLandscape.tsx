import Image from "next/image";
import { SERVICES_INTRO } from "@/lib/constants";

/**
 * Leistungen-Visual: Bauzeichnung im Hochformat, komplett sichtbar (contain).
 * Weiß der Zeichnung verschwindet per multiply im Creme der Section.
 */
export default function ServicesLandscape({
  className = "",
}: {
  className?: string;
}) {
  return (
    <figure
      className={`services-landscape relative overflow-hidden ${className}`.trim()}
      aria-label={SERVICES_INTRO.statement}
    >
      <Image
        src={SERVICES_INTRO.visual}
        alt=""
        fill
        sizes="(max-width: 1023px) 60vw, 45vw"
        className="object-contain object-center"
        priority
        aria-hidden
      />
    </figure>
  );
}
