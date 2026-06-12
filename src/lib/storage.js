const KEY = 'ermes_history';

export function getHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry) {
  const history = getHistory();
  const newEntry = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    artistName: entry.artistName,
    pageSlug: entry.pageSlug,
    form: entry.form || null,
    pages: entry.pages,
    enOnly: entry.enOnly || false,
    isMono: entry.isMono || false,
    baseLang: entry.baseLang || 'en',
    generatedLangs: entry.generatedLangs || Object.keys(entry.pages || {}),
  };

  history.unshift(newEntry);
  const payload = JSON.stringify(history.slice(0, 20));
  try {
    localStorage.setItem(KEY, payload);
  } catch (e) {
    console.error('[storage] localStorage.setItem failed (QuotaExceededError?):', e);
    // Last-resort: save without the HTML bodies to preserve metadata
    const slim = history.slice(0, 20).map(h => ({ ...h, pages: Object.fromEntries(
      Object.entries(h.pages || {}).map(([k, v]) => [k, v ? '[HTML truncated — quota exceeded]' : v])
    ) }));
    try { localStorage.setItem(KEY, JSON.stringify(slim)); } catch { /* give up */ }
  }
  return newEntry;
}

export function deleteFromHistory(id) {
  const history = getHistory().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}

// ── Email history ─────────────────────────────────────────────────────────────

const EMAIL_KEY = 'ermes_email_history';

export function getEmailHistory() {
  try {
    const raw = localStorage.getItem(EMAIL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveEmailToHistory(entry) {
  const history = getEmailHistory();
  const newEntry = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    subject: entry.subject || 'Untitled Email',
    html: entry.html || '',
  };
  history.unshift(newEntry);
  try {
    localStorage.setItem(EMAIL_KEY, JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.error('[email-storage] Save failed:', e);
  }
  return newEntry;
}

export function deleteEmailFromHistory(id) {
  const history = getEmailHistory().filter(e => e.id !== id);
  localStorage.setItem(EMAIL_KEY, JSON.stringify(history));
}
