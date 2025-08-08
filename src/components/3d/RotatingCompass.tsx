import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const RotatingCompass: React.FC = () => {
  const compassRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (compassRef.current) {
      compassRef.current.rotation.y += 0.005;
    }
    if (needleRef.current) {
      needleRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={compassRef} position={[0, 0, 0]}>
      {/* Compass Base */}
      <mesh>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshPhongMaterial color="#8B4513" />
      </mesh>

      {/* Compass Face */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.02, 32]} />
        <meshPhongMaterial color="#F4F3EE" />
      </mesh>

      {/* Direction Markers */}
      {['N', 'E', 'S', 'W'].map((direction, index) => {
        const angle = (index * Math.PI) / 2;
        const x = Math.sin(angle) * 1.5;
        const z = Math.cos(angle) * 1.5;
        
        return (
          <Text
            key={direction}
            position={[x, 0.15, z]}
            fontSize={0.3}
            color="#1B4332"
            anchorX="center"
            anchorY="middle"
            font="/fonts/oswald-bold.woff"
          >
            {direction}
          </Text>
        );
      })}

      {/* Compass Needle */}
      <group ref={needleRef}>
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.1, 1.5, 4]} />
          <meshPhongMaterial color="#FF6B35" />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.5, 4]} />
          <meshPhongMaterial color="#1B4332" />
        </mesh>
      </group>

      {/* Center Pin */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhongMaterial color="#264653" />
      </mesh>
    </group>
  );
};