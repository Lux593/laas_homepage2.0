import { cn } from "@/lib/utils";

interface AnimatedLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  external?: boolean;
}

export default function AnimatedLink({
  children,
  href,
  className,
  external = false,
}: AnimatedLinkProps) {
  return (
    <a
      href={href}
      className={cn("relative inline-block group", className)}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <span className="relative">
        {children}
        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current origin-right scale-x-0 transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
      </span>
    </a>
  );
}
