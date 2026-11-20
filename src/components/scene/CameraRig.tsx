import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import type CameraControlsImpl from 'camera-controls';
import { ZONES } from '../../content/factory';
import { live, useApp } from '../../lib/store';

// 桌機：斜後方近拍；手機：高俯角，對焦點往鏡頭方向前移，讓人物出現在畫面上半部（下半部是卡片）
function lookAtPerson(c: CameraControlsImpl, p: { x: number; z: number }, wide: boolean) {
  if (wide) c.setLookAt(p.x + 3.6, 4.4, p.z + 5.4, p.x, 1.1, p.z, true);
  else c.setLookAt(p.x + 1.4, 13, p.z + 7, p.x + 0.3, 0, p.z + 2, true);
}

export const HOME = { pos: [40, 60, 72] as const, target: [4, 0, -1] as const };

export default function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const zoneId = useApp((s) => s.zoneId);
  const itemId = useApp((s) => s.itemId);
  const personId = useApp((s) => s.personId);
  const view = useApp((s) => s.view);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const panel = zoneId || itemId || personId; // 左側有卡片時，畫面往右讓位
    const isWide = window.innerWidth >= 900;
    if (view === 'bird') {
      c.setFocalOffset(0, 0, 0, true);
      c.setLookAt(2, 84, 30, 2, 0, 1, true);
      return;
    }
    if (itemId) {
      const z = ZONES.find((zz) => zz.id === zoneId);
      const it = z?.items.find((i) => i.id === itemId);
      if (it) {
        c.setFocalOffset(panel && isWide ? -3.4 : 0, 0, 0, true);
        c.setLookAt(it.pos[0] + 7, it.pos[1] + 9.5, it.pos[2] + 12, it.pos[0], it.pos[1] - 0.6, it.pos[2], true);
      }
      return;
    }
    if (zoneId) {
      const z = ZONES.find((zz) => zz.id === zoneId);
      if (z) {
        const k = Math.max(z.size[0], z.size[1]);
        c.setFocalOffset(isWide ? -k * 0.16 : 0, 0, 0, true);
        c.setLookAt(z.center[0] + k * 0.5, k * 0.85 + 5, z.center[1] + k * 0.9 + 4, z.center[0], 0, z.center[1], true);
      }
      return;
    }
    if (!personId) {
      c.setFocalOffset(0, 0, 0, true);
      c.setLookAt(...HOME.pos, ...HOME.target, true);
    } else {
      // 拉近到人物身上；左側卡片打開時把人物往右讓位，手機則往上讓給底部卡片
      c.setFocalOffset(isWide ? -1.6 : 0, 0, 0, true);
      const p = live.people.get(personId);
      if (p) lookAtPerson(c, p, isWide);
    }
  }, [zoneId, itemId, personId, view]);

  useFrame(() => {
    const s = useApp.getState();
    const c = ref.current;
    if (!c || !s.follow || !s.personId) return;
    const p = live.people.get(s.personId);
    if (p) lookAtPerson(c, p, window.innerWidth >= 900);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.55}
      minDistance={5}
      maxDistance={170}
      maxPolarAngle={1.32}
      dollySpeed={0.6}
      onStart={() => {
        // 使用者自己拖曳時停止跟隨
        const s = useApp.getState();
        if (s.follow) s.set({ follow: false });
      }}
    />
  );
}
