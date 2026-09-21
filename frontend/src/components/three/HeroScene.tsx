import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function usePrefersReducedMotion() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setV(mq.matches);
    const h = (e: MediaQueryListEvent) => setV(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return v;
}

function checkWebGL() {
  try {
    return !!(document.createElement('canvas').getContext('webgl'));
  } catch { return false; }
}

// Elegant floating orbs
function ElegantOrb({ position, size = 0.08, speed = 0.5 }: { position: [number, number, number]; size?: number; speed?: number }) {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current || prefersReduced) return;
    const t = s.clock.elapsedTime * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.15;
    ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.08;
  });

  if (prefersReduced) return null;

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#D5A526"
        metalness={0.95}
        roughness={0.05}
        emissive="#D5A526"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Sparkle particles
function Sparkles({ count = 40 }: { count?: number }) {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = Math.random() * -2 - 0.5;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (!ref.current || prefersReduced) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.015;
  });

  if (prefersReduced) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#D5A526"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Golden dust
function GoldenDust({ count = 50 }: { count?: number }) {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.random() * -2 - 0.5;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (!ref.current || prefersReduced) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.01;
  });

  if (prefersReduced) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#D5A526"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-4, 2, 1]} intensity={0.25} color="#D5A526" />
      <pointLight position={[3, -1, 2]} intensity={0.2} color="#D5A526" />

      <Sparkles count={35} />
      <GoldenDust count={45} />

      <ElegantOrb position={[-3, 1, -1.5]} size={0.1} speed={0.6} />
      <ElegantOrb position={[3.5, 0.5, -2]} size={0.12} speed={0.8} />
      <ElegantOrb position={[1.5, 2, -1]} size={0.08} speed={0.5} />
      <ElegantOrb position={[-2.5, -0.5, -1.8]} size={0.09} speed={0.7} />
      <ElegantOrb position={[2.5, -1.2, -1.2]} size={0.07} speed={0.9} />
      <ElegantOrb position={[-1, 2.2, -2]} size={0.06} speed={0.55} />
      <ElegantOrb position={[0.5, -1.8, -1.5]} size={0.08} speed={0.65} />
      <ElegantOrb position={[-3.5, -1.5, -2.5]} size={0.11} speed={0.75} />
      <ElegantOrb position={[3, 1.8, -2.2]} size={0.07} speed={0.85} />
      <ElegantOrb position={[0, 0, -1]} size={0.13} speed={0.45} />
    </>
  );
}

function Fallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-cream-100 to-maroon-50" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gold-200/30 to-transparent blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-maroon-100/20 to-transparent blur-[80px]" />
    </div>
  );
}

export function HeroScene() {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setReady(true);
    setWebgl(checkWebGL());
  }, []);

  if (!ready || !webgl) return <Fallback />;

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

export default HeroScene;
