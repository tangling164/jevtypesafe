import { describe, expect, it } from 'vitest';
import { buildContactDraft, contactMailto } from '../../src/lib/contact';

describe('contact drafts', () => {
  it('requires a public HTTPS URL for submissions', () => {
    expect(() => buildContactDraft('submit', 'en', { url: 'http://example.com' })).toThrow(/HTTPS/);
    expect(() => buildContactDraft('submit', 'en', { url: 'https://localhost/project' })).toThrow(/public HTTPS/);
  });

  it('limits user text and removes header-breaking characters', () => {
    const draft = buildContactDraft('submit', 'en', {
      url: 'https://example.com/project',
      name: 'Example\r\nBcc: victim@example.com',
      notes: 'x'.repeat(501),
    });
    expect(draft.subject).not.toMatch(/[\r\n]/);
    expect(draft.body).not.toContain('Bcc:');
    expect(draft.body).toContain('x'.repeat(500));
    expect(draft.body).not.toContain('x'.repeat(501));
  });

  it('adds a bounded correction project id as plain message text', () => {
    const draft = buildContactDraft('submit', 'zh', {
      url: 'https://example.com/project',
      project: '<img src=x onerror=alert(1)>\r\nBcc: bad@example.com' + 'x'.repeat(300),
    });
    expect(draft.body).toContain('<img src=x onerror=alert(1)> Bcc: bad@example.com');
    expect(draft.body.length).toBeLessThan(1000);
  });

  it('creates an encoded mailto only when an address exists', () => {
    const draft = buildContactDraft('sponsor', 'en', {
      url: 'https://example.com', goal: 'Reach Jev users & teams', dates: 'October', budget: '$500',
    });
    expect(contactMailto('', draft)).toBeNull();
    const mailto = contactMailto('hello@example.com', draft);
    expect(mailto).toContain('mailto:hello@example.com?subject=');
    expect(mailto).toContain('%26');
    expect(mailto).not.toContain('\r');
  });
});
