import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
  separator?: string;
}

export default function Marquee({
  items,
  speed = 30,
  className,
  separator = "\u2726",
}: MarqueeProps) {
  const content = items.join(` ${separator} `) + ` ${separator} `;

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div
        className="inline-flex animate-[marquee_var(--duration)_linear_infinite]"
        style={{ "--duration": `${speed}s` } as React.CSSProperties}
      >
        <span className="text-display-sm md:text-display-md font-display font-bold tracking-tighter text-text-muted/10 mr-4">
          {content}
        </span>
        <span className="text-display-sm md:text-display-md font-display font-bold tracking-tighter text-text-muted/10 mr-4">
          {content}
        </span>
      </div>
    </div>
  );
}
