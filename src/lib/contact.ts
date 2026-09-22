export type ContactKind = 'submit' | 'sponsor';
export type ContactLocale = 'en' | 'zh';

export interface ContactFields {
  url?: string;
  name?: string;
  notes?: string;
  goal?: string;
  dates?: string;
  budget?: string;
  project?: string;
}

export interface ContactDraft { subject: string; body: string }

const limits: Record<keyof ContactFields, number> = {
  url: 2048, name: 120, notes: 500, goal: 500, dates: 120, budget: 120, project: 160,
};

function clean(value: string | undefined, key: keyof ContactFields): string {
  return (value ?? '').replace(/[\r\n\0]+/g, ' ').trim().slice(0, limits[key]);
}

// Only fields that flow into the mailto subject can inject headers; body rows are plain text.
const headerSafe = (value: string) => value.replace(/\b(bcc|cc|to|from):/gi, '$1');

function requirePublicHttps(raw: string): string {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error('Project URL must be a public HTTPS URL.'); }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  const blocked = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '0.0.0.0' || hostname.startsWith('127.') || hostname.startsWith('10.') || hostname.startsWith('192.168.');
  if (url.protocol !== 'https:' || url.username || url.password || blocked) throw new Error('Project URL must be a public HTTPS URL.');
  return url.href;
}

export function buildContactDraft(kind: ContactKind, locale: ContactLocale, fields: ContactFields): ContactDraft {
  const url = requirePublicHttps(clean(fields.url, 'url'));
  const values = Object.fromEntries(Object.keys(limits).map((key) => [key, clean(fields[key as keyof ContactFields], key as keyof ContactFields)])) as Record<keyof ContactFields, string>;
  values.name = headerSafe(values.name);
  const zh = locale === 'zh';
  const subject = kind === 'submit'
    ? `${zh ? '项目提交' : 'Project submission'}: ${values.name || new URL(url).hostname}`
    : `${zh ? '赞助询价' : 'Sponsorship inquiry'}: ${new URL(url).hostname}`;
  const rows = kind === 'submit'
    ? [[zh ? '项目网址' : 'Project URL', url], [zh ? '项目名称' : 'Project name', values.name], [zh ? '补充说明' : 'Notes', values.notes], [zh ? '纠错项目 ID' : 'Correction project ID', values.project]]
    : [[zh ? '项目网址' : 'Project URL', url], [zh ? '推广目标' : 'Promotion goal', values.goal], [zh ? '期望日期' : 'Preferred dates', values.dates], [zh ? '预算（选填）' : 'Budget (optional)', values.budget]];
  return { subject: subject.replace(/[\r\n]/g, ' ').slice(0, 180), body: rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join('\n') };
}

export function contactMailto(email: string, draft: ContactDraft): string | null {
  const address = email.trim();
  if (!address || /[\r\n]/.test(address)) return null;
  return `mailto:${address}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
}
