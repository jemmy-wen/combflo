// 鐵皮屋廠房：水泥地、浪板牆、H 型鋼柱、屋架、天車軌道、窗戶、日光燈
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { B, G, HBeam, blendMat, concreteTexture, corrugatedTexture, mat, C, useOnce } from './kit';
import { live } from '../../lib/store';

const W = 64, D = 40, H = 9;

export default function Shell() {
  const floorMat = useOnce(() => blendMat('#6b6a60', '#b9b6ac', { map: concreteTexture(), rough: 0.95 }));
  const wallMat = useOnce(() => blendMat('#64706a', '#d9e2ea', { map: corrugatedTexture('#e8e8e8', 40), rough: 0.7, metal: 0.15 }));
  const wallMatSide = useOnce(() => blendMat('#5d6862', '#d2dbe4', { map: corrugatedTexture('#e8e8e8', 26), rough: 0.7, metal: 0.15 }));
  const lowWall = useOnce(() => blendMat('#5f655f', '#cfd6dc', { rough: 0.9 }));
  const epoxy = useOnce(() => blendMat('#3f5a47', '#4a8a62', { rough: 0.45 }));
  const tile = useOnce(() => blendMat('#8a8c88', '#b7bbb6', { map: tileTexture(), rough: 0.6 }));
  const block = useOnce(() => blendMat('#6d6a62', '#d8d3c8', { map: blockTexture(), rough: 0.95 }));

  const columnsX = [-24, -12, 0, 12, 24];
  return (
    <group>
      {/* 地面（外圍柏油＋廠房水泥地） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={floorMat}>
        <planeGeometry args={[W, D]} />
      </mesh>
      {/* 綠色 Epoxy 地坪（產線＋品管）與辦公區地磚 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.006, 8]} receiveShadow material={epoxy}><planeGeometry args={[36, 13.4]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, 0.006, -12]} receiveShadow material={tile}><planeGeometry args={[31.6, 11.6]} /></mesh>
      {/* 地基邊 */}
      <B p={[0, 0.06, D / 2 + 0.3]} s={[W + 1.2, 0.12, 0.6]} c="#9a9a92" />
      <B p={[W / 2 + 0.3, 0.06, 0]} s={[0.6, 0.12, D + 1.2]} c="#9a9a92" />

      {/* 後牆、左牆（高）＋前牆、右牆（剖開的矮牆） */}
      <mesh position={[0, H / 2, -D / 2]} castShadow receiveShadow material={wallMat}><boxGeometry args={[W, H, 0.3]} /></mesh>
      <mesh position={[-W / 2, H / 2, 0]} castShadow receiveShadow material={wallMatSide}><boxGeometry args={[0.3, H, D]} /></mesh>
      <mesh position={[0, 0.6, D / 2]} castShadow receiveShadow material={lowWall}><boxGeometry args={[W, 1.2, 0.3]} /></mesh>
      {/* 右牆：碼頭開口之間的矮牆 */}
      {[[-17, 6], [-4, 6], [9, 6], [17, 6]].map(([z, len], i) => (
        <mesh key={i} position={[W / 2, 0.6, z]} castShadow receiveShadow material={lowWall}><boxGeometry args={[0.3, 1.2, len]} /></mesh>
      ))}
      {/* 牆下半段水泥磚 */}
      <mesh position={[0, 1.1, -D / 2 + 0.17]} receiveShadow material={block}><boxGeometry args={[W, 2.2, 0.06]} /></mesh>
      <mesh position={[-W / 2 + 0.17, 1.1, 0]} receiveShadow material={block}><boxGeometry args={[0.06, 2.2, D]} /></mesh>
      {/* 牆腳收邊 */}
      <B p={[0, 0.25, -D / 2 + 0.2]} s={[W, 0.5, 0.15]} c={C.steelDark} />
      <B p={[-W / 2 + 0.2, 0.25, 0]} s={[0.15, 0.5, D]} c={C.steelDark} />

      {/* 後牆高窗 */}
      {[-26, -16, -6, 4, 14, 24].map((x) => (
        <G key={x} p={[x, 6.6, -D / 2 + 0.18]}>
          <B s={[6, 1.6, 0.08]} c="#a7c7dd" m={mat('#bcd7e8', { rough: 0.2, metal: 0.1, emissive: '#cfe6ff', ei: 0.15 })} shadow={false} />
          <B p={[0, 0, 0.05]} s={[6.2, 0.12, 0.1]} c={C.steelDark} />
          <B p={[0, 0.8, 0.05]} s={[6.2, 0.1, 0.1]} c={C.steelDark} />
          <B p={[0, -0.8, 0.05]} s={[6.2, 0.1, 0.1]} c={C.steelDark} />
          {[-2, 0, 2].map((dx) => <B key={dx} p={[dx, 0, 0.05]} s={[0.08, 1.6, 0.1]} c={C.steelDark} />)}
        </G>
      ))}
      {/* 左牆窗 */}
      {[-12, 0, 12].map((z) => (
        <G key={z} p={[-W / 2 + 0.18, 6.6, z]}>
          <B s={[0.08, 1.6, 6]} c="#a7c7dd" m={mat('#bcd7e8', { rough: 0.2, emissive: '#cfe6ff', ei: 0.15 })} shadow={false} />
          <B p={[0.05, 0, 0]} s={[0.1, 0.12, 6.2]} c={C.steelDark} />
        </G>
      ))}

      {/* H 型鋼柱 */}
      {columnsX.map((x) => [-D / 2 + 0.5, -3, D / 2 - 0.5].map((z) => <HBeam key={`${x}${z}`} p={[x, 0, z]} h={H} />))}
      {[-D / 2 + 0.5, -3, D / 2 - 0.5].map((z) => <HBeam key={`L${z}`} p={[-W / 2 + 0.5, 0, z]} h={H} />)}

      {/* 屋架（只留鋼構，方便看見室內） */}
      {[...columnsX, -W / 2 + 0.5].map((x) => <Truss key={x} x={x} />)}
      {/* 縱向繫梁 */}
      {[-D / 2 + 0.5, -3, D / 2 - 0.5].map((z) => <B key={z} p={[0, H - 0.1, z]} s={[W - 1, 0.25, 0.25]} c={C.steel} />)}

      {/* 天車軌道（產線上方）＋天車 */}
      <B p={[-2, 7.2, 1.2]} s={[30, 0.35, 0.35]} c={C.safetyYellow} />
      <B p={[-2, 7.2, 14.8]} s={[30, 0.35, 0.35]} c={C.safetyYellow} />
      <Crane />

      {/* 日光燈 */}
      <Lamps />
    </group>
  );
}

function Truss({ x }: { x: number }) {
  return (
    <G p={[x, 0, 0]}>
      {/* 上弦（兩段斜坡）與下弦 */}
      <B p={[0, H + 1.1, -D / 4]} s={[0.25, 0.25, D / 2 + 0.6]} c={C.steel} r={[0.11, 0, 0]} />
      <B p={[0, H + 1.1, D / 4]} s={[0.25, 0.25, D / 2 + 0.6]} c={C.steel} r={[-0.11, 0, 0]} />
      <B p={[0, H - 0.1, 0]} s={[0.2, 0.2, D]} c={C.steel} />
      {[-15, -10, -5, 0, 5, 10, 15].map((z) => (
        <B key={z} p={[0, H + 0.95 - Math.abs(z) * 0.11, z]} s={[0.12, 2.2 - Math.abs(z) * 0.11, 0.12]} c={C.steel} />
      ))}
    </G>
  );
}

function Crane() {
  const ref = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current || !hook.current) return;
    const b = live.blend;
    // 優化前：卡在一端不動；優化後：沿軌道來回移動
    const t = live.time * 0.25;
    ref.current.position.x = THREE.MathUtils.lerp(-12, -2 + Math.sin(t) * 11, b);
    hook.current.position.y = THREE.MathUtils.lerp(-3.4, -2.2 + Math.sin(t * 2) * 0.6, b);
  });
  return (
    <group ref={ref} position={[-12, 7.4, 8]}>
      <B s={[0.7, 0.6, 14]} c={C.safetyYellow} />
      <B p={[0, 0.5, 0]} s={[0.5, 0.3, 14]} c="#d9a91f" />
      {/* 黑黃警示條 */}
      {[-6, -3, 0, 3, 6].map((z) => <B key={z} p={[0.36, 0, z]} s={[0.02, 0.5, 1]} c="#222222" shadow={false} />)}
      <B p={[0, -0.5, 1]} s={[1.2, 0.6, 1.2]} c="#5b5f63" />
      <group ref={hook} position={[0, -2.6, 1]}>
        <B p={[0, 1.2, 0]} s={[0.05, 2.4, 0.05]} c="#2a2a2a" />
        <B s={[0.5, 0.35, 0.3]} c={C.orange} />
        <B p={[0, -0.6, 0]} s={[1.6, 0.8, 1.2]} c={C.machine} />
      </group>
    </group>
  );
}

function Lamps() {
  const ref = useRef<THREE.Group>(null);
  const mobile = typeof window !== 'undefined' && window.innerWidth < 900;
  useFrame(() => {
    if (!ref.current) return;
    const b = live.blend;
    ref.current.children.forEach((g, i) => {
      const grp = g as THREE.Group;
      const lamp = grp.children[1] as THREE.Mesh;
      const m = lamp.material as THREE.MeshStandardMaterial;
      // 優化前：部分燈管閃爍
      const flicker = i % 4 === 0 ? (Math.sin(live.time * 0.9 + i * 2.1) > 0.94 ? 0.3 : 1) : 1;
      m.emissiveIntensity = THREE.MathUtils.lerp(1.6 * flicker, 1.2, b);
      const light = grp.children[2] as THREE.PointLight | undefined;
      if (light) light.intensity = THREE.MathUtils.lerp(70 * flicker, 9, b);
    });
  });
  const pos: [number, number][] = [];
  for (const x of [-22, -10, 2, 14, 25]) for (const z of [-12, 0, 10]) pos.push([x, z]);
  return (
    <group ref={ref}>
      {pos.map(([x, z], i) => (
        <group key={i} position={[x, 7.9, z]}>
          <B p={[0, 0.5, 0]} s={[0.04, 1, 0.04]} c="#333" shadow={false} />
          <mesh material={new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#ffe9b8', emissiveIntensity: 1.6 })}>
            <boxGeometry args={[3, 0.12, 0.35]} />
          </mesh>
          {(!mobile || i % 2 === 0) && <pointLight position={[0, -0.6, 0]} color="#ffd59a" intensity={70} distance={13} decay={1.8} />}
        </group>
      ))}
    </group>
  );
}

function tileTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(120,120,120,0.45)'; g.lineWidth = 2;
  for (let i = 0; i <= 128; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 3); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function blockTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 64);
  g.strokeStyle = 'rgba(110,110,110,0.55)'; g.lineWidth = 2;
  for (let y = 0; y <= 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke(); }
  for (let y = 0; y < 64; y += 16) for (let x = (y / 16) % 2 ? 16 : 0; x <= 128; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 1.1); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
