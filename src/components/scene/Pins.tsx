import { Html } from '@react-three/drei';
import { ZONES } from '../../content/factory';
import { useApp } from '../../lib/store';

export default function Pins() {
  const mode = useApp((s) => s.mode);
  const zoneId = useApp((s) => s.zoneId);
  const itemId = useApp((s) => s.itemId);
  const hover = useApp((s) => s.hoverZone);
  const focusZone = useApp((s) => s.focusZone);
  const focusItem = useApp((s) => s.focusItem);
  const before = mode === 'before';

  return (
    <group>
      {ZONES.map((z) => {
        const active = zoneId === z.id;
        const dim = zoneId && !active;
        return (
          <group key={z.id}>
            <Html position={[z.center[0], 4.4, z.center[1]]} center zIndexRange={[30, 10]}>
              <button
                type="button"
                onClick={() => focusZone(z.id)}
                onMouseEnter={() => useApp.getState().set({ hoverZone: z.id })}
                onMouseLeave={() => useApp.getState().set({ hoverZone: null })}
                className={`pin group flex items-center gap-1.5 whitespace-nowrap rounded-[8px] py-1 pl-1 pr-2.5 text-[13px] font-bold shadow-[0_8px_20px_-8px_rgba(0,0,0,.55)] transition-all duration-300 ${
                  active ? 'bg-ink text-white' : 'bg-white text-ink hover:-translate-y-0.5'
                } ${dim ? 'opacity-40' : ''}`}
              >
                <span className={`grid h-6 min-w-6 place-items-center rounded-[5px] px-1 text-[11px] font-bold ${before ? 'bg-orange text-ink' : 'bg-green text-white'}`}>{z.no}</span>
                <span>{z.name}</span>
                <span className={`text-[11px] font-bold ${active ? 'text-white/60' : 'text-ink-3'}`}>{before ? `卡關 ${z.items.length}` : '已梳理'}</span>
              </button>
            </Html>
            {active && z.items.map((it, i) => (
              <Html key={it.id} position={it.pos} center zIndexRange={[40, 20]}>
                <button
                  type="button"
                  onClick={() => focusItem(z.id, it.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-[7px] py-0.5 pl-0.5 pr-2.5 text-[12px] font-bold shadow-[0_8px_18px_-8px_rgba(0,0,0,.55)] transition-transform hover:-translate-y-0.5 ${
                    itemId === it.id ? 'bg-ink text-white' : 'bg-white text-ink'
                  }`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-[4px] text-[10px] font-black ${before ? 'bg-orange text-ink' : 'bg-green text-white'}`}>
                    {before ? '!' : i + 1}
                  </span>
                  {it.title}
                </button>
              </Html>
            ))}
          </group>
        );
      })}
    </group>
  );
}
