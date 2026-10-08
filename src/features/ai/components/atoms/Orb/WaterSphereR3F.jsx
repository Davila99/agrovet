import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './WaterSphereR3F.css';

function WaterSphereMesh({ textureUrl, normalUrl, displacementUrl }){
  const mesh = useRef();
  const materialRef = useRef();

  const [map, normalMap, displacementMap] = useLoader(THREE.TextureLoader, [
    textureUrl,
    normalUrl,
    displacementUrl,
  ]);

  // Set reasonable wrap/repeat to avoid seams
  [map, normalMap, displacementMap].forEach(t=>{ if(!t) return; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2,2); });

  useFrame(({clock}) => {
    const t = clock.getElapsedTime();
    if(!materialRef.current) return;
    // animate offsets for flowing look
    if(normalMap) normalMap.offset.y = (t * 0.02) % 1.0;
    if(displacementMap) displacementMap.offset.x = Math.sin(t*0.25)*0.03;
    // subtle global pulsation of displacement scale
    materialRef.current.displacementScale = 0.06 + Math.sin(t*0.9)*0.015;
    // tiny rotation for parallax
    if(mesh.current) mesh.current.rotation.y = Math.sin(t*0.08)*0.05;
  });

  return (
    <mesh ref={mesh} position={[0,0,0]}>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial
        ref={materialRef}
        color={new THREE.Color('#00c1d5')}
        metalness={0.8}
        roughness={0.18}
        emissive={new THREE.Color('#00333a')}
        emissiveIntensity={0.08}
        map={map}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1.05,1.05)}
        displacementMap={displacementMap}
        displacementScale={0.06}
        envMapIntensity={0.9}
        reflectivity={0.9}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

export default function WaterSphereR3F({ textureUrl='/textures/water-texture.jpg', normalUrl='/textures/water-normal-map.jpg', displacementUrl='/textures/water-displacement.jpg' }){
  return (
    <div className="r3f-wrapper">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight intensity={0.6} position={[5,5,5]} />
        <Suspense fallback={null}>
          <WaterSphereMesh textureUrl={textureUrl} normalUrl={normalUrl} displacementUrl={displacementUrl} />
          <Environment preset="dawn" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} autoRotate={false} />
      </Canvas>
    </div>
  );
}
