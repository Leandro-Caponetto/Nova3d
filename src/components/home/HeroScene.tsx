import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function StylizedSatellite({ theme }: { theme: 'dark' | 'light' }) {
  const groupRef = useRef<THREE.Group>(null);
  const solarPanelRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  const color =
    theme === 'dark'
      ? '#f59e0b'
      : '#d97706';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      const radius = isMobile ? 3.5 : 6;

      groupRef.current.position.x =
        Math.cos(t * 0.4) * radius;

      groupRef.current.position.z =
        Math.sin(t * 0.4) * radius;

      groupRef.current.position.y =
        Math.sin(t * 0.2) * (isMobile ? 1 : 2);

      groupRef.current.rotation.y =
        -t * 0.4;

      groupRef.current.rotation.x =
        Math.sin(t * 0.5) * 0.2;
    }

    if (solarPanelRef.current) {
      solarPanelRef.current.rotation.z =
        Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={isMobile ? 0.3 : 0.5}>
      {/* MAIN BODY SEGMENTS - Multi-part cylinder based on image */}
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Main large cylinder */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.45, 1.2, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* Top white section */}
        <mesh position={[0.8, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.4, 32]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.2} />
        </mesh>

        {/* Bottom narrower section */}
        <mesh position={[-0.8, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.1} />
        </mesh>

        {/* Mid collar */}
        <mesh position={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.1, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* SOLAR PANELS - Rectangular with blue grid pattern */}
      <group ref={solarPanelRef}>
        <group position={[2.5, 0, 0]}>
          <mesh>
            <boxGeometry args={[3, 1, 0.05]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1e40af" 
              emissiveIntensity={0.4} 
              metalness={0.9} 
              roughness={0.1} 
            />
          </mesh>
          {/* Panel Grid Lines */}
          {[1, 2].map((i) => (
            <mesh key={`h-${i}`} position={[i - 1.5, 0, 0.03]}>
              <boxGeometry args={[0.02, 1, 0.01]} />
              <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[3, 0.02, 0.01]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
          </mesh>
        </group>

        <group position={[-2.5, 0, 0]}>
          <mesh>
            <boxGeometry args={[3, 1, 0.05]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1e40af" 
              emissiveIntensity={0.4} 
              metalness={0.9} 
              roughness={0.1} 
            />
          </mesh>
          {/* Panel Grid Lines */}
          {[1, 2].map((i) => (
            <mesh key={`h-neg-${i}`} position={[i - 1.5, 0, 0.03]}>
              <boxGeometry args={[0.02, 1, 0.01]} />
              <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[3, 0.02, 0.01]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
          </mesh>
        </group>
      </group>

      {/* MAIN TOP DISH - White large disk */}
      <group position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 32]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>

      {/* SIDE SMALL DISHES */}
      <group position={[0.6, -0.2, 0.4]} rotation={[0, Math.PI/4, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* SIGNAL BEACON */}
      <mesh position={[0, 0.4, 0.7]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
        />
      </mesh>
    </group>
  );
}

function RotatingPlanet({
  theme
}: {
  theme: 'dark' | 'light'
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  // Cargar textura de la Tierra
  const earthTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

  const color =
    theme === 'dark'
      ? '#f59e0b'
      : '#d97706';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y =
        t * 0.1;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y =
        t * 0.13;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.2;
    }
  });

  const planetScale = isMobile ? 0.8 : 1;
  const orbitRadius = isMobile ? 2.2 : 3.2;

  return (
    <group scale={planetScale}>
      <Float
        speed={1.5}
        rotationIntensity={0.1}
        floatIntensity={0.3}
      >
        {/* TECH RING WITH MOON */}
        <group ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <mesh>
            <torusGeometry
              args={[orbitRadius, 0.01, 16, 100]}
            />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2}
              transparent
              opacity={0.2}
            />
          </mesh>

          {/* Little Moon with Subtle Glow */}
          <group position={[orbitRadius, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.08, 32, 32]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={2}
              />
            </mesh>
            {/* Soft Glow Halo */}
            <mesh scale={2.5}>
              <sphereGeometry args={[0.08, 32, 32]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.15} 
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <pointLight intensity={0.3} distance={1} color="#ffffff" />
          </group>
        </group>

        {/* PLANET */}
        <mesh ref={meshRef}>
          <sphereGeometry
            args={[1.5, 64, 64]}
          />
          <meshStandardMaterial
            map={earthTexture}
            metalness={0.4}
            roughness={0.6}
            emissive={theme === 'dark' ? '#0ea5e9' : '#000'}
            emissiveIntensity={theme === 'dark' ? 0.2 : 0}
          />
        </mesh>

        {/* CLOUDS */}
        <mesh
          ref={cloudsRef}
          scale={1.03}
        >
          <sphereGeometry
            args={[1.5, 64, 64]}
          />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>

        {/* GLOW */}
        <mesh scale={1.1}>
          <sphereGeometry
            args={[1.5, 64, 64]}
          />
          <meshStandardMaterial
            color={
              theme === 'dark'
                ? '#0ea5e9'
                : '#60a5fa'
            }
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

export function HeroScene({
  theme
}: {
  theme: 'dark' | 'light'
}) {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none opacity-60 overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 8], fov: 45 }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 8]}
        />

        <ambientLight intensity={0.8} />

        <pointLight
          position={[10, 10, 10]}
          intensity={2}
          color="#f59e0b"
        />

        <spotLight
          position={[-10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
        />

        <Suspense fallback={null}>
          <RotatingPlanet theme={theme} />
          <StylizedSatellite theme={theme} />
        </Suspense>

        <fog
          attach="fog"
          args={[
            theme === 'dark'
              ? '#000'
              : '#fff',
            5,
            15
          ]}
        />
      </Canvas>
    </div>
  );
}