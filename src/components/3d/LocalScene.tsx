import React from 'react';
const LazyCanvas = React.lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));
import { useFrame } from '@react-three/fiber';
import { ParticleSystem } from './ParticleSystem';
import { RotatingCompass } from './RotatingCompass';

// Lightweight per-page overlay scene
export interface LocalSceneProps {
  variant?: 'compass' | 'dust' | 'fireflies' | 'globe' | 'breathing' | 'coin';
  size?: number;
}

export const LocalScene: React.FC<LocalSceneProps> = ({ variant = 'dust', size = 220 }) => {
  const Scene = () => {
    const groupRef = React.useRef<THREE.Group>(null);
    const meshRef = React.useRef<THREE.Mesh>(null);
    useFrame((state) => {
      if (variant === 'globe' && groupRef.current) {
        groupRef.current.rotation.y += 0.0025;
      } else if (variant === 'breathing' && meshRef.current) {
        const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
        meshRef.current.scale.setScalar(s);
      } else if (variant === 'coin' && meshRef.current) {
        meshRef.current.rotation.y += 0.04;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.25;
      }
    });
    switch (variant) {
      case 'compass':
        return <RotatingCompass />;
      case 'fireflies':
        return <ParticleSystem type="fireflies" count={70} />;
      case 'globe':
        return (
          <group ref={groupRef}>
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="#1d4f91" roughness={0.4} metalness={0.1} />
            </mesh>
            <mesh scale={[1.02,1.02,1.02]}> {/* cloud layer */}
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.05} />
            </mesh>
          </group>
        );
      case 'breathing':
        return (
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#14b8a6" roughness={0.3} metalness={0.6} />
          </mesh>
        );
      case 'coin':
        return (
          <mesh ref={meshRef}>
            <cylinderGeometry args={[1,1,0.18,48]} />
            <meshStandardMaterial color="#f9d648" emissive="#b89616" emissiveIntensity={0.35} metalness={0.85} roughness={0.25} />
          </mesh>
        );
      case 'dust':
      default:
        return <ParticleSystem type="dust" count={120} />;
    }
  };

  return (
    <div className="pointer-events-none absolute" style={{ width: size, height: size }}>
      <React.Suspense fallback={null}>
        <LazyCanvas dpr={[1,1.5]} camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2,3,4]} intensity={0.7} />
          <Scene />
        </LazyCanvas>
      </React.Suspense>
    </div>
  );
};
