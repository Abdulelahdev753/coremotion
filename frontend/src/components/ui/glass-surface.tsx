'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type Channel = 'R' | 'G' | 'B';

export interface GlassSurfaceProps {
  children?: ReactNode;
  /** Width of the surface. Numbers are treated as pixels. Defaults to 100%. */
  width?: number | string;
  /** Height of the surface. Numbers are treated as pixels. */
  height?: number | string;
  borderRadius?: number;
  /** Thickness (0–1 of the smaller side) of the refractive border ring. */
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  /** Backdrop blur radius in px (also the frosted fallback strength). */
  blur?: number;
  /** Post-displacement gaussian blur. */
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: Channel;
  yChannel?: Channel;
  className?: string;
  style?: CSSProperties;
}

/**
 * GlassSurface — a frosted "liquid glass" container in the style of React Bits.
 *
 * Chromium browsers that support SVG filters in `backdrop-filter` get true edge
 * refraction (chromatic aberration via per-channel displacement maps). Every
 * other browser falls back to a reliable `blur()` frost, so the surface always
 * reads as premium glass.
 */
const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(function GlassSurface(
  {
    children,
    width = '100%',
    height = 64,
    borderRadius = 20,
    borderWidth = 0.07,
    brightness = 60,
    opacity = 0.9,
    blur = 12,
    displace = 0.4,
    backgroundOpacity = 0.06,
    saturation = 1.6,
    distortionScale = -120,
    redOffset = 0,
    greenOffset = 8,
    blueOffset = 16,
    xChannel = 'R',
    yChannel = 'G',
    className,
    style,
  },
  ref,
) {
  const rawId = useId().replace(/[:]/g, '');
  const filterId = `glass-${rawId}`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const [size, setSize] = useState({ width: 360, height: 64 });
  const [svgMode, setSvgMode] = useState(false);

  // Track the rendered size so the displacement map matches the element.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        setSize({
          width: Math.max(1, Math.round(rect.width)),
          height: Math.max(1, Math.round(rect.height)),
        });
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Feature-detect SVG-in-backdrop-filter support (Chromium only; Firefox/Safari
  // get the blur fallback). Runs after mount to avoid SSR/hydration mismatch.
  useEffect(() => {
    const isFirefox =
      typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
    const probe = document.createElement('div');
    probe.style.backdropFilter = `url(#${filterId})`;
    const supported =
      !isFirefox &&
      (probe.style.backdropFilter !== '' ||
        (typeof CSS !== 'undefined' &&
          CSS.supports?.('backdrop-filter', `url(#${filterId})`)));
    setSvgMode(Boolean(supported));
  }, [filterId]);

  const displacementMap = useMemo(() => {
    const { width: w, height: h } = size;
    const edge = Math.max(2, Math.min(w, h) * borderWidth);
    const innerR = Math.max(0, borderRadius - edge);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="x" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="#f00"/>
    </linearGradient>
    <linearGradient id="y" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="#00f"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#808080"/>
  <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#x)"/>
  <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#y)" style="mix-blend-mode:screen"/>
  <rect x="${edge}" y="${edge}" width="${Math.max(0, w - edge * 2)}" height="${Math.max(
    0,
    h - edge * 2,
  )}" rx="${innerR}" fill="#808080" style="filter:blur(${Math.max(1, edge / 2)}px)"/>
</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [size, borderRadius, borderWidth]);

  const blurFrost = `blur(${blur}px) saturate(${saturation}) brightness(${
    1 + (brightness - 50) / 200
  })`;
  const backdrop = svgMode ? `blur(${blur * 0.4}px) url(#${filterId}) saturate(${saturation})` : blurFrost;

  const containerStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius,
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    background: `linear-gradient(135deg, rgba(255,255,255,${
      backgroundOpacity + 0.04
    }), rgba(255,255,255,${Math.max(0, backgroundOpacity - 0.03)}))`,
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: `0 10px 30px rgba(0,0,0,${0.35 * opacity}), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.10)`,
    ...style,
  };

  return (
    <div
      ref={setRefs}
      className={cn(
        'relative flex items-center justify-center overflow-hidden isolate',
        'transition-[backdrop-filter,background] duration-300 ease-out',
        className,
      )}
      style={containerStyle}
    >
      <svg aria-hidden className="absolute h-0 w-0" focusable="false">
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={displacementMap}
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="map"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={distortionScale + redOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="dR"
            />
            <feColorMatrix
              in="dR"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="R"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={distortionScale + greenOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="dG"
            />
            <feColorMatrix
              in="dG"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="G"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={distortionScale + blueOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="dB"
            />
            <feColorMatrix
              in="dB"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="B"
            />
            <feBlend in="R" in2="G" mode="screen" result="RG" />
            <feBlend in="RG" in2="B" mode="screen" result="RGB" />
            <feGaussianBlur in="RGB" stdDeviation={displace} />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
});

export default GlassSurface;
