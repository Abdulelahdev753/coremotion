'use client';

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TiltedCoverProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right";

  /**
   * The content to be displayed on the cover
   */
  cover?: ReactNode;

  /**
   * Determines if the cover should tilt with the background
   */
  tiltCover?: boolean;

  /**
   * The content to be displayed on the background
   */
  children?: ReactNode;

  /**
   * The image to be displayed on the cover. Takes precedence over `children`.
   */
  image?: React.ComponentPropsWithoutRef<"img">;
}

// Sized landscape (4:3-ish) for the UltraFit package mockups, with the site's
// dark glass surfaces instead of the registry's white/light defaults.
export default function TiltedCover({
  children,
  direction = "left",
  tiltCover = true,
  cover,
  image,
}: TiltedCoverProps) {
  const tiltLeft = direction === "left";
  const factor = tiltLeft ? 1 : -1;
  // Touch screens can't hover, so a tap (or Enter/Space) toggles the same
  // reveal; mouse pointers keep the hover behaviour and are excluded here.
  const [pressed, setPressed] = useState(false);

  return (
    // The container has height and width set to the size of the content + padding.
    <div className="flex h-64 w-full items-center justify-center overflow-hidden">
      <div
        className="group/tilt relative h-52 w-64 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
        role="button"
        tabIndex={0}
        aria-pressed={pressed}
        aria-label={typeof image?.alt === "string" ? image.alt : undefined}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") setPressed((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setPressed((value) => !value);
          }
        }}
        onBlur={() => setPressed(false)}
      >
        {/* Background content */}
        <div
          className={cn(
            "border-box pointer-events-none relative h-full w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[#0b0c0f] transition-all duration-500 ease-slow group-hover/tilt:transform-none!",
            pressed && "transform-none!",
          )}
          style={{
            transform: `perspective(400px) rotateY(${factor * 20}deg) scale(0.85) translateX(${-factor * 20}%)`,
          }}
        >
          {children}
          <div
            className={cn(
              "absolute inset-0 h-full w-full bg-black/20 transition-all group-hover/tilt:bg-transparent",
              pressed && "bg-transparent",
            )}
          />
        </div>

        {/* Cover Content */}
        <div
          className={cn(
            "border-box pointer-events-none absolute inset-0 h-full w-full rounded-xl border-[6px] border-white/10 bg-[#15161b] shadow-[0_18px_50px_rgba(0,0,0,0.42)] transition-all delay-75 duration-500 ease-slow group-hover/tilt:transform-none! group-hover/tilt:opacity-0",
            pressed && "transform-none! opacity-0",
            // The cover is over-constrained (inset-0 + fixed width), so the
            // browser honours `left` in LTR but `right` in RTL — animate both
            // sides together or the slide silently no-ops in Arabic.
            {
              "group-hover/tilt:left-[200%] group-hover/tilt:right-[-200%]": tiltLeft,
              "group-hover/tilt:left-[-200%] group-hover/tilt:right-[200%]": !tiltLeft,
              "left-[200%] right-[-200%]": pressed && tiltLeft,
              "left-[-200%] right-[200%]": pressed && !tiltLeft,
            },
          )}
          style={{
            transform: tiltCover ? `perspective(400px) rotateY(${factor * 20}deg)` : undefined,
          }}
        >
          <div className="h-full w-full rounded-md object-cover">
            {image ? (
              /* Static export: next/image doesn't apply basePath to unoptimized images. */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src=""
                alt=""
                {...image}
                className={cn("h-full w-full rounded-md object-cover", image?.className)}
              />
            ) : (
              cover
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
