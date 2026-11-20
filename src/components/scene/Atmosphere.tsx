// 光線、天空、霧氣：依「優化前／後」與「白天／黃昏」漸變
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { blendables } from './kit';
import { live, useApp } from '../../lib/store';

const col = (h: string) => new THREE.Color(h);
const SKY = {
  beforeDay: col('#2c3238'), afterDay: col('#c6d8df'),
  beforeDusk: col('#3b2c2a'), afterDusk: col('#f4d2b5'),
};
const SUN = {
  beforeDay: col('#9fb0bf'), afterDay: col('#fff6e8'),
  beforeDusk: col('#b97a52'), afterDusk: col('#ffc48a'),
};
const AMB = { before: col('#7f8da0'), after: col('#ffffff') };

export default function Atmosphere() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();
  const tmp = new THREE.Color();
  const tmp2 = new THREE.Color();

  useFrame((_, dt) => {
    const s = useApp.getState();
    if (!s.paused) live.time += dt;
    // 平滑過渡
    const tb = s.mode === 'after' ? 1 : 0;
    const td = s.time === 'dusk' ? 1 : 0;
    live.blend += (tb - live.blend) * Math.min(1, dt * 1.6);
    live.dusk += (td - live.dusk) * Math.min(1, dt * 1.6);
    const b = live.blend, d = live.dusk;

    // 天空與霧
    tmp.copy(SKY.beforeDay).lerp(SKY.beforeDusk, d);
    tmp2.copy(SKY.afterDay).lerp(SKY.afterDusk, d);
    tmp.lerp(tmp2, b);
    if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color();
    (scene.background as THREE.Color).copy(tmp);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(tmp);
      scene.fog.near = THREE.MathUtils.lerp(90, 130, b);
      scene.fog.far = THREE.MathUtils.lerp(220, 300, b);
    }

    // 太陽
    if (sun.current) {
      tmp.copy(SUN.beforeDay).lerp(SUN.beforeDusk, d);
      tmp2.copy(SUN.afterDay).lerp(SUN.afterDusk, d);
      sun.current.color.copy(tmp.lerp(tmp2, b));
      sun.current.intensity = THREE.MathUtils.lerp(0.42, 1.35, b) * THREE.MathUtils.lerp(1, 0.85, d);
      const ang = THREE.MathUtils.lerp(0.9, 0.35, d);
      sun.current.position.set(Math.cos(ang) * 40 - 10, Math.sin(ang) * 55 + 8, 30);
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(0.18, 0.5, b);
    if (amb.current) {
      amb.current.color.copy(AMB.before).lerp(AMB.after, b);
      amb.current.intensity = THREE.MathUtils.lerp(0.16, 0.22, b);
    }
    // 優化前：紅色警示光一閃一閃

    scene.environmentIntensity = THREE.MathUtils.lerp(0.18, 0.4, b);
    // 隨模式變色的材質（地板、牆）
    for (const x of blendables) x.m.color.copy(x.before).lerp(x.after, b);
  });

  return (
    <>
      <fog attach="fog" args={['#3a4046', 55, 150]} />
      <ambientLight ref={amb} intensity={0.4} />
      <hemisphereLight ref={hemi} args={['#ffffff', '#8a8578', 0.6]} />
      <directionalLight
        ref={sun} position={[25, 45, 30]} intensity={1.5} castShadow
        shadow-mapSize={typeof window !== 'undefined' && window.innerWidth < 900 ? [1024, 1024] : [2048, 2048]} shadow-bias={-0.0003} shadow-normalBias={0.035} shadow-radius={6}
        shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={220}
      />
    </>
  );
}
