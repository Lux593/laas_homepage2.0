import { cn } from "@/lib/utils";

export type DeviceVariant = "iphone" | "ipad";

const FRAMES = {
  iphone: {
    src: "/iphone-frame.webp",
    aspect: "566 / 1156",
    // frame 566×1156, cutout x=23 y=17 w=525 h=1123
    screen: {
      left: "4.0636%",
      top: "1.4706%",
      width: "92.7562%",
      height: "97.1453%",
      radius: "11.81% / 5.52%",
    },
    width: "min(280px, 85vw)",
    assetW: 566,
    assetH: 1156,
  },
  ipad: {
    src: "/ipad-frame.webp",
    aspect: "940 / 644",
    // frame 940×644, cutout x=24 y=29 w=893 h=589
    screen: {
      left: "2.5532%",
      top: "4.5031%",
      width: "95%",
      height: "91.4596%",
      radius: "3.36% / 5.09%",
    },
    width: "min(720px, 92vw)",
    assetW: 940,
    assetH: 644,
  },
} as const;

interface DeviceBezelProps {
  variant: DeviceVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Bildschirmfeld — die Tropfenanimation misst daran ihre Schlussblende. */
  screenRef?: React.Ref<HTMLDivElement>;
}

export default function DeviceBezel({
  variant,
  children,
  className,
  style,
  screenRef,
}: DeviceBezelProps) {
  const frame = FRAMES[variant];

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{
        aspectRatio: frame.aspect,
        width: frame.width,
        ...style,
      }}
    >
      <div
        ref={screenRef}
        className="absolute overflow-hidden bg-[#f7f4ef]"
        style={{
          left: frame.screen.left,
          top: frame.screen.top,
          width: frame.screen.width,
          height: frame.screen.height,
          borderRadius: frame.screen.radius,
        }}
      >
        {children}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- static bezel overlay */}
      <img
        src={frame.src}
        alt=""
        width={frame.assetW}
        height={frame.assetH}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
    </div>
  );
}
