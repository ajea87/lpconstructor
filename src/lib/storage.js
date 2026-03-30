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
  };

  // Diagnostic logging
  const pagesKeys = Object.keys(entry.pages || {});
  pagesKeys.forEach(k => {
    console.log('[storage] Saving pages.' + k + ':', entry.pages[k]?.length ?? 0, 'chars');
  });

  history.unshift(newEntry);
  const payload = JSON.stringify(history.slice(0, 20));
  console.log('[storage] Total JSON payload:', payload.length, 'chars');
  try {
    localStorage.setItem(KEY, payload);
    console.log('[storage] Saved OK');
  } catch (e) {
    console.error('[storage] localStorage.setItem failed (QuotaExceededError?):', e);
    // Last-resort: save without the HTML bodies to preserve metadata
    const slim = history.slice(0, 20).map(h => ({ ...h, pages: Object.fromEntries(
      Object.entries(h.pages || {}).map(([k, v]) => [k, v ? '[HTML truncated — quota exceeded]' : v])
    ) }));
    try { localStorage.setItem(KEY, JSON.stringify(slim)); } catch (_) { /* give up */ }
  }
  return newEntry;
}

export function deleteFromHistory(id) {
  const history = getHistory().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}
