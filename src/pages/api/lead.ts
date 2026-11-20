import type { APIRoute } from 'astro';
import { validateLead, priorityOf } from '../../lib/lead.ts';
import { QUESTIONS, TYPES, type TypeKey } from '../../content/quiz.ts';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];

// 把選項代碼換成文字，讓試算表直接可讀
function readable(answers: Record<string, string | string[]>) {
  const out: Record<string, string> = {};
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (q.kind === 'text') { out[q.id] = typeof v === 'string' ? v.slice(0, 500) : ''; continue; }
    const vals = Array.isArray(v) ? v : v ? [v] : [];
    out[q.id] = vals.map((x) => q.options?.find((o) => o.value === x)?.label ?? '').filter(Boolean).join('、');
  }
  return out;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid' }, 400); }

  const v = validateLead(body);
  if (!v.ok) return json(v, 400);
  const lead = v.lead;

  // honeypot：機器人會填隱藏欄位，假裝成功即可
  if (lead.website) return json({ ok: true, variant: 'B' });

  const turnstileSecret = env('TURNSTILE_SECRET');
  if (turnstileSecret) {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: turnstileSecret, response: lead.turnstileToken ?? '', remoteip: clientAddress ?? '' }),
    }).then((res) => res.json()).catch(() => ({ success: false }));
    if (!r.success) return json({ ok: false, error: 'captcha' }, 400);
  }

  const variant = priorityOf(lead);
  const result = lead.result as Record<string, any>;
  const lv = (n: unknown) => ({ 1: '低', 2: '中', 3: '高' } as Record<string, string>)[String(n)] ?? '';
  const row = {
    submitted_at: new Date().toISOString(),
    priority: variant,
    company: lead.company,
    name_role: lead.nameRole,
    contact: lead.contact,
    contact_time: lead.contactTime ?? '',
    region: lead.region,
    headcount: lead.headcount,
    result_type: TYPES[result.type as TypeKey]?.name ?? '',
    tool_score: Number(result.toolScore) || 0,
    process_score: Number(result.processScore) || 0,
    repeat_level: lv(result.repeat),
    reliance_level: lv(result.reliance),
    connect_level: lv(result.connect),
    ...readable(lead.answers),
    utm_source: lead.utm?.utm_source ?? '',
    utm_medium: lead.utm?.utm_medium ?? '',
    utm_campaign: lead.utm?.utm_campaign ?? '',
    referrer: lead.utm?.referrer ?? '',
  };

  const url = env('SHEETS_WEBHOOK_URL');
  if (!url) {
    console.info('[lead] SHEETS_WEBHOOK_URL 未設定，資料未寫入：', row);
    return json({ ok: true, variant });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: env('SHEETS_WEBHOOK_SECRET') ?? '', row }),
      redirect: 'follow',
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.ok !== true) throw new Error(`sheet ${res.status} ${JSON.stringify(out)}`);
  } catch (err) {
    console.error('[lead] write failed', err);
    return json({ ok: false, error: 'server' }, 502);
  }
  return json({ ok: true, variant });
};
