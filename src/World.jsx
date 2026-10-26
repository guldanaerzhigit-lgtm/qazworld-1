import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

function Tree({ position, scale = 1 }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.65, 0]} castShadow><cylinderGeometry args={[0.12, 0.18, 1.3, 8]} /><meshStandardMaterial color="#79513b" /></mesh>
    <mesh position={[0, 1.55, 0]} castShadow><coneGeometry args={[0.72, 1.45, 8]} /><meshStandardMaterial color="#3b9b72" roughness={0.9} /></mesh>
    <mesh position={[0, 2.1, 0]} castShadow><coneGeometry args={[0.48, 1.05, 8]} /><meshStandardMaterial color="#53b887" roughness={0.9} /></mesh>
  </group>;
}

function Building({ position, color, height = 2.8, width = 1.8 }) {
  return <group position={position}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, 1.55]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {Array.from({ length: 3 }).map((_, row) => Array.from({ length: 2 }).map((__, col) =>
      <mesh key={row + '-' + col} position={[(col - 0.5) * width * 0.53, 0.65 + row * 0.68, 0.79]}>
        <planeGeometry args={[0.34, 0.38]} />
        <meshStandardMaterial color="#bde9ed" emissive="#4e8b9a" emissiveIntensity={0.22} />
      </mesh>
    ))}
    <mesh position={[0, height + 0.08, 0]} castShadow>
      <coneGeometry args={[width * 0.72, 0.55, 4]} rotation={[0, Math.PI / 4, 0]} />
      <meshStandardMaterial color="#d99c64" roughness={0.8} />
    </mesh>
  </group>;
}

function Avatar({ position, outfit, onMove }) {
  const group = useRef();
  const [moving, setMoving] = useState(false);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.position.y = 0.04 + Math.sin(state.clock.elapsedTime * (moving ? 12 : 2.2)) * (moving ? 0.055 : 0.018);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, moving ? 0.2 : 0, 5, delta);
    }
  });
  return <group ref={group} position={position} onPointerOver={() => setMoving(true)} onPointerOut={() => setMoving(false)} onClick={onMove}>
    <Float speed={1.5} rotationIntensity={0.04} floatIntensity={0.12}>
      <mesh position={[0, 1.32, 0]} castShadow><sphereGeometry args={[0.34, 24, 24]} /><meshStandardMaterial color="#d99a72" roughness={0.7} /></mesh>
      <mesh position={[0, 1.72, -0.02]} castShadow><sphereGeometry args={[0.35, 20, 16]} /><meshStandardMaterial color="#392a2b" roughness={0.95} /></mesh>
      <mesh position={[0, 0.72, 0]} castShadow><capsuleGeometry args={[0.31, 0.56, 5, 12]} /><meshStandardMaterial color={outfit} roughness={0.72} /></mesh>
      <mesh position={[-0.16, 0.2, 0.02]} castShadow><capsuleGeometry args={[0.12, 0.35, 4, 8]} /><meshStandardMaterial color="#263343" /></mesh>
      <mesh position={[0.16, 0.2, 0.02]} castShadow><capsuleGeometry args={[0.12, 0.35, 4, 8]} /><meshStandardMaterial color="#263343" /></mesh>
      <mesh position={[-0.36, 0.76, 0]} rotation={[0, 0, -0.2]} castShadow><capsuleGeometry args={[0.09, 0.42, 4, 8]} /><meshStandardMaterial color="#d99a72" /></mesh>
      <mesh position={[0.36, 0.76, 0]} rotation={[0, 0, 0.2]} castShadow><capsuleGeometry args={[0.09, 0.42, 4, 8]} /><meshStandardMaterial color="#d99a72" /></mesh>
      <mesh position={[-0.12, 1.34, 0.29]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#252b35" /></mesh>
      <mesh position={[0.12, 1.34, 0.29]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#252b35" /></mesh>
    </Float>
  </group>;
}

function Scene({ outfit }) {
  const [avatarPos, setAvatarPos] = useState([0, 0, 0.4]);
  const move = (dx, dz) => setAvatarPos(([x, y, z]) => [THREE.MathUtils.clamp(x + dx, -5, 5), y, THREE.MathUtils.clamp(z + dz, -4, 5)]);
  return <>
    <color attach="background" args={['#b7dce8']} />
    <Sky distance={450000} sunPosition={[4, 8, 3]} inclination={0.52} azimuth={0.22} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[6, 10, 5]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <fog attach="fog" args={['#b7dce8', 15, 32]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} /><meshStandardMaterial color="#8fc5a0" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
      <planeGeometry args={[5.4, 25]} /><meshStandardMaterial color="#e9dfc9" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
      <planeGeometry args={[25, 4.2]} /><meshStandardMaterial color="#e9dfc9" roughness={1} />
    </mesh>
    <Building position={[-4.2, 0, -3.5]} color="#f1c28b" height={3.1} width={2} />
    <Building position={[-1.8, 0, -5.2]} color="#e7a6a1" height={2.5} width={1.65} />
    <Building position={[3.8, 0, -3.7]} color="#f1d99c" height={3.6} width={2.1} />
    <Building position={[5.6, 0, -1.8]} color="#a9c8d9" height={2.5} width={1.6} />
    <Tree position={[-5.2, 0, 1.1]} scale={1.1} /><Tree position={[-4.6, 0, 4]} scale={0.9} />
    <Tree position={[4.7, 0, 3.5]} scale={1.05} /><Tree position={[6, 0, 1]} scale={0.8} />
    <group position={[0, 0, -1.6]}>
      <mesh position={[0, 0.18, 0]} castShadow><cylinderGeometry args={[1.25, 1.4, 0.36, 32]} /><meshStandardMaterial color="#d8b18b" /></mesh>
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.95, 0.95, 0.08, 32]} /><meshStandardMaterial color="#77b8a3" /></mesh>
      <mesh position={[0, 0.58, 0]}><cylinderGeometry args={[0.08, 0.08, 0.38, 12]} /><meshStandardMaterial color="#e5d4ad" /></mesh>
    </group>
    <Avatar position={avatarPos} outfit={outfit} />
    <ContactShadows position={[0, -0.025, 0]} opacity={0.28} scale={18} blur={2.5} far={7} />
    <OrbitControls makeDefault target={[0, 1, 0]} minDistance={7} maxDistance={16} maxPolarAngle={Math.PI / 2.08} minPolarAngle={0.45} enablePan={false} />
    <group position={[0, 0, 0]} visible={false}><mesh><boxGeometry /></mesh></group>
  </>;
}

export default function World({ outfit = '#7256d8' }) {
  return <Canvas shadows camera={{ position: [8, 7.5, 10], fov: 42 }} dpr={[1, 1.5]}>
    <Scene outfit={outfit} />
  </Canvas>;
}