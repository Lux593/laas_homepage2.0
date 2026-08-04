import { CLIENTS, type ClientTickerItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Einheitlicher Abstand zwischen den Kunden-Gruppen (Icon + Name). */
const ITEM_GAP = "gap-x-36 md:gap-x-48";

/** Basis-Icon-Slot — gleiche Höhe für Logo und Platzhalter. */
const ICON_SLOT =
  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md md:h-[4.5rem] md:w-[4.5rem]";

function ClientMark({ client }: { client: ClientTickerItem }) {
  return (
    <span className="flex shrink-0 items-center gap-x-4 md:gap-x-5">
      {client.icon ? (
        <span className={cn(ICON_SLOT, client.slotClass)} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={client.icon}
            alt=""
            className={cn(
              "h-full w-full object-contain",
              client.iconClass,
            )}
          />
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            ICON_SLOT,
            "border border-[#f2ede4]/40 bg-[#f2ede4]/12",
          )}
        />
      )}
      <span className="font-display text-lg font-bold uppercase tracking-[0.12em] text-[#f2ede4] md:text-xl md:tracking-[0.14em]">
        {client.name}
      </span>
    </span>
  );
}

function ClientSequence({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      className={`flex shrink-0 items-center ${ITEM_GAP} px-20 md:px-24`}
      aria-hidden={hidden || undefined}
    >
      {CLIENTS.map((client) => (
        <li key={client.name} className="flex shrink-0 items-center">
          <ClientMark client={client} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Harter schwarzer Balken mit endlosem Kunden-Ticker.
 * Sitzt als dunkle Naht zwischen Cream-Projekte und Cream-Über-mich.
 */
export default function Clients() {
  return (
    <section
      aria-label="Ausgewählte Kunden"
      className="relative z-10 overflow-hidden bg-[#050505] py-9 md:py-11"
    >
      <div className="flex w-max motion-safe:animate-[marquee_50s_linear_infinite] motion-reduce:animate-none">
        <ClientSequence />
        <ClientSequence hidden />
      </div>
    </section>
  );
}
