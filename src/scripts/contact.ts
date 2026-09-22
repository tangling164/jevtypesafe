import { buildContactDraft, contactMailto, type ContactFields, type ContactKind, type ContactLocale } from '../lib/contact';

const forms = document.querySelectorAll<HTMLFormElement>('[data-contact-form]');
for (const form of forms) {
  const output = form.querySelector<HTMLTextAreaElement>('[data-contact-output]')!;
  const status = form.querySelector<HTMLElement>('[data-contact-status]')!;
  const copy = form.querySelector<HTMLButtonElement>('[data-copy]')!;
  const kind = form.dataset.kind as ContactKind;
  const locale = form.dataset.locale as ContactLocale;
  const email = form.dataset.email ?? '';
  const baseStatus = status.textContent ?? '';

  const correctionParam = (new URLSearchParams(location.search).get('project') ?? '').replace(/[\r\n\0]+/g, ' ').trim().slice(0, 160);
  if (correctionParam) form.dataset.project = correctionParam;

  const correctionLine = () => (form.dataset.project ? `${locale === 'zh' ? '纠错项目 ID' : 'Correction project ID'}: ${form.dataset.project}` : '');

  const fields = (): ContactFields => {
    const data = new FormData(form);
    return {
      url: String(data.get('url') ?? ''), name: String(data.get('name') ?? ''), notes: String(data.get('notes') ?? ''),
      goal: String(data.get('goal') ?? ''), dates: String(data.get('dates') ?? ''), budget: String(data.get('budget') ?? ''),
      project: form.dataset.project ?? '',
    };
  };
  const update = () => {
    try {
      const draft = buildContactDraft(kind, locale, fields());
      output.value = draft.body;
      status.textContent = baseStatus;
      return draft;
    } catch {
      output.value = correctionLine();
      return null;
    }
  };
  update();
  form.addEventListener('input', update);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const draft = update();
    const href = draft && contactMailto(email, draft);
    if (href) window.location.href = href;
  });
  copy.addEventListener('click', async () => {
    const draft = update();
    if (!draft) { form.reportValidity(); return; }
    try {
      await navigator.clipboard.writeText(`${email ? `${email}\n\n` : ''}${draft.subject}\n\n${draft.body}`);
      status.textContent = locale === 'zh' ? '已复制。请自行发送这些信息。' : 'Copied. Send this information yourself when you are ready.';
    } catch {
      output.focus(); output.select();
      status.textContent = locale === 'zh' ? '复制失败，请手动选择下方文本并复制。' : 'Could not copy. Select the text below and copy it manually.';
    }
  });
}
