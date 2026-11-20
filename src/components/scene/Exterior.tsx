// 廠區外：工業區道路、圍牆與大門、警衛室、隔壁鐵皮廠、辦公樓、貨櫃場、電線桿、水塔、停車場、來往車輛
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { B, Cyl, G, RB, blendMat, corrugatedTexture, mat, textTexture, useOnce, C } from './kit';
import { live } from '../../lib/store';

export default function Exterior() {
  return (
    <group>
      <Ground />
      <Fence />
      <GuardHouse p={[40, 0, 22]} />
      <Signboard p={[46, 0, 24.5]} />
      {/* 隔壁的鐵皮廠房 */}
      <NeighborShed p={[-58, 0, -6]} w={30} d={26} h={8} c="#8fb0c9" roof="#5c7f9e" />
      <NeighborShed p={[2, 0, -48]} w={46} d={18} h={9} c="#d9dde0" roof="#9a3b2e" />
      <NeighborShed p={[58, 0, -40]} w={26} d={20} h={7} c="#c9d6c2" roof="#4f7a5a" />
      <OfficeBlock p={[-52, 0, 30]} />
      <WaterTower p={[-30, 0, -32]} />
      <ContainerYard p={[56, 0, -12]} />
      <ParkingLot p={[56, 0, 14]} />
      <PowerLine />
      <Traffic />
      {/* 遠景樹列 */}
      {Array.from({ length: 18 }).map((_, i) => <Tree key={i} p={[-80 + i * 9.5, 0, 58 + (i % 3) * 3]} s={1 + (i % 4) * 0.15} />)}
      {Array.from({ length: 10 }).map((_, i) => <Tree key={`b${i}`} p={[-84 + (i % 2) * 4, 0, -60 + i * 12]} s={1.1} />)}
      {[[-22, -26], [-12, -27], [16, -26], [26, -27], [-40, 12], [-42, 22]].map(([x, z], i) => <Tree key={`c${i}`} p={[x, 0, z]} s={0.95} />)}
    </group>
  );
}

function Ground() {
  return (
    <group>
      {/* 草地與廠區水泥地 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow material={mat('#9bb47e', { rough: 1 })}><planeGeometry args={[260, 200]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -0.03, 0]} receiveShadow material={mat('#a8a9a2', { rough: 1 })}><planeGeometry args={[100, 58]} /></mesh>
      {/* 前方主要道路＋人行道 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 33]} receiveShadow material={mat('#4b4e52', { rough: 0.95 })}><planeGeometry args={[260, 10]} /></mesh>
      <B p={[0, 0.06, 27.6]} s={[260, 0.16, 0.9]} c="#c9c6bd" />
      <B p={[0, 0.06, 38.4]} s={[260, 0.16, 0.9]} c="#c9c6bd" />
      {Array.from({ length: 22 }).map((_, i) => <B key={i} p={[-110 + i * 10.5, -0.005, 33]} s={[4.5, 0.01, 0.25]} c="#f2efe6" shadow={false} />)}
      {/* 斑馬線 */}
      {Array.from({ length: 7 }).map((_, i) => <B key={`zb${i}`} p={[40 + (i - 3) * 1.1, -0.005, 33]} s={[0.6, 0.01, 8]} c="#f2efe6" shadow={false} />)}
      {/* 右側支線道路 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[48, -0.015, -10]} receiveShadow material={mat('#55585c', { rough: 0.95 })}><planeGeometry args={[8, 76]} /></mesh>
      {/* 排水溝 */}
      <B p={[0, -0.01, 28.4]} s={[200, 0.02, 0.5]} c="#6c6f72" shadow={false} />
    </group>
  );
}

function Fence() {
  const segs: [number, number, number, number][] = [
    // [x, z, 長, 角度]
    [-15, 27.2, 70, 0], [57, 27.2, 14, 0], [-44, 0, 54, Math.PI / 2], [64, -6, 66, Math.PI / 2], [10, -27, 108, 0],
  ];
  return (
    <group>
      {segs.map(([x, z, len, r], i) => (
        <G key={i} p={[x, 0, z]} r={[0, r, 0]}>
          <B p={[0, 0.4, 0]} s={[len, 0.8, 0.25]} c="#d6d2c6" />
          <B p={[0, 0.84, 0]} s={[len, 0.08, 0.3]} c="#bdb8ab" />
          {Array.from({ length: Math.floor(len / 3) }).map((_, k) => <B key={k} p={[-len / 2 + 1.5 + k * 3, 1.3, 0]} s={[0.06, 1, 0.06]} c="#4b5560" shadow={false} />)}
          <B p={[0, 1.75, 0]} s={[len, 0.05, 0.05]} c="#4b5560" shadow={false} />
        </G>
      ))}
      {/* 伸縮大門 */}
      <G p={[45, 0, 27.2]}>
        {Array.from({ length: 10 }).map((_, i) => <B key={i} p={[-5 + i * 0.5, 0.75, 0]} s={[0.06, 1.3, 0.12]} c="#c4c9cd" r={[0, 0, i % 2 ? 0.35 : -0.35]} shadow={false} />)}
        <RB p={[-5.4, 0.8, 0]} s={[0.5, 1.6, 0.5]} c="#9aa1a6" rad={0.05} />
      </G>
    </group>
  );
}

function GuardHouse({ p }: { p: [number, number, number] }) {
  return (
    <G p={p}>
      <RB p={[0, 1.4, 0]} s={[3, 2.8, 2.6]} c="#eef0f0" rad={0.06} />
      <RB p={[0, 2.95, 0]} s={[3.6, 0.25, 3.2]} c="#2f62a8" rad={0.05} />
      <B p={[0, 1.7, 1.31]} s={[2.2, 1, 0.04]} c="#9fc4d6" m={mat('#9fc4d6', { rough: 0.1, metal: 0.2 })} />
      <B p={[-1.51, 1.3, 0]} s={[0.04, 2, 1.2]} c="#7b858c" />
      {/* 柵欄機 */}
      <RB p={[2.3, 0.55, 2]} s={[0.4, 1.1, 0.4]} c="#f2c230" rad={0.05} />
      <G p={[2.3, 1.05, 2]} r={[0, 0, 0]}>
        {Array.from({ length: 8 }).map((_, i) => <B key={i} p={[-0.4 - i * 0.5, 0, 0]} s={[0.5, 0.1, 0.08]} c={i % 2 ? '#e0533a' : '#ffffff'} />)}
      </G>
    </G>
  );
}

function Signboard({ p }: { p: [number, number, number] }) {
  const tex = useOnce(() => textTexture('流程工廠｜示範廠區', '#ffffff', '#1d1b18', 1024, 200, 110));
  return (
    <G p={p}>
      <B p={[-2.2, 1.6, 0]} s={[0.2, 3.2, 0.2]} c="#6b7177" />
      <B p={[2.2, 1.6, 0]} s={[0.2, 3.2, 0.2]} c="#6b7177" />
      <RB p={[0, 2.7, 0]} s={[5, 1.1, 0.2]} c="#ff6a2b" rad={0.06} />
      <mesh position={[0, 2.7, 0.11]}><planeGeometry args={[4.6, 0.9]} /><meshStandardMaterial map={tex} /></mesh>
    </G>
  );
}

function NeighborShed({ p, w, d, h, c, roof }: { p: [number, number, number]; w: number; d: number; h: number; c: string; roof: string }) {
  const wall = useOnce(() => { const m = new THREE.MeshStandardMaterial({ color: c, map: corrugatedTexture('#efefef', Math.round(w * 1.2)), roughness: 0.7, metalness: 0.15, envMapIntensity: 0.4 }); return m; });
  const roofM = useOnce(() => new THREE.MeshStandardMaterial({ color: roof, map: corrugatedTexture('#e6e6e6', Math.round(d * 1.6)), roughness: 0.6, metalness: 0.2, envMapIntensity: 0.4 }));
  const pitch = 0.22;
  const half = d / 2 / Math.cos(pitch);
  return (
    <G p={p}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={wall}><boxGeometry args={[w, h, d]} /></mesh>
      {/* 山牆 */}
      <mesh position={[w / 2 + 0.01, h, 0]} rotation={[0, Math.PI / 2, 0]} material={mat(c)}><shapeGeometry args={[(() => { const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, Math.tan(pitch) * d / 2); s.closePath(); return s; })()]} /></mesh>
      <mesh position={[-w / 2 - 0.01, h, 0]} rotation={[0, -Math.PI / 2, 0]} material={mat(c)}><shapeGeometry args={[(() => { const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, Math.tan(pitch) * d / 2); s.closePath(); return s; })()]} /></mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, h + Math.tan(pitch) * d / 4, (side * d) / 4]} rotation={[side * pitch, 0, 0]} castShadow receiveShadow material={roofM}>
          <boxGeometry args={[w + 0.8, 0.15, half + 0.3]} />
        </mesh>
      ))}
      {/* 捲門與窗 */}
      <B p={[-w / 4, 2.3, d / 2 + 0.02]} s={[5, 4.6, 0.06]} c="#b9c0c5" />
      <B p={[w / 4, 2.3, d / 2 + 0.02]} s={[5, 4.6, 0.06]} c="#b9c0c5" />
      {[-w / 3, 0, w / 3].map((x) => <B key={x} p={[x, h - 1.4, d / 2 + 0.03]} s={[3.5, 1.1, 0.05]} c="#a7c7dd" m={mat('#bcd7e8', { rough: 0.2 })} shadow={false} />)}
      <Cyl p={[w / 2 - 1.5, h + 1.5, -d / 4]} rt={0.3} h={3} c="#9aa1a6" />
    </G>
  );
}

function OfficeBlock({ p }: { p: [number, number, number] }) {
  return (
    <G p={p}>
      <RB p={[0, 6, 0]} s={[18, 12, 12]} c="#e9e4da" rad={0.15} />
      {[0, 1, 2].map((f) => (
        <G key={f} p={[0, 2.2 + f * 3.6, 6.02]}>
          {Array.from({ length: 6 }).map((_, i) => <B key={i} p={[-7.2 + i * 2.9, 0, 0]} s={[2.1, 1.8, 0.06]} c="#a7c7dd" m={mat('#9fc0d8', { rough: 0.15, metal: 0.2 })} shadow={false} />)}
          <B p={[0, -1.2, 0.1]} s={[18, 0.2, 0.25]} c="#c9c2b4" />
        </G>
      ))}
      <B p={[0, 12.3, 0]} s={[18.4, 0.5, 12.4]} c="#cfc8bb" />
      <RB p={[5, 13.2, -2]} s={[3, 1.4, 2]} c="#b9bec2" rad={0.1} />
      {/* 屋頂冷氣室外機 */}
      {[-5, -2].map((x) => <RB key={x} p={[x, 12.9, 3]} s={[1.4, 0.9, 0.7]} c="#dfe2e4" rad={0.06} />)}
    </G>
  );
}

function WaterTower({ p }: { p: [number, number, number] }) {
  return (
    <G p={p}>
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => <B key={i} p={[x, 4, z]} s={[0.25, 8, 0.25]} c="#6b7177" />)}
      {[2, 5].map((y) => <B key={y} p={[0, y, 0]} s={[2.6, 0.12, 2.6]} c="#6b7177" />)}
      <Cyl p={[0, 9.2, 0]} rt={1.9} h={2.6} c="#e6e8ea" seg={24} />
      <mesh position={[0, 10.6, 0]} material={mat('#d2d6d9')}><coneGeometry args={[2, 0.8, 24]} /></mesh>
      {[8.4, 9.6].map((y) => <Cyl key={y} p={[0, y, 0]} rt={1.93} h={0.08} c="#9aa1a6" seg={24} />)}
    </G>
  );
}

function Container({ p, r = 0, c }: { p: [number, number, number]; r?: number; c: string }) {
  const tex = useOnce(() => corrugatedTexture('#f0f0f0', 24));
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: c, map: tex, roughness: 0.6, metalness: 0.2, envMapIntensity: 0.4 }), [c, tex]);
  return (
    <G p={p} r={[0, r, 0]}>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow material={m}><boxGeometry args={[6, 2.6, 2.4]} /></mesh>
      <B p={[3.01, 1.3, 0]} s={[0.04, 2.5, 2.3]} c="#555" />
      {[-0.5, 0.5].map((z) => <B key={z} p={[3.05, 1.3, z]} s={[0.04, 2.3, 0.06]} c="#2b2b2b" shadow={false} />)}
    </G>
  );
}
function ContainerYard({ p }: { p: [number, number, number] }) {
  const cols = ['#c8463a', '#2f62a8', '#3e8a5a', '#d9a441', '#7a4f9a', '#c8463a', '#2f62a8'];
  return (
    <G p={p}>
      <Container p={[0, 0, -8]} c={cols[0]} r={Math.PI / 2} />
      <Container p={[2.6, 0, -8]} c={cols[1]} r={Math.PI / 2} />
      <Container p={[0, 2.6, -8]} c={cols[2]} r={Math.PI / 2} />
      <Container p={[5.2, 0, -8]} c={cols[3]} r={Math.PI / 2} />
      <Container p={[2.6, 2.6, -8]} c={cols[4]} r={Math.PI / 2} />
      <Container p={[0, 0, 2]} c={cols[5]} r={Math.PI / 2} />
      <Container p={[2.6, 0, 2]} c={cols[6]} r={Math.PI / 2} />
    </G>
  );
}

function Car({ p, r = 0, c }: { p: [number, number, number]; r?: number; c: string }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.6, 0]} s={[1.8, 0.7, 4.2]} c={c} rad={0.25} />
      <RB p={[0, 1.15, -0.2]} s={[1.6, 0.6, 2.2]} c={c} rad={0.2} />
      <B p={[0, 1.15, 0.92]} s={[1.5, 0.48, 0.04]} c="#2a3a48" m={mat('#2a3a48', { rough: 0.1, metal: 0.4 })} r={[-0.5, 0, 0]} shadow={false} />
      {[-0.82, 0.82].map((x) => <B key={x} p={[x, 1.15, -0.2]} s={[0.04, 0.42, 1.9]} c="#2a3a48" m={mat('#2a3a48', { rough: 0.1, metal: 0.4 })} shadow={false} />)}
      {[[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]].map(([x, z], i) => <Cyl key={i} p={[x, 0.33, z]} rt={0.33} h={0.25} c="#1d1d1d" r={[0, 0, Math.PI / 2]} seg={14} />)}
      <B p={[0, 0.65, 2.11]} s={[1.4, 0.15, 0.02]} c="#fff6d8" m={mat('#fff6d8', { emissive: '#fff2c0', ei: 0.4 })} shadow={false} />
    </G>
  );
}

function ParkingLot({ p }: { p: [number, number, number] }) {
  const cols = ['#e9eef2', '#2b2f36', '#c8463a', '#9aa6b2', '#e9eef2', '#2f62a8'];
  return (
    <G p={p}>
      {Array.from({ length: 7 }).map((_, i) => <B key={i} p={[-6 + i * 2.6, 0.005, 0]} s={[0.12, 0.01, 5]} c="#f2efe6" shadow={false} />)}
      {cols.map((c, i) => (i === 3 ? null : <Car key={i} p={[-4.7 + i * 2.6, 0, 0]} c={c} />))}
    </G>
  );
}

function PowerLine() {
  const poles = Array.from({ length: 9 }).map((_, i) => -64 + i * 16);
  const wires = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (const dy of [0, 0.5]) for (const dz of [-0.8, 0.8]) {
      for (let i = 0; i < poles.length - 1; i++) {
        const a = new THREE.Vector3(poles[i], 8.6 + dy, 28.8 + dz);
        const b = new THREE.Vector3(poles[i + 1], 8.6 + dy, 28.8 + dz);
        const mid = a.clone().lerp(b, 0.5); mid.y -= 0.8;
        out.push(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(12));
      }
    }
    return out;
  }, []);
  return (
    <group>
      {poles.map((x) => (
        <G key={x} p={[x, 0, 28.8]}>
          <Cyl p={[0, 4.5, 0]} rt={0.14} rb={0.2} h={9} c="#8d8a83" seg={10} />
          <B p={[0, 8.6, 0]} s={[0.15, 0.15, 2]} c="#5a5650" />
          <B p={[0, 9.1, 0]} s={[0.15, 0.15, 2]} c="#5a5650" />
          {x % 32 === 0 && <Cyl p={[0.45, 7.5, 0]} rt={0.35} h={0.9} c="#9aa1a6" seg={12} />}
        </G>
      ))}
      {wires.map((pts, i) => (
        <mesh key={i}>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(pts), 16, 0.025, 4, false]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}
    </group>
  );
}

// 道路上來往的車輛與機車：優化後車流較順
function Traffic() {
  const refs = useRef<THREE.Group[]>([]);
  const items = useMemo(() => [
    { lane: 31, dir: 1, speed: 7, off: 0, kind: 'car', c: '#e9eef2' },
    { lane: 31, dir: 1, speed: 9, off: 70, kind: 'scooter', c: '#c8463a' },
    { lane: 35, dir: -1, speed: 6, off: 30, kind: 'truck', c: '#2f62a8' },
    { lane: 35, dir: -1, speed: 8, off: 120, kind: 'car', c: '#2b2f36' },
    { lane: 31, dir: 1, speed: 6.5, off: 160, kind: 'car', c: '#d9a441' },
  ], []);
  useFrame(() => {
    const t = live.time;
    items.forEach((it, i) => {
      const g = refs.current[i];
      if (!g) return;
      const span = 240;
      const x = ((it.off + t * it.speed) % span) - span / 2;
      g.position.set(it.dir > 0 ? x : -x, 0, it.lane);
      g.rotation.y = it.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    });
  });
  return (
    <group>
      {items.map((it, i) => (
        <group key={i} ref={(g) => { if (g) refs.current[i] = g; }}>
          {it.kind === 'car' && <Car p={[0, 0, 0]} c={it.c} />}
          {it.kind === 'truck' && (
            <G>
              <RB p={[0, 1.8, -0.8]} s={[2.3, 2.4, 5]} c="#eef0f2" rad={0.1} />
              <RB p={[0, 1.3, 2.4]} s={[2.2, 1.9, 1.8]} c={it.c} rad={0.25} />
              {[[-1, 1.8], [1, 1.8], [-1, -2.2], [1, -2.2]].map(([x, z], k) => <Cyl key={k} p={[x, 0.42, z]} rt={0.42} h={0.3} c="#1d1d1d" r={[0, 0, Math.PI / 2]} seg={14} />)}
            </G>
          )}
          {it.kind === 'scooter' && (
            <G>
              <RB p={[0, 0.45, -0.1]} s={[0.4, 0.4, 1]} c={it.c} rad={0.12} />
              {[0.55, -0.55].map((z) => <Cyl key={z} p={[0, 0.22, z]} rt={0.22} h={0.1} c="#1d1d1d" r={[0, 0, Math.PI / 2]} seg={12} />)}
              <RB p={[0, 1.1, -0.1]} s={[0.4, 0.6, 0.3]} c="#4f6d8f" rad={0.12} />
              <mesh position={[0, 1.55, -0.05]} material={mat('#ffffff', { rough: 0.3 })}><sphereGeometry args={[0.2, 12, 10]} /></mesh>
            </G>
          )}
        </group>
      ))}
    </group>
  );
}

function Tree({ p, s = 1 }: { p: [number, number, number]; s?: number }) {
  return (
    <G p={p} s={s}>
      <Cyl p={[0, 1, 0]} rt={0.18} rb={0.26} h={2} c="#7a5a3c" seg={8} />
      <mesh position={[0, 2.7, 0]} castShadow material={mat('#5d9156')}><icosahedronGeometry args={[1.5, 1]} /></mesh>
      <mesh position={[0.7, 3.4, 0.3]} castShadow material={mat('#6ea463')}><icosahedronGeometry args={[1, 1]} /></mesh>
      <mesh position={[-0.6, 3.2, -0.4]} castShadow material={mat('#538a4c')}><icosahedronGeometry args={[0.9, 1]} /></mesh>
    </G>
  );
}

void blendMat; void C;
