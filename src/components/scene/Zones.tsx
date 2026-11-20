// 七個環節的陳設、可點擊範圍、優化前的雜亂物件與優化後的地面標線
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { B, G, mat, C } from './kit';
import {
  Andon, Bin, Box, Cabinet, Chair, CNC, Conveyor, Desk, Forklift, Glass, Lathe, Pallet, PaperPile, Plant,
  Press, Rack, RollDoor, Screen, ServerRack, Table, Truck, Whiteboard,
} from './Props';
import { ZONES } from '../../content/factory';
import { live, useApp } from '../../lib/store';

// 依 blend 顯示／隱藏：before = 優化前才出現；after = 優化後才出現
function Phase({ show, children }: { show: 'before' | 'after'; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const v = show === 'before' ? 1 - live.blend : live.blend;
    const s = THREE.MathUtils.smoothstep(v, 0, 1);
    ref.current.visible = s > 0.02;
    ref.current.scale.setScalar(0.4 + 0.6 * s);
    ref.current.position.y = (1 - s) * -0.3;
  });
  return <group ref={ref}>{children}</group>;
}

// 地面標線（優化後漸漸出現）
function FloorLines() {
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame(() => { mats.current.forEach((m) => m && (m.opacity = live.blend * 0.95)); });
  // [x, z, 長, 寬]：主走道兩側的黃線
  const lines: [number, number, number, number][] = [[-1, -6.2, 62, 0.14], [-1, 0.2, 62, 0.14]];
  return (
    <group position={[0, 0.015, 0]}>
      {lines.map(([x, z, l, w], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}>
          <planeGeometry args={[l, w]} />
          <meshStandardMaterial ref={(m) => { if (m) mats.current[i] = m; }} color={C.safetyYellow} transparent opacity={0} />
        </mesh>
      ))}
      <ZoneOutlines />
    </group>
  );
}

function ZoneOutlines() {
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame(() => { mats.current.forEach((m) => m && (m.opacity = live.blend * 0.9)); });
  let k = 0;
  return (
    <>
      {ZONES.map((z) => {
        const [cx, cz] = z.center; const [w, d] = z.size;
        const edges: [number, number, number, number][] = [
          [cx, cz - d / 2 + 0.3, w - 0.6, 0.1], [cx, cz + d / 2 - 0.3, w - 0.6, 0.1],
          [cx - w / 2 + 0.3, cz, 0.1, d - 0.6], [cx + w / 2 - 0.3, cz, 0.1, d - 0.6],
        ];
        return edges.map(([x, zz, ew, ed]) => {
          const i = k++;
          return (
            <mesh key={`${z.id}${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, zz]}>
              <planeGeometry args={[ew, ed]} />
              <meshStandardMaterial ref={(m) => { if (m) mats.current[i] = m; }} color="#ffffff" transparent opacity={0} />
            </mesh>
          );
        });
      })}
      {/* 流程箭頭：沿主走道 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const idx = k++;
        return (
          <mesh key={`arr${i}`} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={[-26 + i * 4.6, 0.012, -3]}>
            <circleGeometry args={[0.55, 3]} />
            <meshStandardMaterial ref={(m) => { if (m) mats.current[idx] = m; }} color="#1fae63" transparent opacity={0} />
          </mesh>
        );
      })}
    </>
  );
}

// 可點擊的環節範圍＋滑過時的地面亮色
function ZoneHit({ id, center, size }: { id: string; center: [number, number]; size: [number, number] }) {
  const ref = useRef<THREE.MeshBasicMaterial>(null);
  const hover = useApp((s) => s.hoverZone === id);
  const active = useApp((s) => s.zoneId === id);
  const focusZone = useApp((s) => s.focusZone);
  const set = useApp((s) => s.set);
  useFrame(() => {
    if (!ref.current) return;
    const target = active ? 0.07 : hover ? 0.06 : 0;
    ref.current.opacity += (target - ref.current.opacity) * 0.15;
    ref.current.color.set(live.blend > 0.5 ? '#1fae63' : '#ffd2bd');
  });
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]} position={[center[0], 0.03, center[1]]}
      onPointerOver={(e) => { e.stopPropagation(); set({ hoverZone: id }); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { set({ hoverZone: null }); document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); focusZone(id); }}
    >
      <planeGeometry args={[size[0] - 0.4, size[1] - 0.4]} />
      <meshBasicMaterial ref={ref} color="#ff6a2b" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function Forklifter() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const b = live.blend;
    const t = live.time * 0.18;
    // 優化後：在倉庫與產線之間來回；優化前：歪停在走道中間
    const x = THREE.MathUtils.lerp(0.5, 6 + Math.sin(t) * 8, b);
    const z = THREE.MathUtils.lerp(-3.4, -3.2, b);
    ref.current.position.set(x, 0, z);
    ref.current.rotation.y = THREE.MathUtils.lerp(0.8, Math.cos(t) > 0 ? -Math.PI / 2 : Math.PI / 2, b);
  });
  return <group ref={ref}><Forklift /></group>;
}

export default function Zones() {
  return (
    <group>
      {ZONES.map((z) => <ZoneHit key={z.id} id={z.id} center={z.center} size={z.size} />)}
      <FloorLines />

      {/* 01 業務辦公室：玻璃隔間＋辦公桌 */}
      <G p={[-23, 0, -12]}>
        <Glass p={[0, 0, 6]} s={[16, 2.6, 0.08]} />
        <Glass p={[8, 0, 0]} s={[0.08, 2.6, 12]} />
        <B p={[0, 0.02, 0]} s={[15.6, 0.04, 11.6]} c="#b7c2c7" shadow={false} />
        <Desk p={[-4, 0, -2.5]} /><Desk p={[-0.5, 0, -2.5]} /><Desk p={[3, 0, -2.5]} />
        <Desk p={[-4, 0, 2]} r={Math.PI} /><Desk p={[-0.5, 0, 2]} r={Math.PI} /><Desk p={[3, 0, 2]} r={Math.PI} />
        <Cabinet p={[-7.2, 0, -5.4]} /><Cabinet p={[-6.2, 0, -5.4]} /><Cabinet p={[-5.2, 0, -5.4]} />
        <Plant p={[6.8, 0, -5]} /><Plant p={[-7.2, 0, 4.8]} s={0.8} />
        <Phase show="before">
          <PaperPile p={[-4.4, 0.77, -2.5]} n={8} /><PaperPile p={[3.4, 0.77, -2.4]} n={10} /><PaperPile p={[-0.9, 0.77, 2.1]} n={7} />
          <PaperPile p={[1.6, 0, 4.2]} n={5} /><PaperPile p={[-6, 0, 0.5]} n={9} /><Box p={[5.6, 0, 3.6]} r={0.4} /><Box p={[6.2, 0, 2.6]} r={1} s={0.55} />
        </Phase>
      </G>

      {/* 02 生管室：排程白板 */}
      <G p={[-8, 0, -12]}>
        <Glass p={[0, 0, 6]} s={[12, 2.6, 0.08]} />
        <Whiteboard p={[-3, 0, -5.5]} w={5} />
        <Whiteboard p={[3, 0, -5.5]} w={4} />
        <Desk p={[-2.5, 0, 0.5]} /><Desk p={[2, 0, 0.5]} />
        <Table p={[0, 0, 3.6]} w={3} d={1.2} />
        <Chair p={[-0.8, 0, 4.5]} r={Math.PI} /><Chair p={[0.8, 0, 4.5]} r={Math.PI} />
        <Phase show="before">
          <PaperPile p={[0, 0.88, 3.6]} n={9} /><PaperPile p={[-3.2, 0, -3.8]} n={6} /><Box p={[4.6, 0, 3.8]} r={0.7} s={0.6} />
        </Phase>
        <Phase show="after"><Screen p={[0, 0.88, 3.4]} w={1.4} h={0.8} /></Phase>
      </G>

      {/* 03 原料倉庫：料架、棧板、堆高機 */}
      <G p={[9, 0, -12]}>
        <Rack p={[-4, 0, -4.8]} len={8} />
        <Rack p={[5, 0, -4.8]} len={6} fill={0.6} />
        <Rack p={[-4, 0, 0.2]} len={8} fill={0.5} />
        <Pallet p={[5, 0, 1]} /><Pallet p={[6.6, 0, 1]} load={false} />
        <Phase show="before">
          <Pallet p={[1.8, 0, 3.6]} r={0.5} /><Pallet p={[3.5, 0, 4.4]} r={-0.3} />
          <Box p={[0.5, 0, 4.5]} r={0.3} /><Box p={[-1.2, 0, 4.2]} r={1.1} /><Box p={[-0.4, 0.56, 4.4]} r={0.6} s={0.55} />
        </Phase>
        <Phase show="after">
          {[-6, -4.5, -3, -1.5].map((x) => <B key={x} p={[x, 0.016, 3.8]} s={[1.2, 0.01, 1.2]} c="#1fae63" shadow={false} />)}
        </Phase>
      </G>
      <Forklifter />

      {/* 04 加工產線：CNC、車床、沖床、輸送帶 */}
      <G p={[-2, 0, 8]}>
        <CNC p={[-10, 0, -2.5]} /><CNC p={[-6.5, 0, -2.5]} c="#86a1ad" /><CNC p={[-3, 0, -2.5]} />
        <Lathe p={[-9, 0, 3.5]} /><Lathe p={[-4.5, 0, 3.5]} />
        <Press p={[1.5, 0, -2.5]} /><Press p={[4.5, 0, -2.5]} />
        <Conveyor p={[5, 0, 3.5]} len={10} />
        <Andon p={[10.5, 0, -5.5]} />
        <Phase show="before">
          <Box p={[-7.8, 0, 0.6]} r={0.5} /><Box p={[-1.5, 0, 1]} r={1.2} s={0.6} /><PaperPile p={[-1.2, 0, 5.6]} n={4} />
          <Pallet p={[0.8, 0, 6]} r={0.7} /><Box p={[9.6, 0, 6]} r={0.2} />
        </Phase>
        <Phase show="after">
          <Table p={[-1.2, 0, 5.4]} w={1.6} d={0.8} c="#d8dee3" />
          <B p={[-1.2, 1.25, 5.05]} s={[1.2, 0.8, 0.04]} c="#ffffff" />
        </Phase>
      </G>

      {/* 05 品管區：檢驗桌、不良品箱 */}
      <G p={[17, 0, 8]}>
        <Table p={[-1, 0, -3.5]} w={3} d={1.2} c="#e6e6e0" />
        <Table p={[-1, 0, 0]} w={3} d={1.2} c="#e6e6e0" />
        <B p={[-1.6, 1.0, -3.5]} s={[0.5, 0.25, 0.35]} c="#5b6b78" />
        <B p={[-0.4, 0.95, 0]} s={[0.35, 0.15, 0.35]} c="#5b6b78" />
        <Screen p={[0.2, 0.88, -3.8]} w={0.5} h={0.32} />
        <Cabinet p={[3.5, 0, -5.5]} h={1.8} />
        <Phase show="before">
          <Bin p={[2.4, 0, 3.4]} full /><Bin p={[1, 0, 4.4]} full /><Bin p={[2.6, 0, 5.2]} full />
          <Pallet p={[-2.5, 0, 4.5]} r={0.4} /><PaperPile p={[-1.6, 0.88, 0.1]} n={7} />
        </Phase>
        <Phase show="after"><Bin p={[2.4, 0, 3.4]} c="#3e9d6b" /></Phase>
      </G>

      {/* 06 出貨碼頭：捲門、貨車、出貨棧板 */}
      <RollDoor p={[32, 0, -10.5]} w={6.5} open={0.75} />
      <RollDoor p={[32, 0, 2.5]} w={6.5} open={0.75} />
      <Truck p={[38, 0, 2.5]} r={Math.PI / 2} />
      <G p={[28, 0, 0]}>
        <Pallet p={[-1, 0, -9]} /><Pallet p={[1, 0, -9]} />
        <Table p={[-1.5, 0, -5]} w={1.6} d={0.8} />
        <Table p={[-1.5, 0, 8]} w={1.6} d={0.8} />
        <Screen p={[-1.5, 0.88, 8]} w={0.5} h={0.3} />
        <Phase show="before">
          <Pallet p={[0.5, 0, 3]} r={0.9} /><Pallet p={[-1.5, 0, 5]} r={0.3} /><Box p={[1.5, 0, 6]} r={0.6} /><Box p={[0, 0, 12]} r={1} />
          <PaperPile p={[-1.5, 0.88, -5]} n={9} />
        </Phase>
        <Phase show="after">
          <Pallet p={[1.5, 0, 2.5]} /><Pallet p={[1.5, 0, 4]} />
          {[2.5, 4].map((z) => <B key={z} p={[1.5, 0.016, z]} s={[1.5, 0.01, 1.4]} c="#1fae63" shadow={false} />)}
        </Phase>
      </G>

      {/* 07 會議室：系統導入 */}
      <G p={[-24, 0, 8]}>
        <Glass p={[7, 0, 0]} s={[0.08, 2.6, 14]} />
        <Glass p={[0, 0, -7]} s={[14, 2.6, 0.08]} />
        <B p={[0, 0.02, 0]} s={[13.6, 0.04, 13.6]} c="#c9c0b1" shadow={false} />
        <Table p={[0, 0, 1]} w={5} d={2} c="#b98a57" />
        {[-1.8, 0, 1.8].map((x) => <Chair key={`a${x}`} p={[x, 0, -0.5]} c="#4b6cc1" />)}
        {[-1.8, 0, 1.8].map((x) => <Chair key={`b${x}`} p={[x, 0, 2.5]} r={Math.PI} c="#4b6cc1" />)}
        <Screen p={[3, 0, -5.4]} w={3} h={1.7} />
        <B p={[3, 0.6, -5.4]} s={[0.1, 1.2, 0.1]} c="#333" />
        <ServerRack p={[-5.5, 0, -5.5]} /><ServerRack p={[-4.6, 0, -5.5]} />
        <Plant p={[5.8, 0, 5.8]} />
        <Phase show="before">
          {/* 剛到貨、還沒拆完的「新系統」大箱子 */}
          <B p={[-3.5, 0.9, 4]} s={[2.2, 1.8, 1.6]} c={C.cardboard} r={[0, 0.3, 0]} />
          <B p={[-3.5, 1.82, 4]} s={[2.25, 0.04, 0.4]} c="#b38d5f" r={[0, 0.3, 0]} shadow={false} />
          <Box p={[-1, 0, 5.2]} r={0.8} /><PaperPile p={[0.6, 0.88, 1.2]} n={10} /><PaperPile p={[-1.2, 0.88, 0.8]} n={6} />
        </Phase>
        <Phase show="after">
          <Whiteboard p={[-2, 0, -5.6]} w={3.2} />
        </Phase>
      </G>

      {/* 戶外：圍牆邊的盆栽與停車格 */}
      {[-30, -22, -14, -6, 2, 10, 18, 26].map((x) => <Plant key={x} p={[x, 0, 22.5]} s={1.1} />)}
      {[36, 42].map((x) => <B key={x} p={[x, 0.01, -12]} s={[0.12, 0.01, 6]} c="#ffffff" shadow={false} />)}
      <Andon p={[33, 0, -14]} />
      <B p={[0, 0, 0]} s={[0.01, 0.01, 0.01]} c="#000" shadow={false} m={mat('#000')} />
    </group>
  );
}
