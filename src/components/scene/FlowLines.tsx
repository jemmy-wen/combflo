// 協作線：優化前是糾結交錯的紅色虛線，優化後依流程順序流動的藍線
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { FLOW_ORDER, ZONES } from '../../content/factory';
import { live, useApp } from '../../lib/store';

const center = (id: string) => {
  const z = ZONES.find((zz) => zz.id === id)!;
  return new THREE.Vector3(z.center[0], 0.4, z.center[1]);
};

export default function FlowLines() {
  const show = useApp((s) => s.lines);
  const messyRefs = useRef<any[]>([]);
  const cleanRef = useRef<any>(null);

  // 優化前：隨機兩兩相連、拱得很高的亂線
  const messy = useMemo(() => {
    const ids = ZONES.map((z) => z.id);
    const pairs: [string, string][] = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if ((i * 7 + j * 3) % 3 === 1 || (i + j) % 4 === 0) pairs.push([ids[i], ids[j]]);
    return pairs.map(([a, b], k) => {
      const A = center(a), Bv = center(b);
      const mid = A.clone().lerp(Bv, 0.5);
      mid.y = 3 + (k % 4) * 1.4;
      mid.x += ((k * 37) % 9) - 4; mid.z += ((k * 53) % 9) - 4;
      return new THREE.CatmullRomCurve3([A, mid, Bv]).getPoints(40);
    });
  }, []);

  // 優化後：沿流程順序，貼地彎過走道
  const clean = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    FLOW_ORDER.forEach((id) => {
      const c = center(id);
      pts.push(new THREE.Vector3(c.x, 0.35, c.z));
      pts.push(new THREE.Vector3(c.x, 0.35, -3));
    });
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2).getPoints(220);
  }, []);

  useFrame((_, dt) => {
    const b = live.blend;
    messyRefs.current.forEach((l, i) => {
      if (!l) return;
      l.material.opacity = (1 - b) * 0.75;
      l.material.dashOffset -= dt * (0.8 + (i % 3) * 0.4);
      l.visible = show && b < 0.98;
    });
    if (cleanRef.current) {
      cleanRef.current.material.opacity = b;
      cleanRef.current.material.dashOffset -= dt * 2.2;
      cleanRef.current.visible = show && b > 0.02;
    }
  });

  return (
    <group>
      {messy.map((pts, i) => (
        <Line key={i} ref={(l: any) => { messyRefs.current[i] = l; }} points={pts} color="#ff6a2b" lineWidth={2} dashed dashSize={0.6} gapSize={0.4} transparent opacity={0.75} />
      ))}
      <Line ref={cleanRef} points={clean} color="#1fae63" lineWidth={5} dashed dashSize={1.4} gapSize={0.7} transparent opacity={0} />
    </group>
  );
}
