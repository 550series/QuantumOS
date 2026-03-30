'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

const MossEyeCore: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  // 创建圆形几何体
  const circleGeometry = useMemo(() => new THREE.RingGeometry(0.8, 1, 64), []);
  const innerCircleGeometry = useMemo(() => new THREE.RingGeometry(0.3, 0.5, 64), []);
  const coreGeometry = useMemo(() => new THREE.CircleGeometry(0.25, 32), []);

  // 动画
  useFrame((state) => {
    if (meshRef.current) {
      // 脉动效果
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, 1);
    }
    if (ringRef.current) {
      // 旋转外环
      ringRef.current.rotation.z += 0.01;
    }
    if (innerRingRef.current) {
      // 反向旋转内环
      innerRingRef.current.rotation.z -= 0.015;
    }
  });

  return (
    <group>
      {/* 外圈 */}
      <mesh ref={ringRef} geometry={circleGeometry}>
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 内圈 */}
      <mesh ref={innerRingRef} geometry={innerCircleGeometry}>
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 核心 */}
      <mesh ref={meshRef} geometry={coreGeometry}>
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={1}
        />
      </mesh>

      {/* 扫描线 */}
      <Line
        points={[[-1.2, 0, 0], [1.2, 0, 0]]}
        color="#00F0FF"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      <Line
        points={[[0, -1.2, 0], [0, 1.2, 0]]}
        color="#00F0FF"
        lineWidth={1}
        transparent
        opacity={0.3}
      />

      {/* 外围装饰环 */}
      <Line
        points={Array.from({ length: 65 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return [Math.cos(angle) * 1.3, Math.sin(angle) * 1.3, 0];
        })}
        color="#00F0FF"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
    </group>
  );
};

export const MossEye: React.FC = () => {
  return (
    <div className="w-64 h-64">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <MossEyeCore />
        <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
      </Canvas>
    </div>
  );
};
