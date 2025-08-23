import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  type?: 'leaves' | 'water' | 'dust' | 'fireflies';
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 50,
  type = 'leaves'
}) => {
  const mesh = useRef<THREE.Points | null>(null);
  const particles = useRef<Float32Array | null>(null);
  const velocities = useRef<Float32Array | null>(null);

  // Generate particle positions and velocities
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Velocity based on particle type
      switch (type) {
        case 'leaves':
          vels[i3] = (Math.random() - 0.5) * 0.02;
          vels[i3 + 1] = -Math.random() * 0.01;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.02;
          break;
        case 'water':
          vels[i3] = (Math.random() - 0.5) * 0.01;
          vels[i3 + 1] = -Math.random() * 0.03;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.01;
          break;
        case 'dust':
          vels[i3] = (Math.random() - 0.5) * 0.005;
          vels[i3 + 1] = Math.random() * 0.01;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.005;
          break;
        case 'fireflies':
          vels[i3] = (Math.random() - 0.5) * 0.01;
          vels[i3 + 1] = (Math.random() - 0.5) * 0.01;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.01;
          break;
      }

      // Color based on type
      let r, g, b;
      switch (type) {
        case 'leaves':
          r = 0.2 + Math.random() * 0.3;
          g = 0.6 + Math.random() * 0.3;
          b = 0.1 + Math.random() * 0.2;
          break;
        case 'water':
          r = 0.6 + Math.random() * 0.4;
          g = 0.8 + Math.random() * 0.2;
          b = 1.0;
          break;
        case 'dust':
          r = 0.8 + Math.random() * 0.2;
          g = 0.7 + Math.random() * 0.2;
          b = 0.5 + Math.random() * 0.3;
          break;
        case 'fireflies':
          r = 1.0;
          g = 0.8 + Math.random() * 0.2;
          b = 0.2 + Math.random() * 0.3;
          break;
        default:
          r = g = b = 1;
      }

      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
    }

  particles.current = positions;
  velocities.current = vels;

    return { positions, colors };
  }, [count, type]);

  // Animate particles
  useFrame((state) => {
    if (!mesh.current || !particles.current || !velocities.current) return;

    const posAttr = mesh.current.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!posAttr || !posAttr.array) return;
    const positions = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update positions
      positions[i3] += velocities.current[i3];
      positions[i3 + 1] += velocities.current[i3 + 1];
      positions[i3 + 2] += velocities.current[i3 + 2];

      // Add some wave motion for organic feel
      positions[i3] += Math.sin(time * 0.5 + i * 0.1) * 0.001;
      positions[i3 + 2] += Math.cos(time * 0.3 + i * 0.1) * 0.001;

      // Reset particles that go out of bounds
      if (positions[i3 + 1] < -5) {
        positions[i3 + 1] = 10;
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
      }

      if (Math.abs(positions[i3]) > 10) {
        positions[i3] = (Math.random() - 0.5) * 20;
      }

      if (Math.abs(positions[i3 + 2]) > 10) {
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
      }
    }

  posAttr.needsUpdate = true;
  });

  const getPointSize = () => {
    switch (type) {
      case 'leaves': return 3;
      case 'water': return 2;
      case 'dust': return 1;
      case 'fireflies': return 4;
      default: return 2;
    }
  };

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={getPointSize()}
        vertexColors
        transparent
        opacity={type === 'fireflies' ? 0.8 : 0.6}
        sizeAttenuation
      />
    </points>
  );
};