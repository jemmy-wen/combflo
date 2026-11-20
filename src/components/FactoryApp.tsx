import { lazy, Suspense } from 'react';
import Sidebar from './ui/Sidebar';
import { DetailPanels, Intro, LogPanel, MobileHome, ModeFlash, ModeToggle, StatusHint, Toolbar } from './ui/Overlay';

const Scene = lazy(() => import('./scene/Scene'));

export default function FactoryApp() {
  return (
    <div className="app-shell">
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={<div className="grid h-full place-items-center text-[13px] font-bold text-white/70">廠房載入中…</div>}>
            <Scene />
          </Suspense>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <ModeToggle />
          <Toolbar />
          <MobileHome />
          <DetailPanels />
          <LogPanel />
          <StatusHint />
          <ModeFlash />
          <Intro />
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
