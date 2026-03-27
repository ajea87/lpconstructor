import { defaultGlossary } from '../data/defaultGlossary';

const KEY = 'ermes_glossary';

export function getGlossary() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultGlossary;
  } catch {
    return defaultGlossary;
  }
}

export function saveGlossary(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function resetGlossary() {
  localStorage.removeItem(KEY);
  return defaultGlossary;
}
