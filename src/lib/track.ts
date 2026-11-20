export function track(event: string, params: Record<string, string | number> = {}) {
  try { (window as any).gtag?.('event', event, params); } catch {}
}
export function getUtm(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem('cf_utm') || '{}'); } catch { return {}; }
}
