import React from 'react';
import { RotatingCompass } from '../../components/3d/RotatingCompass';
import { ParticleSystem } from '../../components/3d/ParticleSystem';

export interface SceneConfig {
  id: string;
  type: 'hero' | 'trip-hero' | 'payment' | 'dashboard';
  props?: Record<string, unknown>;
}

export const ScenePortal: React.FC<{ scene: SceneConfig; degraded: boolean }> = ({ scene, degraded }) => {
  switch (scene.type) {
    case 'trip-hero':
      return (
        <group position={[0,0,0]}>
          <RotatingCompass />
          {!degraded && <ParticleSystem type="fireflies" count={80} />}
        </group>
      );
    case 'payment':
      return (
        <group position={[0,0,0]}>
          {/* Placeholder coin: will refine later */}
          <mesh rotation={[Math.PI/2,0,0]}>
            <cylinderGeometry args={[0.6,0.6,0.08,48]} />
            <meshStandardMaterial color="#f9d648" emissive="#b89616" emissiveIntensity={0.3} />
          </mesh>
          {!degraded && <ParticleSystem type="dust" count={40} />}
        </group>
      );
    case 'dashboard':
      return (
        <group>
          {!degraded && <ParticleSystem type="dust" count={60} />}
        </group>
      );
    case 'hero':
    default:
      return (
        <group>
          <RotatingCompass />
          {!degraded && <ParticleSystem type="leaves" count={60} />}
        </group>
      );
  }
};
