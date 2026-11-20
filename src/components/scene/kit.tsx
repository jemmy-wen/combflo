import * as THREE from 'three';
import { useMemo, type ReactNode } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

// ---------- 材質快取：同顏色共用同一個材質 ----------
const cache = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: string, opts: { rough?: number; metal?: number; emissive?: string; ei?: number; opacity?: number } = {}) {
  const key = `${color}|${opts.rough ?? 0.82}|${opts.metal ?? 0}|${opts.emissive ?? ''}|${opts.ei ?? 0}|${opts.opacity ?? 1}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color, roughness: opts.rough ?? 0.82, metalness: opts.metal ?? 0,
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined, emissiveIntensity: opts.ei ?? 0,
      transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1, envMapIntensity: 0.45,
    });
    cache.set(key, m);
  }
  return m;
}

// ---------- 會隨模式漸變的材質（Director 每幀更新） ----------
type Blendable = { m: THREE.MeshStandardMaterial; before: THREE.Color; after: THREE.Color; duskB?: THREE.Color; duskA?: THREE.Color };
export const blendables: Blendable[] = [];
export function blendMat(before: string, after: string, opts: { rough?: number; metal?: number; map?: THREE.Texture | null } = {}) {
  const m = new THREE.MeshStandardMaterial({ color: before, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0, map: opts.map ?? null, envMapIntensity: 0.35 });
  blendables.push({ m, before: new THREE.Color(before), after: new THREE.Color(after) });
  return m;
}

// 鐵皮浪板紋理
export function corrugatedTexture(base = '#ffffff', repeat = 18) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 4;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, '#9a9a9a'); grad.addColorStop(0.25, base); grad.addColorStop(0.5, '#b8b8b8');
  grad.addColorStop(0.75, base); grad.addColorStop(1, '#9a9a9a');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 4);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// 水泥地面紋理（細微斑駁＋伸縮縫）
export function concreteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const v = 225 + Math.random() * 30;
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  g.strokeStyle = 'rgba(150,150,150,0.55)'; g.lineWidth = 2;
  g.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 5);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- 基本幾何 ----------
type BoxProps = { p?: [number, number, number]; s: [number, number, number]; c: string; r?: [number, number, number]; m?: THREE.Material; shadow?: boolean } & Omit<ThreeElements['mesh'], 'position' | 'scale' | 'rotation'>;
export function B({ p = [0, 0, 0], s, c, r, m, shadow = true, ...rest }: BoxProps) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow material={m ?? mat(c)} {...rest}>
      <boxGeometry args={s} />
    </mesh>
  );
}
export function Cyl({ p = [0, 0, 0], rt, rb, h, c, r, seg = 16, m }: { p?: [number, number, number]; rt: number; rb?: number; h: number; c: string; r?: [number, number, number]; seg?: number; m?: THREE.Material }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow material={m ?? mat(c)}>
      <cylinderGeometry args={[rt, rb ?? rt, h, seg]} />
    </mesh>
  );
}
export function G({ p = [0, 0, 0], r, s, children }: { p?: [number, number, number]; r?: [number, number, number]; s?: number; children: ReactNode }) {
  return <group position={p} rotation={r} scale={s}>{children}</group>;
}

// 鋼構 H 型柱
export function HBeam({ p, h, c = '#3f5873' }: { p: [number, number, number]; h: number; c?: string }) {
  return (
    <G p={p}>
      <B p={[0, h / 2, 0]} s={[0.12, h, 0.5]} c={c} />
      <B p={[0.22, h / 2, 0]} s={[0.06, h, 0.5]} c={c} />
      <B p={[-0.22, h / 2, 0]} s={[0.06, h, 0.5]} c={c} />
      <B p={[0, 0.08, 0]} s={[0.8, 0.16, 0.8]} c="#8a8a84" />
    </G>
  );
}

// 共用色票
export const C = {
  steel: '#3f5873',
  steelDark: '#2b3a4c',
  safetyYellow: '#f2c230',
  orange: '#e8743b',
  machine: '#7f9aa6',
  machineDark: '#4d5f68',
  green: '#4f8a63',
  wood: '#b98a57',
  paper: '#f4f1ea',
  cardboard: '#c7a172',
  white: '#f2f2ee',
  desk: '#d9d2c3',
  blue: '#2d5bff',
  red: '#e0533a',
};

export function useOnce<T>(fn: () => T) {
  return useMemo(fn, []);
}

// 圓角方塊：主要機具與家具用，讓造型柔和一點
export function RB({ p = [0, 0, 0], s, c, r, rad = 0.06, m }: { p?: [number, number, number]; s: [number, number, number]; c: string; r?: [number, number, number]; rad?: number; m?: THREE.Material }) {
  return (
    <RoundedBox args={s} radius={Math.min(rad, Math.min(...s) / 2 - 0.001)} smoothness={3} position={p} rotation={r} castShadow receiveShadow material={m ?? mat(c)} />
  );
}

// 文字貼圖（布條、標示牌）
const textCache = new Map<string, THREE.CanvasTexture>();
export function textTexture(text: string, bg: string, fg: string, w = 512, h = 128, size = 72) {
  const key = `${text}|${bg}|${fg}|${w}|${h}|${size}`;
  let t = textCache.get(key);
  if (!t) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.font = `900 ${size}px "Noto Sans TC", "PingFang TC", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 4);
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    textCache.set(key, t);
  }
  return t;
}
