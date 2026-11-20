import { REGIONS, HEADCOUNTS, CONTACT_TIMES } from '../content/quiz.ts';

export const PRIORITY_REGIONS = ['台北市', '新北市', '基隆市', '桃園市'];
export const PRIORITY_HEADCOUNTS = ['30 人以下', '30–50 人'];

export type LeadInput = {
  company: string;
  nameRole: string;
  contact: string;
  contactTime?: string;
  region: string;
  headcount: string;
  consent: boolean;
  answers: Record<string, string | string[]>;
  result: Record<string, unknown>;
  utm?: Record<string, string>;
  website?: string; // honeypot
  turnstileToken?: string;
};

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function validateLead(body: any): { ok: true; lead: LeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid' };
  const lead: LeadInput = {
    company: clip(body.company, 80),
    nameRole: clip(body.nameRole, 60),
    contact: clip(body.contact, 80),
    contactTime: clip(body.contactTime, 20),
    region: clip(body.region, 10),
    headcount: clip(body.headcount, 12),
    consent: body.consent === true,
    answers: typeof body.answers === 'object' && body.answers ? body.answers : {},
    result: typeof body.result === 'object' && body.result ? body.result : {},
    utm: typeof body.utm === 'object' && body.utm ? body.utm : {},
    website: clip(body.website, 200),
    turnstileToken: clip(body.turnstileToken, 4096),
  };
  if (!lead.company || !lead.nameRole || !lead.contact) return { ok: false, error: 'required' };
  if (!REGIONS.includes(lead.region) || !HEADCOUNTS.includes(lead.headcount)) return { ok: false, error: 'required' };
  if (lead.contactTime && !CONTACT_TIMES.includes(lead.contactTime)) lead.contactTime = '';
  if (!lead.consent) return { ok: false, error: 'consent' };
  return { ok: true, lead };
}

export const priorityOf = (lead: Pick<LeadInput, 'region' | 'headcount'>): 'A' | 'B' =>
  PRIORITY_REGIONS.includes(lead.region) && PRIORITY_HEADCOUNTS.includes(lead.headcount) ? 'A' : 'B';
