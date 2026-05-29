'use client';

import {
  Component,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { Color, Mesh, ShaderMaterial } from 'three';
import type { IUniform } from 'three';

import { cn } from '@/lib/utils';

type NormalizedRGB = [number, number, number];

const normalizeHex = (hex: string) => {
  const clean = hex.replace('#', '').trim();
  if (/^[0-9a-f]{3}$/i.test(clean)) {
    return clean
      .split('')
      .map((value) => value + value)
      .join('');
  }
  if (/^[0-9a-f]{6}$/i.test(clean)) return clean;
  return '7b7481';
};

const hexToRgb = (hex: string) => {
  const clean = normalizeHex(hex);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return { r, g, b };
};

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const { r, g, b } = hexToRgb(hex);
  return [r, g, b];
};

const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255,
  )}, ${alpha})`;
};

const supportsWebGL = () => {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(context);
  } catch {
    return false;
  }
};

interface UniformValue<T = number | Color> {
  value: T;
}

interface SilkUniforms {
  uSpeed: UniformValue<number>;
  uScale: UniformValue<number>;
  uNoiseIntensity: UniformValue<number>;
  uColor: UniformValue<Color>;
  uRotation: UniformValue<number>;
  uTime: UniformValue<number>;
  [uniform: string]: IUniform;
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
}

const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    const mesh = ref as MutableRefObject<Mesh | null>;
    if (mesh.current) {
      mesh.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_state: RootState, delta: number) => {
    const mesh = ref as MutableRefObject<Mesh | null>;
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial & {
        uniforms: SilkUniforms;
      };
      material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = 'SilkPlane';

function WebGLContextGuard({ onContextLost }: { onContextLost: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [gl, onContextLost]);

  return null;
}

type SilkErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type SilkErrorBoundaryState = {
  hasError: boolean;
};

class SilkErrorBoundary extends Component<SilkErrorBoundaryProps, SilkErrorBoundaryState> {
  state: SilkErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  className?: string;
}

const Silk: React.FC<SilkProps> = ({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
  className,
}) => {
  const meshRef = useRef<Mesh>(null);
  const [canRenderCanvas, setCanRenderCanvas] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCanRenderCanvas(supportsWebGL());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleCanvasError = useCallback(() => {
    setCanRenderCanvas(false);
  }, []);

  const uniforms = useMemo<SilkUniforms>(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 },
    }),
    [speed, scale, noiseIntensity, color, rotation],
  );

  const fallbackStyle = useMemo<CSSProperties>(
    () => ({
      background: `
        radial-gradient(75% 55% at 50% -8%, rgba(214, 236, 27, 0.22), transparent 64%),
        radial-gradient(60% 45% at 18% 22%, ${hexToRgba(color, 0.32)}, transparent 64%),
        radial-gradient(70% 50% at 82% 8%, rgba(214, 236, 27, 0.1), transparent 62%),
        linear-gradient(130deg, ${hexToRgba(color, 0.88)} 0%, #11180d 42%, #0a0b0d 78%),
        repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 18px)
      `,
      backgroundBlendMode: 'screen, screen, screen, normal, soft-light',
    }),
    [color],
  );

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#0a0b0d]', className)}>
      <div aria-hidden className="absolute inset-0" style={fallbackStyle} />
      {canRenderCanvas ? (
        <SilkErrorBoundary onError={handleCanvasError}>
          <Canvas
            className="!absolute inset-0 !h-full !w-full"
            dpr={[1, 2]}
            frameloop="always"
            gl={{ antialias: false, failIfMajorPerformanceCaveat: false, powerPreference: 'low-power' }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <WebGLContextGuard onContextLost={handleCanvasError} />
            <SilkPlane ref={meshRef} uniforms={uniforms} />
          </Canvas>
        </SilkErrorBoundary>
      ) : null}
    </div>
  );
};

export default Silk;
