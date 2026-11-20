import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PEOPLE, ZONES, type Person } from '../../content/factory';
import { live, useApp } from '../../lib/store';
import { mat } from './kit';

/* ---------- 外觀設定 ---------- */
type Look = {
  skin: string;
  pants: string;
  shoes: string;
  hairStyle: 'short' | 'side' | 'bun' | 'bob' | 'bald' | 'crew';
  vest?: boolean; // 反光背心
  collar?: string; // 襯衫領子顏色
  tie?: string;
  glasses?: boolean;
  belly?: number; // 身形
  height?: number;
  hold?: 'clipboard' | 'tablet' | 'papers' | 'phone' | 'wrench' | null;
};
const LOOKS: Record<string, Look> = {
  boss: { skin: '#e9bf98', pants: '#2b2f3a', shoes: '#2a1f18', hairStyle: 'bald', collar: '#ffffff', tie: '#a8323a', belly: 1.12, height: 0.98, hold: 'phone' },
  heir: { skin: '#f0c9a4', pants: '#3a4252', shoes: '#3a2a20', hairStyle: 'side', collar: '#ffffff', glasses: true, height: 1.04, hold: 'tablet' },
  sales: { skin: '#f3cfae', pants: '#4a4f63', shoes: '#2b2b2b', hairStyle: 'bob', collar: '#ffffff', height: 0.95, hold: 'phone' },
  clerk: { skin: '#f2cdb0', pants: '#3c3f52', shoes: '#2b2b2b', hairStyle: 'bun', glasses: true, height: 0.94, hold: 'papers' },
  planner: { skin: '#e8bd94', pants: '#33415a', shoes: '#2b2b2b', hairStyle: 'short', collar: '#d9e6ea', hold: 'papers' },
  manager: { skin: '#dcae84', pants: '#2f3b4a', shoes: '#3a2a20', hairStyle: 'short', vest: true, belly: 1.06, hold: 'clipboard' },
  storekeeper: { skin: '#d8a77c', pants: '#3a4a5a', shoes: '#2b2b2b', hairStyle: 'crew', vest: true, hold: null },
  master: { skin: '#d9a57a', pants: '#3d4654', shoes: '#2b2b2b', hairStyle: 'crew', vest: false, belly: 1.05, height: 0.97, hold: 'wrench' },
  rookie: { skin: '#f0c49a', pants: '#3a4a5a', shoes: '#2b2b2b', hairStyle: 'crew', vest: true, height: 1.03, hold: null },
  operator: { skin: '#dfae80', pants: '#384656', shoes: '#2b2b2b', hairStyle: 'crew', vest: true, hold: null },
  inspector: { skin: '#f2cdb0', pants: '#40455a', shoes: '#2b2b2b', hairStyle: 'bun', glasses: true, height: 0.95, hold: 'clipboard' },
  driver: { skin: '#d49b6c', pants: '#2c3e50', shoes: '#2a1f18', hairStyle: 'crew', vest: true, belly: 1.08, hold: null },
  consultant: { skin: '#f0c9a4', pants: '#26304a', shoes: '#1f1f1f', hairStyle: 'side', collar: '#ffffff', glasses: true, height: 1.02, hold: 'clipboard' },
};
const CARRY = new Set(['storekeeper', 'operator', 'driver', 'rookie']);
const BOUNDS = { x: [-30, 30], z: [-18, 18] };

const caps = new Map<string, THREE.CapsuleGeometry>();
function capsule(r: number, len: number) {
  const k = `${r}|${len}`;
  if (!caps.has(k)) caps.set(k, new THREE.CapsuleGeometry(r, len, 6, 14));
  return caps.get(k)!;
}

function Limb({ r, len, color, y = 0 }: { r: number; len: number; color: string; y?: number }) {
  return <mesh position={[0, y - len / 2 - r * 0.2, 0]} castShadow geometry={capsule(r, len)} material={mat(color, { rough: 0.75 })} />;
}

/* ---------- 臉：表情依心情變化 ---------- */
function Face({ worried }: { worried: React.MutableRefObject<number> }) {
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);
  const smile = useRef<THREE.Mesh>(null);
  const frown = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const w = worried.current;
    if (browL.current && browR.current) {
      browL.current.rotation.z = THREE.MathUtils.lerp(0.08, -0.45, w);
      browR.current.rotation.z = THREE.MathUtils.lerp(-0.08, 0.45, w);
      browL.current.position.y = browR.current.position.y = THREE.MathUtils.lerp(0.085, 0.1, w);
    }
    if (smile.current) smile.current.visible = w < 0.5;
    if (frown.current) frown.current.visible = w >= 0.5;
  });
  const dark = mat('#2a2220');
  return (
    <group position={[0, 0, 0.205]}>
      {/* 眼睛：白底＋黑瞳 */}
      {[-0.075, 0.075].map((x) => (
        <group key={x} position={[x, 0.03, 0]}>
          <mesh scale={[1, 1.15, 0.5]} material={mat('#ffffff', { rough: 0.4 })}><sphereGeometry args={[0.034, 12, 10]} /></mesh>
          <mesh position={[0, -0.004, 0.014]} scale={[1, 1.2, 0.5]} material={dark}><sphereGeometry args={[0.022, 10, 8]} /></mesh>
          <mesh position={[0.008, 0.006, 0.026]} material={mat('#ffffff', { emissive: '#ffffff', ei: 0.4 })}><sphereGeometry args={[0.006, 6, 6]} /></mesh>
        </group>
      ))}
      {/* 眉毛 */}
      <mesh ref={browL} position={[-0.075, 0.085, 0.005]} material={dark}><boxGeometry args={[0.06, 0.012, 0.012]} /></mesh>
      <mesh ref={browR} position={[0.075, 0.085, 0.005]} material={dark}><boxGeometry args={[0.06, 0.012, 0.012]} /></mesh>
      {/* 鼻子 */}
      <mesh position={[0, -0.01, 0.012]} scale={[1, 1.1, 0.9]} material={mat('#d99c78')}><sphereGeometry args={[0.018, 8, 6]} /></mesh>
      {/* 嘴：笑／張嘴 */}
      <mesh ref={smile} position={[0, -0.065, -0.004]} rotation={[0, 0, Math.PI]} material={mat('#8a3b2e')}><torusGeometry args={[0.03, 0.007, 6, 12, Math.PI]} /></mesh>
      <mesh ref={frown} position={[0, -0.072, 0]} scale={[1, 1.3, 0.5]} material={mat('#6b2a22')} visible={false}><sphereGeometry args={[0.02, 10, 8]} /></mesh>
      {/* 腮紅 */}
      {[-0.11, 0.11].map((x) => <mesh key={x} position={[x, -0.035, -0.02]} scale={[1.3, 0.8, 0.3]} material={mat('#f29c8f', { opacity: 0.55 })}><sphereGeometry args={[0.022, 8, 6]} /></mesh>)}
    </group>
  );
}

function Hair({ style, color }: { style: Look['hairStyle']; color: string }) {
  const m = mat(color, { rough: 0.6 });
  if (style === 'bald') return (
    <group>
      <mesh position={[0, -0.02, -0.03]} scale={[1.02, 0.55, 1]} material={mat('#c9c9c9', { rough: 0.7 })}><torusGeometry args={[0.19, 0.045, 8, 18, Math.PI * 1.25]} /></mesh>
    </group>
  );
  return (
    <group>
      <mesh position={[0, 0.045, -0.015]} scale={[1.03, style === 'crew' ? 0.78 : 0.92, 1.03]} material={m} castShadow>
        <sphereGeometry args={[0.215, 18, 12, 0, Math.PI * 2, 0, Math.PI / 1.85]} />
      </mesh>
      {style === 'side' && <mesh position={[-0.06, 0.16, 0.12]} rotation={[0.5, 0, 0.5]} scale={[1.6, 0.5, 0.8]} material={m}><sphereGeometry args={[0.07, 10, 8]} /></mesh>}
      {style === 'bob' && (
        <>
          <mesh position={[0, -0.04, -0.03]} scale={[1.12, 0.95, 1.05]} material={m}><sphereGeometry args={[0.2, 16, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.45]} /></mesh>
          <mesh position={[0, 0.12, 0.15]} rotation={[0.9, 0, 0]} scale={[1.8, 0.45, 0.7]} material={m}><sphereGeometry args={[0.08, 10, 8]} /></mesh>
        </>
      )}
      {style === 'bun' && <mesh position={[0, 0.16, -0.17]} material={m} castShadow><sphereGeometry args={[0.085, 12, 10]} /></mesh>}
    </group>
  );
}

function HardHat({ color }: { color: string }) {
  const m = mat(color, { rough: 0.35 });
  return (
    <group position={[0, 0.07, 0]}>
      <mesh castShadow material={m} scale={[1, 0.9, 1.05]}><sphereGeometry args={[0.23, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh position={[0, 0.005, 0.05]} scale={[1, 1, 1.12]} material={m}><cylinderGeometry args={[0.265, 0.27, 0.025, 22]} /></mesh>
      <mesh position={[0, 0.17, 0]} material={m}><boxGeometry args={[0.05, 0.05, 0.36]} /></mesh>
      <mesh position={[0, -0.01, 0]} material={mat('#3a3a3a')}><torusGeometry args={[0.215, 0.012, 6, 20]} /></mesh>
    </group>
  );
}

function Held({ kind }: { kind: Look['hold'] }) {
  if (kind === 'clipboard') return (
    <group position={[0.02, -0.08, 0.1]} rotation={[-0.4, 0, 0]}>
      <mesh material={mat('#9a6b3c')} castShadow><boxGeometry args={[0.2, 0.27, 0.015]} /></mesh>
      <mesh position={[0, -0.01, 0.009]} material={mat('#ffffff')}><boxGeometry args={[0.17, 0.21, 0.004]} /></mesh>
      <mesh position={[0, 0.12, 0.012]} material={mat('#b9bec2', { metal: 0.6, rough: 0.3 })}><boxGeometry args={[0.08, 0.03, 0.01]} /></mesh>
    </group>
  );
  if (kind === 'tablet') return (
    <group position={[0.02, -0.08, 0.1]} rotation={[-0.6, 0, 0]}>
      <mesh material={mat('#26292d')} castShadow><boxGeometry args={[0.24, 0.17, 0.014]} /></mesh>
      <mesh position={[0, 0, 0.008]} material={mat('#7fb2ff', { emissive: '#5a8dff', ei: 0.6 })}><boxGeometry args={[0.21, 0.14, 0.002]} /></mesh>
    </group>
  );
  if (kind === 'papers') return (
    <group position={[0.02, -0.08, 0.08]} rotation={[-0.3, 0, 0.1]}>
      {[0, 1, 2].map((i) => <mesh key={i} position={[i * 0.01, i * 0.008, i * 0.004]} rotation={[0, 0, i * 0.15]} material={mat(i === 1 ? '#f7e6a8' : '#f4f1ea')}><boxGeometry args={[0.18, 0.24, 0.004]} /></mesh>)}
    </group>
  );
  if (kind === 'phone') return (
    <group position={[0, -0.05, 0.06]} rotation={[-0.9, 0, 0]}>
      <mesh material={mat('#1d1f22')}><boxGeometry args={[0.06, 0.11, 0.012]} /></mesh>
    </group>
  );
  if (kind === 'wrench') return (
    <group position={[0, -0.12, 0.02]} rotation={[0, 0, 0.2]}>
      <mesh material={mat('#9aa3aa', { metal: 0.7, rough: 0.3 })}><boxGeometry args={[0.03, 0.26, 0.015]} /></mesh>
      <mesh position={[0, 0.14, 0]} material={mat('#9aa3aa', { metal: 0.7, rough: 0.3 })}><torusGeometry args={[0.03, 0.012, 6, 10, Math.PI * 1.5]} /></mesh>
    </group>
  );
  return null;
}

function zoneCenter(id: string): [number, number] {
  const z = ZONES.find((zz) => zz.id === id);
  return z ? z.center : [0, 0];
}

/* ---------- 一個人 ---------- */
function Human({ person }: { person: Person }) {
  const look = LOOKS[person.id] ?? LOOKS.operator;
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const box = useRef<THREE.Group>(null);
  const held = useRef<THREE.Group>(null);
  const sweat = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const worried = useRef(1);

  const mode = useApp((s) => s.mode);
  const labels = useApp((s) => s.labels);
  const selected = useApp((s) => s.personId === person.id);
  const focusPerson = useApp((s) => s.focusPerson);

  const st = useMemo(() => {
    const [cx, cz] = person.route[0];
    return { x: cx, z: cz, heading: 0, seg: 0, target: [cx, cz] as [number, number], wait: 0, phase: Math.random() * 10, speed: 0, look: 0, gesture: 0 };
  }, [person]);
  const home = useMemo(() => zoneCenter(person.zone), [person]);
  const H = look.height ?? 1;
  const belly = look.belly ?? 1;

  useFrame((_, dtRaw) => {
    if (!root.current) return;
    const paused = useApp.getState().paused;
    const dt = paused ? 0 : Math.min(dtRaw, 0.05);
    const b = live.blend;
    const panic = b < 0.5;
    worried.current += ((panic ? 1 : 0) - worried.current) * Math.min(1, dt * 3);
    const isSel = useApp.getState().personId === person.id;

    // 目標點：優化前在自己的區域附近焦慮地走走停停；優化後照路線工作
    if (panic) {
      const d = Math.hypot(st.target[0] - st.x, st.target[1] - st.z);
      if (d < 0.35) {
        if (st.wait <= 0) { st.wait = 0.9 + Math.random() * 1.6; st.gesture = Math.random() < 0.5 ? 1 : 2; }
        st.wait -= dt;
        if (st.wait <= 0) {
          const spread = 6.5;
          st.target = [
            THREE.MathUtils.clamp(home[0] + (Math.random() - 0.5) * spread * 2, BOUNDS.x[0], BOUNDS.x[1]),
            THREE.MathUtils.clamp(home[1] + (Math.random() - 0.5) * spread * 2, BOUNDS.z[0], BOUNDS.z[1]),
          ];
          st.gesture = 0;
        }
      }
    } else {
      st.gesture = 0; st.wait = 0;
      const wp = person.route[st.seg % person.route.length];
      st.target = wp;
      if (Math.hypot(wp[0] - st.x, wp[1] - st.z) < 0.3) st.seg++;
    }

    // 被選取時放慢，方便看清楚
    const moving = Math.hypot(st.target[0] - st.x, st.target[1] - st.z) > 0.35;
    const targetSpeed = !moving ? 0 : (panic ? 2.0 : 1.5) * (isSel ? 0.6 : 1);
    st.speed += (targetSpeed - st.speed) * Math.min(1, dt * 4);
    const dx = st.target[0] - st.x, dz = st.target[1] - st.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.01 && st.speed > 0.01) {
      const step = Math.min(dist, st.speed * dt);
      st.x += (dx / dist) * step; st.z += (dz / dist) * step;
      const desired = Math.atan2(dx, dz);
      let diff = desired - st.heading;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      st.heading += diff * Math.min(1, dt * 7);
    }
    const walk = st.speed / 1.6;
    st.phase += dt * (5 + walk * 5) * Math.min(1, walk + 0.05);
    root.current.position.set(st.x, 0, st.z);
    root.current.rotation.y = st.heading;
    live.people.set(person.id, { x: st.x, z: st.z });

    const swing = Math.sin(st.phase) * Math.min(1, walk);
    if (legL.current && legR.current) { legL.current.rotation.x = swing * 0.6; legR.current.rotation.x = -swing * 0.6; }

    const carrying = !panic && CARRY.has(person.id);
    const t = live.time;
    if (armL.current && armR.current && foreL.current && foreR.current) {
      if (panic && st.gesture === 1) {
        // 抱頭
        armL.current.rotation.set(-2.6, 0, 0.55); armR.current.rotation.set(-2.6, 0, -0.55);
        foreL.current.rotation.set(-1.6, 0, 0); foreR.current.rotation.set(-1.6, 0, 0);
      } else if (panic && st.gesture === 2) {
        // 攤手／揮手
        const w = Math.sin(t * 7 + st.phase);
        armL.current.rotation.set(-0.5, 0, 0.9 + w * 0.2); armR.current.rotation.set(-0.5, 0, -0.9 - w * 0.2);
        foreL.current.rotation.set(-0.9, 0, 0); foreR.current.rotation.set(-0.9, 0, 0);
      } else if (carrying) {
        armL.current.rotation.set(-0.9, 0, 0.12); armR.current.rotation.set(-0.9, 0, -0.12);
        foreL.current.rotation.set(-0.7, 0, 0); foreR.current.rotation.set(-0.7, 0, 0);
      } else if (look.hold && look.hold !== 'wrench') {
        armL.current.rotation.set(-swing * 0.4, 0, 0.06);
        armR.current.rotation.set(-0.5, 0, -0.06); foreR.current.rotation.set(-1.1, 0, 0);
        foreL.current.rotation.set(-0.15, 0, 0);
      } else {
        armL.current.rotation.set(-swing * 0.45, 0, 0.06); armR.current.rotation.set(swing * 0.45, 0, -0.06);
        foreL.current.rotation.set(-0.2 - Math.max(0, swing) * 0.2, 0, 0); foreR.current.rotation.set(-0.2 - Math.max(0, -swing) * 0.2, 0, 0);
      }
    }
    if (body.current) {
      body.current.position.y = Math.abs(Math.cos(st.phase)) * 0.04 * Math.min(1, walk);
      body.current.rotation.x = panic ? 0.08 : 0.02;
    }
    if (head.current) {
      // 優化前停下來東張西望
      const lookAround = panic && !moving ? Math.sin(t * 2.4 + st.phase) * 0.7 : 0;
      head.current.rotation.y += (lookAround - head.current.rotation.y) * Math.min(1, dt * 5);
      head.current.rotation.x = panic && st.gesture === 1 ? 0.25 : 0;
    }
    if (box.current) box.current.visible = carrying;
    if (held.current) held.current.visible = !carrying && !(panic && st.gesture === 1);
    if (sweat.current) {
      sweat.current.visible = panic;
      sweat.current.position.y = 0.05 + ((t * 0.6 + st.phase) % 1) * -0.15;
      sweat.current.scale.setScalar(1 - ((t * 0.6 + st.phase) % 1) * 0.5);
    }
    if (ring.current) { ring.current.visible = isSel; ring.current.rotation.z += dt * 1.2; }
  });

  const shirt = person.shirt;
  const vestC = '#ff8a1e';
  const torsoW = 0.21 * belly;
  return (
    <group ref={root}
      onClick={(e) => { e.stopPropagation(); focusPerson(person.id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}
    >
      {/* 加大的點擊範圍 */}
      <mesh position={[0, 1, 0]} visible={false}><cylinderGeometry args={[0.65, 0.65, 2.2, 8]} /></mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false}>
        <ringGeometry args={[0.55, 0.7, 40, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color="#1c1f24" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.32, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      <group ref={body} scale={[1, H, 1]}>
        {/* 腿＋鞋 */}
        {[[-0.09, legL], [0.09, legR]].map(([x, ref]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.78, 0]}>
            <Limb r={0.075} len={0.55} color={look.pants} />
            <mesh position={[0, -0.74, 0.04]} castShadow material={mat(look.shoes, { rough: 0.5 })} scale={[1, 0.6, 1.5]}><sphereGeometry args={[0.085, 12, 8]} /></mesh>
          </group>
        ))}
        {/* 腰帶 */}
        <mesh position={[0, 0.8, 0]} scale={[belly, 1, 0.72 * belly]} material={mat('#2a2a2a')}><cylinderGeometry args={[0.2, 0.2, 0.05, 20]} /></mesh>
        {/* 軀幹 */}
        <mesh position={[0, 1.08, 0]} scale={[1, 1, 0.72]} castShadow geometry={capsule(torsoW, 0.3)} material={mat(shirt, { rough: 0.8 })} />
        {look.vest && (
          <group position={[0, 1.07, 0]}>
            <mesh scale={[1.04, 0.92, 0.76]} geometry={capsule(torsoW, 0.26)} material={mat(vestC, { rough: 0.55 })} castShadow />
            {[0.98, 1.16].map((y) => <mesh key={y} position={[0, y - 1.07, 0]} scale={[1.06, 1, 0.78]} material={mat('#e6e9ec', { metal: 0.6, rough: 0.25 })}><cylinderGeometry args={[torsoW + 0.005, torsoW + 0.005, 0.035, 20, 1, true]} /></mesh>)}
          </group>
        )}
        {look.collar && (
          <group position={[0, 1.33, 0.07]}>
            <mesh rotation={[0.3, 0, 0.6]} position={[-0.045, 0, 0]} material={mat(look.collar)}><boxGeometry args={[0.09, 0.02, 0.06]} /></mesh>
            <mesh rotation={[0.3, 0, -0.6]} position={[0.045, 0, 0]} material={mat(look.collar)}><boxGeometry args={[0.09, 0.02, 0.06]} /></mesh>
            {look.tie && <mesh position={[0, -0.13, 0.06]} material={mat(look.tie)}><boxGeometry args={[0.045, 0.22, 0.015]} /></mesh>}
          </group>
        )}
        {!look.vest && !look.collar && <mesh position={[0, 1.28, 0.08]} scale={[1, 0.6, 0.5]} material={mat('#ffffff', { rough: 0.9 })}><sphereGeometry args={[0.07, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>}
        {/* 脖子 */}
        <mesh position={[0, 1.38, 0]} material={mat(look.skin)}><cylinderGeometry args={[0.06, 0.07, 0.1, 12]} /></mesh>

        {/* 手臂：上臂＋前臂＋手 */}
        {[[-1, armL, foreL], [1, armR, foreR]].map(([side, upper, fore]) => (
          <group key={side as number} ref={upper as React.RefObject<THREE.Group>} position={[(side as number) * (torsoW + 0.07), 1.3, 0]}>
            <Limb r={0.06} len={0.2} color={look.vest ? shirt : shirt} />
            <group ref={fore as React.RefObject<THREE.Group>} position={[0, -0.3, 0]}>
              <Limb r={0.055} len={0.17} color={look.skin} />
              <mesh position={[0, -0.27, 0.01]} castShadow material={mat(look.skin)} scale={[0.9, 1.1, 0.8]}><sphereGeometry args={[0.06, 10, 8]} /></mesh>
              {(side as number) === 1 && <group ref={held} position={[0, -0.28, 0]}><Held kind={look.hold ?? null} /></group>}
            </group>
          </group>
        ))}

        {/* 頭 */}
        <group ref={head} position={[0, 1.62, 0]}>
          <mesh castShadow scale={[1, 1.04, 0.98]} material={mat(look.skin, { rough: 0.7 })}><sphereGeometry args={[0.215, 24, 18]} /></mesh>
          {[-1, 1].map((sx) => <mesh key={sx} position={[sx * 0.21, 0, 0]} scale={[0.5, 1, 0.8]} material={mat(look.skin)}><sphereGeometry args={[0.05, 8, 6]} /></mesh>)}
          <Face worried={worried} />
          {look.glasses && (
            <group position={[0, 0.03, 0.215]}>
              {[-0.075, 0.075].map((x) => <mesh key={x} position={[x, 0, 0]} material={mat('#1d1f22')}><torusGeometry args={[0.045, 0.008, 6, 18]} /></mesh>)}
              <mesh material={mat('#1d1f22')}><boxGeometry args={[0.06, 0.008, 0.008]} /></mesh>
            </group>
          )}
          {person.hat ? <HardHat color={person.hat} /> : <Hair style={look.hairStyle} color={person.hair} />}
          {/* 冷汗 */}
          <group ref={sweat} position={[0.2, 0.05, 0.1]} visible={false}>
            <mesh material={mat('#8fd3ff', { rough: 0.1, emissive: '#bfe8ff', ei: 0.4 })} scale={[0.8, 1.2, 0.8]}><sphereGeometry args={[0.04, 10, 8]} /></mesh>
          </group>
        </group>

        {/* 搬運的箱子 */}
        <group ref={box} position={[0, 1.0, 0.33]} visible={false}>
          <mesh castShadow material={mat('#c7a172')}><boxGeometry args={[0.46, 0.36, 0.36]} /></mesh>
          <mesh position={[0, 0.181, 0]} material={mat('#b38d5f')}><boxGeometry args={[0.08, 0.002, 0.361]} /></mesh>
        </group>
      </group>

      {/* 名牌與驚嘆號 */}
      <Html position={[0, 2.35 * H, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col items-center gap-1">
          {mode === 'before' && <div className="grid h-6 w-6 place-items-center rounded-[6px] bg-orange text-[13px] font-black text-ink shadow-md">!</div>}
          {(labels || selected) && (
            <div className={`whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-bold shadow-md ${selected ? 'bg-ink text-white' : 'bg-white text-ink'}`}>
              {person.name}<span className="ml-1 font-bold opacity-60">{person.role}</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export default function People() {
  return <group>{PEOPLE.map((p) => <Human key={p.id} person={p} />)}</group>;
}
