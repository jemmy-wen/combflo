// 可重複使用的工廠道具
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { B, Cyl, G, RB, mat, C } from './kit';
import { live } from '../../lib/store';

type P = { p?: [number, number, number]; r?: number };

// 螢幕：優化前紅色錯誤畫面，優化後藍色畫面
export function Screen({ p = [0, 0, 0], r = 0, w = 0.9, h = 0.55 }: P & { w?: number; h?: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (!ref.current) return;
    const b = live.blend;
    const blink = Math.sin(live.time * 1.5) > 0 ? 1 : 0.75;
    ref.current.emissive.setRGB(THREE.MathUtils.lerp(1 * blink, 0.35, b), THREE.MathUtils.lerp(0.35, 0.85, b), THREE.MathUtils.lerp(0.15, 0.6, b));
    ref.current.emissiveIntensity = THREE.MathUtils.lerp(0.9, 0.8, b);
  });
  return (
    <G p={p} r={[0, r, 0]}>
      <B p={[0, h / 2 + 0.12, 0]} s={[w + 0.08, h + 0.08, 0.06]} c="#202326" />
      <mesh position={[0, h / 2 + 0.12, 0.035]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial ref={ref} color="#111" emissive="#ff4030" emissiveIntensity={0.9} />
      </mesh>
      <B p={[0, 0.06, 0]} s={[0.08, 0.12, 0.08]} c="#202326" />
      <B p={[0, 0.01, 0]} s={[0.3, 0.02, 0.2]} c="#202326" />
    </G>
  );
}

export function Desk({ p = [0, 0, 0], r = 0, computer = true }: P & { computer?: boolean }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.74, 0]} s={[1.8, 0.05, 0.85]} c="#e4ddcf" rad={0.02} />
      <B p={[0, 0.715, 0]} s={[1.76, 0.02, 0.81]} c="#b9ad97" shadow={false} />
      {/* 金屬桌腳 */}
      {[-0.82, 0.82].map((x) => (
        <G key={x} p={[x, 0, 0]}>
          <B p={[0, 0.36, 0]} s={[0.05, 0.72, 0.05]} c="#8d949a" />
          <B p={[0, 0.03, 0]} s={[0.06, 0.04, 0.75]} c="#8d949a" />
        </G>
      ))}
      <B p={[0, 0.4, -0.38]} s={[1.6, 0.5, 0.02]} c="#c9c2b4" />
      {/* 抽屜櫃 */}
      <RB p={[0.55, 0.37, 0.05]} s={[0.45, 0.66, 0.7]} c="#cfd3d6" rad={0.02} />
      {[0.15, 0.37, 0.59].map((y) => <B key={y} p={[0.55, y, 0.405]} s={[0.25, 0.025, 0.02]} c="#7c858b" shadow={false} />)}
      {computer && <>
        <Screen p={[-0.25, 0.77, -0.22]} w={0.62} h={0.38} />
        <RB p={[-0.25, 0.775, 0.12]} s={[0.46, 0.02, 0.15]} c="#2b2e33" rad={0.008} />
        <RB p={[0.12, 0.775, 0.12]} s={[0.06, 0.02, 0.1]} c="#2b2e33" rad={0.008} />
        {/* 馬克杯、文件盤 */}
        <Cyl p={[0.6, 0.82, -0.2]} rt={0.045} h={0.1} c="#f2f2ee" seg={12} />
        <RB p={[0.55, 0.8, 0.12]} s={[0.32, 0.06, 0.24]} c="#3d6fd9" rad={0.01} />
        <B p={[0.55, 0.835, 0.12]} s={[0.26, 0.01, 0.2]} c="#f4f1ea" shadow={false} />
      </>}
      <Chair p={[-0.15, 0, 0.72]} r={Math.PI} />
    </G>
  );
}

export function Chair({ p = [0, 0, 0], r = 0, c = '#2f3a56' }: P & { c?: string }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.48, 0]} s={[0.48, 0.08, 0.46]} c={c} rad={0.035} />
      <RB p={[0, 0.82, 0.22]} s={[0.44, 0.5, 0.06]} c={c} rad={0.03} />
      <B p={[0, 0.62, 0.24]} s={[0.05, 0.25, 0.04]} c="#555" />
      <Cyl p={[0, 0.27, 0]} rt={0.03} h={0.4} c="#6b7177" />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <G key={i} p={[0, 0.06, 0]} r={[0, a, 0]}>
            <B p={[0, 0, 0.14]} s={[0.04, 0.03, 0.28]} c="#3a3d42" />
            <mesh position={[0, -0.03, 0.27]} material={mat('#1d1f22')}><sphereGeometry args={[0.03, 8, 6]} /></mesh>
          </G>
        );
      })}
    </G>
  );
}

export function Cabinet({ p = [0, 0, 0], r = 0, h = 1.3 }: P & { h?: number }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, h / 2, 0]} s={[0.9, h, 0.55]} c="#a9b0b5" rad={0.03} />
      {[0.25, 0.6, 0.95].filter((y) => y < h).map((y) => <B key={y} p={[0, y, 0.28]} s={[0.8, 0.02, 0.02]} c="#6e767c" shadow={false} />)}
    </G>
  );
}

export function PaperPile({ p = [0, 0, 0], n = 6 }: P & { n?: number }) {
  return (
    <G p={p}>
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} p={[Math.sin(i * 2.1) * 0.06, 0.025 + i * 0.05, Math.cos(i * 1.7) * 0.05]} s={[0.42, 0.045, 0.3]} c={i % 3 === 0 ? '#f7e6a8' : C.paper} r={[0, i * 0.35, 0]} />
      ))}
    </G>
  );
}

export function Box({ p = [0, 0, 0], r = 0, s = 0.7, c = C.cardboard }: P & { s?: number; c?: string }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, s * 0.4, 0]} s={[s, s * 0.8, s]} c={c} rad={0.025} />
      <B p={[0, s * 0.8 + 0.002, 0]} s={[s * 0.16, 0.006, s * 1.004]} c="#e8d9b8" shadow={false} />
      <B p={[s * 0.18, s * 0.5, s / 2 + 0.002]} s={[s * 0.32, s * 0.2, 0.004]} c="#ffffff" shadow={false} />
    </G>
  );
}

export function Pallet({ p = [0, 0, 0], r = 0, load = true }: P & { load?: boolean }) {
  return (
    <G p={p} r={[0, r, 0]}>
      {[-0.5, 0, 0.5].map((x) => <B key={x} p={[x, 0.06, 0]} s={[0.12, 0.12, 1.2]} c={C.wood} />)}
      {[-0.45, 0, 0.45].map((z) => <B key={z} p={[0, 0.15, z]} s={[1.2, 0.05, 0.25]} c={C.wood} />)}
      {load && <>
        <Box p={[-0.28, 0.18, -0.28]} s={0.55} /><Box p={[0.28, 0.18, -0.28]} s={0.55} />
        <Box p={[-0.28, 0.18, 0.28]} s={0.55} /><Box p={[0.28, 0.18, 0.28]} s={0.55} />
        <Box p={[0, 0.62, 0]} s={0.55} />
      </>}
    </G>
  );
}

export function Rack({ p = [0, 0, 0], r = 0, len = 6, levels = 3, fill = 0.8 }: P & { len?: number; levels?: number; fill?: number }) {
  const bays = Math.round(len / 2);
  const cols = ['#c7a172', '#b8925f', '#d2b285', '#9fb4c7', '#c9a46e'];
  return (
    <G p={p} r={[0, r, 0]}>
      {/* 立柱（含斜撐） */}
      {Array.from({ length: bays + 1 }).map((_, i) => (
        <G key={i} p={[-len / 2 + i * (len / bays), 0, 0]}>
          {[-0.55, 0.55].map((z) => <B key={z} p={[0, 2.2, z]} s={[0.09, 4.4, 0.09]} c="#2f62a8" />)}
          {[0.6, 1.8, 3].map((y) => <B key={y} p={[0, y, 0]} s={[0.04, 1.4, 0.04]} c="#2f62a8" r={[0.65, 0, 0]} shadow={false} />)}
          <B p={[0, 0.03, 0]} s={[0.2, 0.06, 1.3]} c="#2f62a8" />
        </G>
      ))}
      {Array.from({ length: levels }).map((_, l) => (
        <G key={l} p={[0, 0.2 + l * 1.45, 0]}>
          <B p={[0, 0, -0.55]} s={[len, 0.14, 0.08]} c={C.orange} />
          <B p={[0, 0, 0.55]} s={[len, 0.14, 0.08]} c={C.orange} />
          {/* 網架 */}
          <B p={[0, 0.06, 0]} s={[len - 0.1, 0.015, 1.05]} c="#aeb6bd" m={mat('#aeb6bd', { metal: 0.5, rough: 0.4 })} shadow={false} />
          {Array.from({ length: bays }).map((_, i) => ((i * 7 + l * 3) % 10) / 10 < fill && (
            <G key={i} p={[-len / 2 + (i + 0.5) * (len / bays), 0.07, 0]}>
              {((i + l) % 3 === 0)
                ? <Pallet load />
                : <>
                  <Box p={[-0.42, 0, -0.2]} s={0.6} c={cols[(i + l) % 5]} />
                  <Box p={[0.3, 0, -0.2]} s={0.75} c={cols[(i + l + 2) % 5]} />
                  <Box p={[-0.3, 0, 0.3]} s={0.5} c={cols[(i + l + 1) % 5]} />
                  <Box p={[0.4, 0, 0.32]} s={0.45} c={cols[(i + l + 3) % 5]} />
                </>}
            </G>
          ))}
        </G>
      ))}
    </G>
  );
}

export function Forklift({ p = [0, 0, 0], r = 0 }: P) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.55, 0]} s={[1.1, 0.7, 1.8]} c={C.safetyYellow} rad={0.12} />
      <RB p={[0, 1.05, 0.45]} s={[1, 0.3, 0.8]} c="#333" rad={0.08} />
      <B p={[0, 1.7, -0.1]} s={[1.05, 0.06, 1.3]} c="#333" />
      {[[-0.48, 0.5], [0.48, 0.5], [-0.48, -0.25]].map(([x, z], i) => <B key={i} p={[x, 1.35, z]} s={[0.05, 0.75, 0.05]} c="#333" />)}
      <B p={[0, 1.2, -1]} s={[0.9, 2.2, 0.12]} c="#555" />
      <B p={[-0.25, 0.12, -1.6]} s={[0.12, 0.06, 1.2]} c="#555" />
      <B p={[0.25, 0.12, -1.6]} s={[0.12, 0.06, 1.2]} c="#555" />
      {[[-0.55, 0.6], [0.55, 0.6], [-0.55, -0.55], [0.55, -0.55]].map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.25, z]} rt={0.25} h={0.2} c="#222" r={[0, 0, Math.PI / 2]} />
      ))}
    </G>
  );
}

// 狀態燈（安燈）：優化前紅色閃爍、優化後綠色
export function Andon({ p = [0, 0, 0] }: P) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (!ref.current) return;
    const b = live.blend;
    const on = Math.sin(live.time * 2 + p[0]) > 0 ? 1 : 0.35;
    ref.current.color.setRGB(THREE.MathUtils.lerp(1, 0.25, b), THREE.MathUtils.lerp(0.2, 0.85, b), THREE.MathUtils.lerp(0.15, 0.4, b));
    ref.current.emissive.copy(ref.current.color);
    ref.current.emissiveIntensity = THREE.MathUtils.lerp(2.2 * on, 1.2, b);
  });
  return (
    <G p={p}>
      <Cyl p={[0, 0.3, 0]} rt={0.03} h={0.6} c="#333" />
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
        <meshStandardMaterial ref={ref} color="#ff3020" emissive="#ff3020" emissiveIntensity={2} />
      </mesh>
    </G>
  );
}

export function CNC({ p = [0, 0, 0], r = 0, c = C.machine }: P & { c?: string }) {
  return (
    <G p={p} r={[0, r, 0]}>
      {/* 底座與機身 */}
      <RB p={[0, 0.18, 0]} s={[2.5, 0.36, 1.9]} c={C.machineDark} rad={0.05} />
      <RB p={[0, 1.2, 0]} s={[2.4, 1.7, 1.8]} c={c} rad={0.1} />
      <RB p={[0, 2.18, -0.1]} s={[2.2, 0.28, 1.5]} c={C.machineDark} rad={0.06} />
      {/* 雙開門＋觀察窗＋把手 */}
      {[-0.55, 0.05].map((x) => (
        <G key={x} p={[x - 0.25, 1.2, 0.91]}>
          <RB s={[0.58, 1.25, 0.04]} c="#dfe5e8" rad={0.02} />
          <B p={[0, 0.12, 0.025]} s={[0.42, 0.62, 0.01]} c="#9fc4d6" m={mat('#9fc4d6', { rough: 0.1, metal: 0.2, opacity: 0.75 })} shadow={false} />
          <B p={[x < 0 ? 0.24 : -0.24, -0.1, 0.05]} s={[0.04, 0.4, 0.05]} c="#2b2b2b" />
        </G>
      ))}
      {/* 黑黃警示條 */}
      {Array.from({ length: 9 }).map((_, i) => <B key={i} p={[-1.15 + i * 0.29, 0.38, 0.955]} s={[0.14, 0.06, 0.01]} c={i % 2 ? '#222' : C.safetyYellow} shadow={false} r={[0, 0, 0.6]} />)}
      {/* 操作面板（懸臂） */}
      <B p={[1.32, 1.6, 0.6]} s={[0.06, 0.06, 0.5]} c="#8d949a" />
      <G p={[1.32, 1.45, 0.92]} r={[-0.2, -0.4, 0]}>
        <RB s={[0.5, 0.75, 0.12]} c="#2b2f33" rad={0.03} />
        <Screen p={[0, 0.08, 0.06]} w={0.34} h={0.22} />
        {[0, 1, 2, 3, 4, 5].map((i) => <B key={i} p={[-0.15 + (i % 3) * 0.15, -0.23 - Math.floor(i / 3) * 0.08, 0.065]} s={[0.07, 0.04, 0.02]} c={i === 5 ? '#e0533a' : '#9aa3aa'} shadow={false} />)}
      </G>
      {/* 側邊排屑機與冷卻水箱 */}
      <RB p={[-1.45, 0.5, 0.1]} s={[0.45, 1, 1.4]} c={C.machineDark} rad={0.05} />
      <B p={[-1.55, 1.05, 0.5]} s={[0.3, 0.12, 0.6]} c="#5e6a70" r={[0, 0, 0.5]} />
      <RB p={[1.35, 0.3, -0.45]} s={[0.35, 0.6, 0.8]} c="#3f7fa8" rad={0.05} />
      {/* 銘牌 */}
      <B p={[0.75, 2.18, 0.65]} s={[0.4, 0.12, 0.01]} c="#f2f2ee" shadow={false} />
      <Andon p={[1.05, 2.32, -0.6]} />
      {/* 地上的油漬（優化前比較明顯） */}
    </G>
  );
}

export function Lathe({ p = [0, 0, 0], r = 0 }: P) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.45, 0]} s={[3, 0.9, 0.9]} c={C.green} rad={0.08} />
      <RB p={[-1.1, 1.25, 0]} s={[0.8, 0.7, 0.8]} c="#3e6f4f" rad={0.08} />
      <B p={[0, 0.92, 0]} s={[2.6, 0.06, 0.7]} c="#c9ced3" />
      <Cyl p={[0, 1.15, 0]} rt={0.12} h={1.8} c="#b9bec2" r={[0, 0, Math.PI / 2]} />
      <B p={[1.2, 1.15, 0]} s={[0.4, 0.45, 0.5]} c="#3e6f4f" />
      <B p={[0.2, 1.0, 0.3]} s={[0.5, 0.25, 0.4]} c="#3e6f4f" />
      <Andon p={[-1.35, 1.6, -0.35]} />
    </G>
  );
}

export function Press({ p = [0, 0, 0], r = 0 }: P) {
  const ram = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ram.current) return;
    const speed = THREE.MathUtils.lerp(0.4, 2.2, live.blend);
    ram.current.position.y = 2.1 + Math.abs(Math.sin(live.time * speed)) * 0.5;
  });
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.4, 0]} s={[1.8, 0.8, 1.4]} c="#c75b39" rad={0.08} />
      <RB p={[-0.75, 1.9, 0]} s={[0.3, 3, 1.2]} c="#c75b39" rad={0.06} />
      <RB p={[0.75, 1.9, 0]} s={[0.3, 3, 1.2]} c="#c75b39" rad={0.06} />
      <RB p={[0, 3.5, 0]} s={[1.8, 0.6, 1.4]} c="#a94a2d" rad={0.1} />
      <Cyl p={[0.95, 3.5, 0]} rt={0.35} h={0.25} c="#5b5f63" r={[0, 0, Math.PI / 2]} />
      <group ref={ram} position={[0, 2.1, 0]}><B s={[1.1, 0.5, 1]} c="#5b5f63" /></group>
      <B p={[0, 0.85, 0]} s={[1.1, 0.1, 1]} c="#7b7f83" />
      <Andon p={[0.95, 3.8, 0.5]} />
    </G>
  );
}

// 輸送帶：優化前停住、箱子堆在末端；優化後順暢移動
export function Conveyor({ p = [0, 0, 0], r = 0, len = 10 }: P & { len?: number }) {
  const boxes = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!boxes.current) return;
    const b = live.blend;
    boxes.current.children.forEach((g, i) => {
      const n = boxes.current!.children.length;
      const flowing = ((live.time * 1.2 + (i * len) / n) % len) - len / 2;
      const jammed = len / 2 - 0.4 - (i % 4) * 0.62;
      g.position.x = THREE.MathUtils.lerp(jammed, flowing, b);
      g.position.y = 0.95 + (b < 0.5 ? Math.floor(i / 4) * 0.5 : 0);
      g.rotation.y = (1 - b) * (i * 0.4);
    });
    void dt;
  });
  return (
    <G p={p} r={[0, r, 0]}>
      <B p={[0, 0.85, 0]} s={[len, 0.12, 1]} c="#2f3437" />
      <B p={[0, 0.92, 0.55]} s={[len, 0.12, 0.08]} c={C.safetyYellow} />
      <B p={[0, 0.92, -0.55]} s={[len, 0.12, 0.08]} c={C.safetyYellow} />
      {Array.from({ length: Math.floor(len / 1.5) + 1 }).map((_, i) => (
        <G key={i} p={[-len / 2 + i * 1.5, 0, 0]}>
          <B p={[0, 0.4, -0.45]} s={[0.08, 0.8, 0.08]} c="#555" />
          <B p={[0, 0.4, 0.45]} s={[0.08, 0.8, 0.08]} c="#555" />
        </G>
      ))}
      <group ref={boxes}>
        {Array.from({ length: 8 }).map((_, i) => <group key={i}><Box s={0.55} /></group>)}
      </group>
    </G>
  );
}

export function Whiteboard({ p = [0, 0, 0], r = 0, w = 4 }: P & { w?: number }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <B p={[0, 1.9, 0]} s={[w, 1.6, 0.06]} c="#fafafa" />
      <B p={[0, 1.9, -0.02]} s={[w + 0.12, 1.72, 0.04]} c="#9aa1a6" />
      {Array.from({ length: 14 }).map((_, i) => (
        <B key={i} p={[-w / 2 + 0.35 + (i % 7) * (w - 0.7) / 6, 2.35 - Math.floor(i / 7) * 0.55, 0.04]} s={[0.32, 0.3, 0.01]}
          c={['#f7d55c', '#f29bb0', '#8fd1e8', '#a7dc8a'][i % 4]} shadow={false} r={[0, 0, ((i * 37) % 9 - 4) * 0.04]} />
      ))}
      <B p={[0, 1.05, 0.08]} s={[w, 0.05, 0.12]} c="#9aa1a6" />
    </G>
  );
}

export function Table({ p = [0, 0, 0], r = 0, w = 2, d = 1, c = '#cfc8b8' }: P & { w?: number; d?: number; c?: string }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 0.85, 0]} s={[w, 0.08, d]} c={c} rad={0.03} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => <B key={i} p={[sx * (w / 2 - 0.08), 0.42, sz * (d / 2 - 0.08)]} s={[0.07, 0.84, 0.07]} c="#7c7c76" />)}
    </G>
  );
}

export function Truck({ p = [0, 0, 0], r = 0 }: P) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 1.9, 0]} s={[2.6, 2.6, 7]} c="#eef0f2" rad={0.1} />
      <B p={[0, 1.9, 3.55]} s={[2.62, 2.62, 0.06]} c="#c9ced3" />
      <B p={[0, 0.55, 0]} s={[2.2, 0.3, 7.6]} c="#333" />
      <RB p={[0, 1.4, -4.6]} s={[2.5, 2.1, 2]} c="#2d5bff" rad={0.25} />
      <B p={[0, 1.8, -5.55]} s={[2.2, 0.9, 0.06]} c="#9fc4d6" m={mat('#9fc4d6', { rough: 0.1, metal: 0.3 })} />
      {[[-1.1, -4.4], [1.1, -4.4], [-1.1, 1.8], [1.1, 1.8], [-1.1, 2.9], [1.1, 2.9]].map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.45, z]} rt={0.45} h={0.35} c="#1d1d1d" r={[0, 0, Math.PI / 2]} />
      ))}
    </G>
  );
}

export function RollDoor({ p = [0, 0, 0], r = 0, w = 6, open = 0.7 }: P & { w?: number; open?: number }) {
  return (
    <G p={p} r={[0, r, 0]}>
      <B p={[0, 2.4, -w / 2 - 0.15]} s={[0.4, 4.8, 0.3]} c={C.steel} />
      <B p={[0, 2.4, w / 2 + 0.15]} s={[0.4, 4.8, 0.3]} c={C.steel} />
      <B p={[0, 4.95, 0]} s={[0.5, 0.4, w + 0.6]} c={C.steel} />
      <B p={[0.05, 4.8 - (4.8 * (1 - open)) / 2, 0]} s={[0.1, 4.8 * (1 - open), w]} c="#a9b0b5" />
      {/* 地面警示斜紋 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <B key={i} p={[-1.2, 0.012, -w / 2 + 0.4 + i * (w - 0.8) / 7]} s={[1.8, 0.01, 0.3]} c={i % 2 ? '#222' : C.safetyYellow} shadow={false} r={[0, 0.5, 0]} />
      ))}
    </G>
  );
}

export function ServerRack({ p = [0, 0, 0], r = 0 }: P) {
  return (
    <G p={p} r={[0, r, 0]}>
      <RB p={[0, 1, 0]} s={[0.8, 2, 0.9]} c="#25292d" rad={0.04} />
      {Array.from({ length: 8 }).map((_, i) => (
        <B key={i} p={[0, 0.35 + i * 0.2, 0.46]} s={[0.66, 0.12, 0.02]} c="#3a4046"
          m={mat('#3a4046', { emissive: i % 3 ? '#38d27a' : '#ffb020', ei: 0.4 })} shadow={false} />
      ))}
    </G>
  );
}

export function Plant({ p = [0, 0, 0], s = 1 }: P & { s?: number }) {
  return (
    <G p={p} s={s}>
      <Cyl p={[0, 0.25, 0]} rt={0.22} rb={0.18} h={0.5} c="#d9c8a9" />
      <mesh position={[0, 0.85, 0]} castShadow material={mat('#5f9a5b')}><icosahedronGeometry args={[0.45, 0]} /></mesh>
      <mesh position={[0.15, 1.15, 0.1]} castShadow material={mat('#6faa64')}><icosahedronGeometry args={[0.3, 0]} /></mesh>
    </G>
  );
}

export function Bin({ p = [0, 0, 0], c = '#d24d3b', full = false }: P & { c?: string; full?: boolean }) {
  return (
    <G p={p}>
      <RB p={[0, 0.4, 0]} s={[1, 0.8, 0.8]} c={c} rad={0.06} />
      {full && <>
        <B p={[-0.15, 0.85, 0]} s={[0.3, 0.2, 0.3]} c={C.machine} r={[0.3, 0.4, 0]} />
        <B p={[0.2, 0.88, 0.1]} s={[0.28, 0.2, 0.25]} c="#9aa6ad" r={[0.2, -0.3, 0.2]} />
      </>}
    </G>
  );
}

// 玻璃隔間
export function Glass({ p = [0, 0, 0], s }: P & { s: [number, number, number] }) {
  return (
    <G p={p}>
      <B p={[0, s[1] / 2, 0]} s={s} c="#cfe3f0" m={mat('#cfe3f0', { rough: 0.05, metal: 0.1, opacity: 0.28 })} shadow={false} />
      <B p={[0, s[1], 0]} s={[s[0] + 0.05, 0.08, s[2] + 0.05]} c={C.steelDark} />
      <B p={[0, 0.05, 0]} s={[s[0] + 0.05, 0.1, s[2] + 0.05]} c={C.steelDark} />
    </G>
  );
}
