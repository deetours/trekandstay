import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
// Add explicit extensions to satisfy bundler/ESM resolution
import { ScenePortal, SceneConfig } from './components/ScenePortal.tsx';
import { useRouteScene } from '../hooks/useRouteScene.ts';

// Lightweight global 3D root; mounted once.
export const ThreeRoot: React.FC = () => {
  const { activeScenes } = useRouteScene();
  const [perf, setPerf] = useState({ fps: 60, degraded: false });

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 2, 6], fov: 55 }}
        onCreated={({ gl }) => { gl.setClearAlpha(0); }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4,8,4]} intensity={0.6} />
        <Suspense fallback={null}>
          {activeScenes.map((s: SceneConfig) => (
            <ScenePortal key={s.id} scene={s} degraded={perf.degraded} />
          ))}
        </Suspense>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <PerformanceMonitor onIncline={() => setPerf(p => ({ ...p, degraded:false }))} onDecline={() => setPerf(p => ({ ...p, degraded:true }))} />
      </Canvas>
    </div>
  );
};
