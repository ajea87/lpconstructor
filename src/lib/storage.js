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
  };
  history.unshift(newEntry);
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 20)));
  return newEntry;
}

export function deleteFromHistory(id) {
  const history = getHistory().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}
