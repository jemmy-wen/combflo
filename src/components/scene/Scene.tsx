import { Suspense } from 'react';
import { Environment, Lightformer } from '@react-three/drei';
import Exterior from './Exterior';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, N8AO, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Atmosphere from './Atmosphere';
import Shell from './Shell';
import Details from './Details';
import Zones from './Zones';
import People from './People';
import Pins from './Pins';
import FlowLines from './FlowLines';
import CameraRig, { HOME } from './CameraRig';

const isMobile = typeof window !== 'undefined' && (window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches);

export default function Scene() {
  return (
    <Canvas
      shadows={isMobile ? true : 'soft'}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [...HOME.pos], fov: 30, near: 0.5, far: 500 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.92, outputColorSpace: THREE.SRGBColorSpace }}
    >
      <Suspense fallback={null}>
        <Atmosphere />
        <Shell />
        <Details />
        <Exterior />
        <Environment resolution={256} frames={1} environmentIntensity={0.4}>
          <Lightformer intensity={2} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
          <Lightformer intensity={1.2} color="#fff2dc" position={[-20, 6, 10]} rotation-y={Math.PI / 2} scale={[30, 8, 1]} />
          <Lightformer intensity={0.8} color="#dfeaff" position={[20, 6, -10]} rotation-y={-Math.PI / 2} scale={[30, 8, 1]} />
        </Environment>
        <Zones />
        <People />
        <FlowLines />
        <Pins />
        <CameraRig />
        {!isMobile && <EffectComposer multisampling={4}>
          <N8AO halfRes aoRadius={1.2} intensity={1.6} distanceFalloff={0.8} />
          <Bloom intensity={0.5} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette offset={0.3} darkness={0.35} />
        </EffectComposer>}
      </Suspense>
    </Canvas>
  );
}
