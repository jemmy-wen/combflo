// 讓廠房更像台灣傳統工廠的細節：鐵皮屋頂、管線、風管、排風扇、布條、油桶、鋼瓶、鋼板、機車…
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { B, Cyl, G, RB, blendMat, corrugatedTexture, mat, textTexture, useOnce, C } from './kit';
import { live } from '../../lib/store';

export default function Details() {
  return (
    <group>
      <Roof />
      <WallPipes />
      <Duct />
      {[-22, -2, 18].map((x) => <WallFan key={x} p={[x, 5.2, -19.8]} />)}
      <WallFan p={[-31.8, 5.2, -6]} side />
      <Banner p={[-12, 4.2, -19.82]} text="安全第一" />
      <Banner p={[10, 4.2, -19.82]} text="品質至上・準時交貨" w={7} />
      <Banner p={[-31.82, 4.2, 4]} text="工作場所 請戴安全帽" w={7} side />

      {/* 油桶 */}
      {[[-15.5, -5], [-14.6, -5], [-15.05, -4.2], [12.5, 15.5], [13.4, 15.5], [12.95, 16.3], [23, -16.5], [23.9, -16.5]].map(([x, z], i) => (
        <Drum key={i} p={[x, 0, z]} c={i % 3 === 2 ? '#d24d3b' : '#2f62a8'} />
      ))}
      {/* 焊接鋼瓶 */}
      {[[-14.2, 14.5], [-13.6, 14.6], [-13, 14.5], [-12.4, 14.6]].map(([x, z], i) => <GasCylinder key={i} p={[x, 0, z]} c={i % 2 ? '#3e8a5a' : '#2b2b2b'} />)}
      {/* 鋼板堆、鋼管捆（鐵工廠、船廠感） */}
      <SteelPlates p={[19.5, 0, -6.5]} />
      <SteelPlates p={[21.8, 0, -6.5]} n={5} />
      <PipeBundle p={[-17, 0, 16.6]} />
      <PipeBundle p={[38, 0, -15]} r={0.3} />
      <SteelPlates p={[40, 0, -9]} n={8} />
      {/* 工作台＋工具板 */}
      <Workbench p={[-16.5, 0, 11]} r={Math.PI / 2} />
      <Pegboard p={[-17.3, 0, 11]} />
      {/* 滅火器、電箱 */}
      {[[-24.4, -3], [-0.4, -3], [11.6, -3], [-12.4, 19.2], [23.6, 19.2]].map(([x, z], i) => <Extinguisher key={i} p={[x, 0, z]} />)}
      {[[-26, -19.75], [6, -19.75], [26, -19.75]].map(([x, z], i) => <ElectricPanel key={i} p={[x, 0, z]} />)}
      {/* 廠外：機車停車格、樹 */}
      {[-28, -26.6, -25.2, -23.8, -22.4, -21].map((x, i) => <Scooter key={x} p={[x, 0, 23.6]} c={['#d24d3b', '#f2f2ee', '#2f62a8', '#3a3a3a', '#7e9c4a', '#f2c230'][i]} />)}
      {[[-37, -8], [-38, 6], [-36, 18]].map(([x, z], i) => <Tree key={i} p={[x, 0, z]} s={0.9 + (i % 3) * 0.2} />)}
      {/* 外圍柏油道路標線 */}
    </group>
  );
}

/* 鐵皮屋頂：只蓋後段與左側，像剖面模型一樣看得到室內 */
function Roof() {
  const roofMat = useOnce(() => blendMat('#4a5560', '#b9c9d8', { map: corrugatedTexture('#e6e6e6', 60), rough: 0.6, metal: 0.25 }));
  return (
    <group>
      <mesh position={[0, 10.35, -16]} rotation={[0.18, 0, 0]} castShadow receiveShadow material={roofMat}>
        <boxGeometry args={[64.6, 0.12, 9.4]} />
      </mesh>
      {/* 採光罩 */}
      {[-24, -8, 8, 24].map((x) => (
        <mesh key={x} position={[x, 10.42, -16]} rotation={[0.18, 0, 0]} material={mat('#e8f2ff', { rough: 0.2, emissive: '#dff0ff', ei: 0.25, opacity: 0.55 })}>
          <boxGeometry args={[4, 0.14, 7]} />
        </mesh>
      ))}
      {/* 屋簷收邊 */}
      <B p={[0, 9.55, -11.4]} s={[64.6, 0.3, 0.2]} c={C.steelDark} />
      {/* 屋頂通風球 */}
      {[-20, 0, 20].map((x) => <Ventilator key={x} p={[x, 11.1, -16.5]} />)}
    </group>
  );
}

function Ventilator({ p }: { p: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 2; });
  return (
    <G p={p}>
      <Cyl p={[0, -0.25, 0]} rt={0.35} h={0.5} c="#b9bec2" />
      <mesh ref={ref} position={[0, 0.25, 0]} castShadow material={mat('#cfd4d8', { metal: 0.5, rough: 0.35 })}><sphereGeometry args={[0.55, 12, 8]} /></mesh>
    </G>
  );
}

function WallPipes() {
  const pipes: { y: number; c: string; r: number }[] = [
    { y: 5.9, c: '#f2c230', r: 0.12 }, { y: 6.25, c: '#2f62a8', r: 0.16 }, { y: 4.7, c: '#d24d3b', r: 0.14 },
  ];
  return (
    <group>
      {pipes.map((pp) => (
        <Cyl key={pp.y} p={[0, pp.y, -19.55]} rt={pp.r} h={63} c={pp.c} r={[0, 0, Math.PI / 2]} seg={10} />
      ))}
      {[-28, -18, -8, 2, 12, 22].map((x) => <B key={x} p={[x, 5.5, -19.7]} s={[0.12, 1.9, 0.25]} c="#555" />)}
      {/* 往下接到機台的垂直管 */}
      {[-12, -8.5, -5].map((x) => <Cyl key={x} p={[x, 3.4, -19.55]} rt={0.1} h={4.6} c="#f2c230" seg={8} />)}
    </group>
  );
}

function Duct() {
  return (
    <group>
      <RB p={[-31.1, 7.6, 0]} s={[1.2, 1.2, 38]} c="#c9ced3" rad={0.1} />
      {[-15, -5, 5, 15].map((z) => <RB key={z} p={[-30.3, 7.6, z]} s={[0.6, 0.9, 0.9]} c="#b2b8bd" rad={0.05} />)}
    </group>
  );
}

function WallFan({ p, side = false }: { p: [number, number, number]; side?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * THREE.MathUtils.lerp(1.5, 7, live.blend); });
  return (
    <group position={p} rotation={[0, side ? Math.PI / 2 : 0, 0]}>
      <B s={[2.2, 2.2, 0.2]} c="#7d868e" />
      <mesh position={[0, 0, 0.12]} material={mat('#2d3135')}><circleGeometry args={[0.95, 24]} /></mesh>
      <group ref={ref} position={[0, 0, 0.18]}>
        {[0, 1, 2].map((i) => <B key={i} r={[0, 0.3, (i * Math.PI * 2) / 3]} p={[0, 0, 0]} s={[0.25, 1.7, 0.03]} c="#aeb6bd" shadow={false} />)}
      </group>
    </group>
  );
}

function Banner({ p, text, w = 5, side = false }: { p: [number, number, number]; text: string; w?: number; side?: boolean }) {
  const tex = useOnce(() => textTexture(text, '#c8281e', '#ffffff', 1024, 160, 104));
  return (
    <group position={p} rotation={[0, side ? Math.PI / 2 : 0, 0]}>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w, w * 0.16]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Drum({ p, c }: { p: [number, number, number]; c: string }) {
  return (
    <G p={p}>
      <Cyl p={[0, 0.48, 0]} rt={0.32} h={0.96} c={c} seg={18} />
      {[0.2, 0.75].map((y) => <Cyl key={y} p={[0, y, 0]} rt={0.335} h={0.04} c="#333" seg={18} />)}
      <Cyl p={[0.12, 0.97, 0.05]} rt={0.05} h={0.04} c="#999" seg={8} />
    </G>
  );
}

function GasCylinder({ p, c }: { p: [number, number, number]; c: string }) {
  return (
    <G p={p}>
      <Cyl p={[0, 0.7, 0]} rt={0.17} h={1.4} c={c} seg={14} />
      <mesh position={[0, 1.42, 0]} material={mat(c)} castShadow><sphereGeometry args={[0.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <Cyl p={[0, 1.6, 0]} rt={0.05} h={0.2} c="#b9a24a" seg={8} />
    </G>
  );
}

function SteelPlates({ p, n = 6 }: { p: [number, number, number]; n?: number }) {
  return (
    <G p={p}>
      {[-0.7, 0.7].map((x) => <B key={x} p={[x, 0.1, 0]} s={[0.25, 0.2, 2.2]} c={C.wood} />)}
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} p={[Math.sin(i) * 0.05, 0.24 + i * 0.07, Math.cos(i * 1.3) * 0.05]} s={[2, 0.06, 2.6]} c={i % 2 ? '#6d757b' : '#7b8389'} />
      ))}
    </G>
  );
}

function PipeBundle({ p, r = 0 }: { p: [number, number, number]; r?: number }) {
  const rows = [[0, 0], [1, 0], [2, 0], [3, 0], [0.5, 1], [1.5, 1], [2.5, 1], [1, 2], [2, 2]];
  return (
    <G p={p} r={[0, r, 0]}>
      {rows.map(([i, j], k) => <Cyl key={k} p={[-0.6 + i * 0.36, 0.2 + j * 0.31, 0]} rt={0.17} h={5} c={k % 3 ? '#8a9399' : '#a2aab0'} r={[Math.PI / 2, 0, 0]} seg={12} />)}
      <B p={[0.5, 0.05, -1.8]} s={[2, 0.1, 0.2]} c={C.wood} /><B p={[0.5, 0.05, 1.8]} s={[2, 0.1, 0.2]} c={C.wood} />
    </G>
  );
}

function Workbench({ p, r = 0 }: { p: [number, number, number]; r?: number }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.88, 0]} s={[2.6, 0.12, 1]} c="#8b6a45" rad={0.03} />
      <B p={[0, 0.45, 0]} s={[2.4, 0.85, 0.9]} c="#3f4a54" />
      <B p={[-0.9, 1.05, 0.2]} s={[0.35, 0.22, 0.25]} c="#2f62a8" />
      <B p={[0.6, 0.98, -0.1]} s={[0.5, 0.08, 0.15]} c="#d24d3b" />
    </G>
  );
}

function Pegboard({ p }: { p: [number, number, number] }) {
  return (
    <G p={p}>
      <B p={[-0.45, 2, 0]} s={[0.05, 1.6, 2.6]} c="#c9a978" />
      {Array.from({ length: 9 }).map((_, i) => (
        <B key={i} p={[-0.4, 1.5 + Math.floor(i / 3) * 0.45, -0.9 + (i % 3) * 0.9]} s={[0.05, 0.32, 0.08]} c={['#d24d3b', '#555', '#2f62a8'][i % 3]} r={[0.3 * (i % 2 ? 1 : -1), 0, 0]} />
      ))}
    </G>
  );
}

function Extinguisher({ p }: { p: [number, number, number] }) {
  return (
    <G p={p}>
      <Cyl p={[0, 0.35, 0]} rt={0.12} h={0.6} c="#d22a1e" seg={12} />
      <B p={[0, 0.72, 0]} s={[0.1, 0.12, 0.2]} c="#222" />
      <B p={[0, 1.4, 0]} s={[0.04, 0.6, 0.45]} c="#d22a1e" shadow={false} />
    </G>
  );
}

function ElectricPanel({ p }: { p: [number, number, number] }) {
  return (
    <G p={p}>
      <RB p={[0, 1.5, 0.25]} s={[1.4, 2, 0.4]} c="#b8bcbf" rad={0.04} />
      <B p={[0, 2.2, 0.46]} s={[0.4, 0.25, 0.02]} c={C.safetyYellow} shadow={false} />
    </G>
  );
}

function Scooter({ p, c }: { p: [number, number, number]; c: string }) {
  return (
    <G p={p} r={[0, 0.1, 0]}>
      <Cyl p={[0, 0.22, 0.55]} rt={0.22} h={0.1} c="#1d1d1d" r={[0, 0, Math.PI / 2]} seg={14} />
      <Cyl p={[0, 0.22, -0.55]} rt={0.22} h={0.1} c="#1d1d1d" r={[0, 0, Math.PI / 2]} seg={14} />
      <RB p={[0, 0.45, -0.15]} s={[0.4, 0.4, 0.9]} c={c} rad={0.12} />
      <RB p={[0, 0.72, -0.25]} s={[0.36, 0.1, 0.6]} c="#2b2b2b" rad={0.04} />
      <B p={[0, 0.75, 0.5]} s={[0.12, 0.7, 0.12]} c={c} r={[-0.25, 0, 0]} />
      <B p={[0, 1.08, 0.6]} s={[0.6, 0.05, 0.05]} c="#2b2b2b" />
    </G>
  );
}

function Tree({ p, s = 1 }: { p: [number, number, number]; s?: number }) {
  return (
    <G p={p} s={s}>
      <Cyl p={[0, 1, 0]} rt={0.18} rb={0.26} h={2} c="#7a5a3c" seg={8} />
      <mesh position={[0, 2.6, 0]} castShadow material={mat('#5d9156')}><icosahedronGeometry args={[1.4, 0]} /></mesh>
      <mesh position={[0.6, 3.3, 0.3]} castShadow material={mat('#6ea463')}><icosahedronGeometry args={[0.9, 0]} /></mesh>
      <mesh position={[-0.5, 3.1, -0.4]} castShadow material={mat('#538a4c')}><icosahedronGeometry args={[0.8, 0]} /></mesh>
    </G>
  );
}
