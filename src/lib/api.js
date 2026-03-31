// ── Storage keys ────────────────────────────────────────────
const ANTHROPIC_KEY_STORAGE = 'ermes_api_key_anthropic';
const OPENAI_KEY_STORAGE    = 'ermes_api_key_openai';
const PROVIDER_STORAGE      = 'ermes_api_provider';
const TRANSLATION_MODEL_KEY = 'ermes_translation_model';
const TRANSLATION_CACHE_KEY = 'ermes_translation_cache';

export function getAnthropicKey()   { return localStorage.getItem(ANTHROPIC_KEY_STORAGE) || ''; }
export function getOpenAIKey()      { return localStorage.getItem(OPENAI_KEY_STORAGE)    || ''; }
export function saveAnthropicKey(k) { localStorage.setItem(ANTHROPIC_KEY_STORAGE, k); }
export function saveOpenAIKey(k)    { localStorage.setItem(OPENAI_KEY_STORAGE, k); }

export function getProvider() {
  const stored = localStorage.getItem(PROVIDER_STORAGE);
  if (stored) return stored;
  if (getAnthropicKey()) return 'anthropic';
  if (getOpenAIKey())    return 'openai';
  return 'anthropic';
}
export function setProvider(p) { localStorage.setItem(PROVIDER_STORAGE, p); }

// ── Translation model (Anthropic only) ──────────────────────
export const HAIKU_MODEL  = 'claude-haiku-4-5-20251001';
export const SONNET_MODEL = 'claude-sonnet-4-6';

export function getTranslationModel() {
  return localStorage.getItem(TRANSLATION_MODEL_KEY) || HAIKU_MODEL;
}
export function setTranslationModel(m) { localStorage.setItem(TRANSLATION_MODEL_KEY, m); }

// ── Translation cache ────────────────────────────────────────
export function getTranslationCache() {
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveTranslationCache(cache) {
  try {
    const entries = Object.entries(cache);
    const trimmed = Object.fromEntries(entries.slice(-20));
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[cache] Could not save translation cache:', e);
  }
}

export function clearTranslationCache() {
  localStorage.removeItem(TRANSLATION_CACHE_KEY);
}

// ── Core AI call ─────────────────────────────────────────────
// useTranslationModel=true → Haiku (cheap); false → Sonnet (default for page generation)
async function callAI(prompt, maxTokens = 6000, useTranslationModel = false) {
  const provider = getProvider();

  if (provider === 'openai') {
    const key = getOpenAIKey();
    if (!key) throw new Error('OpenAI API key not set');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`OpenAI API ${res.status}: ${txt.slice(0, 300)}`);
    }
    const data = await res.json();
    return data.choices[0].message.content.trim();
  }

  // Anthropic (default)
  const key = getAnthropicKey();
  if (!key) throw new Error('Anthropic API key not set');
  const model = useTranslationModel ? getTranslationModel() : SONNET_MODEL;
  console.log('[api] callAI model=' + model + ', maxTokens=' + maxTokens);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Anthropic API ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.content[0].text.trim();
}

// ── Glossary helper ──────────────────────────────────────────
function glossaryTable(glossary) {
  const header = '| English | ES | IT | FR | DE |';
  const sep    = '|---------|-----|-----|-----|-----|';
  const rows   = glossary.map(g =>
    `| ${g.en} | ${g.es} | ${g.it} | ${g.fr} | ${g.de} |`
  );
  return [header, sep, ...rows].join('\n');
}

// ── Text extraction helpers ──────────────────────────────────
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

function extractTextsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const texts = {};
  let i = 0;
  let node;
  while ((node = walker.nextNode())) {
    const trimmed = node.nodeValue.trim();
    if (trimmed.length > 1) {
      texts['T' + i++] = trimmed;
    }
  }
  console.log('[api] extractTextsFromHtml: ' + Object.keys(texts).length + ' strings');
  return texts;
}

function applyTranslations(html, sourceTexts, translatedTexts) {
  let result = html;
  for (const key of Object.keys(sourceTexts)) {
    const original = sourceTexts[key];
    const translated = translatedTexts[key];
    if (translated && original !== translated) {
      try {
        const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escaped, 'g'), translated);
      } catch (_) { /* skip invalid regex */ }
    }
  }
  return result;
}

const LANG_NAMES_API = {en:'English', es:'Spanish (es)', it:'Italian (it)', fr:'French (fr)', de:'German (de)'};

// ── Public API functions ─────────────────────────────────────
export async function translateTexts(formFields, glossary, sourceLang = 'en', targetLangs = ['es','it','fr','de']) {
  if (targetLangs.length === 0) return {};

  const sourceLangName = LANG_NAMES_API[sourceLang] || sourceLang;
  const targetLangsStr = targetLangs.map(l => LANG_NAMES_API[l] || l).join(', ');
  const structureStr = '{' + targetLangs.map(l => '"' + l + '":{...}').join(',') + '}';

  const prompt = `You are a professional translator for a dance academy.
Translate the following fields from ${sourceLangName} to ${targetLangsStr}.
Return ONLY valid JSON — no markdown, no code fences.
Structure: ${structureStr}
Each object must have exactly these keys: courseLevel, courseTitle, courseSubtitle, ctaText, freeLessonTitle, beyondSuffix, unlimitedTitle.

MANDATORY GLOSSARY — use these exact translations, never paraphrase:
${glossaryTable(glossary)}

Do NOT translate: artist names, "Ermes Dance Academy", "Motion Bites®".

Source (${sourceLangName}):
courseLevel: ${formFields.courseLevel}
courseTitle: ${formFields.courseTitle}
courseSubtitle: ${formFields.courseSubtitle}
ctaText: ${formFields.ctaText}
freeLessonTitle: ${formFields.freeLessonTitle}
beyondSuffix: You Also Get
unlimitedTitle: Unlimited Access to all Courses`;

  const raw = await callAI(prompt, 2000, true); // Haiku: fast, cheap, sufficient
  const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(clean);
}

// Single API call → all target languages, with localStorage cache
export async function translateAboutHtmlAllLangs(baseHtml, aboutHtmlsByLang, glossary, sourceLang = 'en', targetLangs = ['es','it','fr','de']) {
  if (targetLangs.length === 0) return { result: {}, fromCache: false, textCount: 0 };

  const sourceTexts = extractTextsFromHtml(baseHtml);
  const textCount = Object.keys(sourceTexts).length;
  const cacheKey = hashStr(JSON.stringify(sourceTexts) + sourceLang + targetLangs.join(','));

  // Check cache
  const cache = getTranslationCache();
  if (cache[cacheKey]) {
    console.log('[cache] Hit! key=' + cacheKey + ', ' + textCount + ' strings');
    const cachedTranslatedTexts = cache[cacheKey];
    const result = {};
    for (const lang of targetLangs) {
      const langTexts = {};
      for (const key of Object.keys(cachedTranslatedTexts)) {
        langTexts[key] = cachedTranslatedTexts[key]?.[lang] || sourceTexts[key];
      }
      result[lang] = applyTranslations(aboutHtmlsByLang[lang], sourceTexts, langTexts);
    }
    return { result, fromCache: true, textCount };
  }

  const sourceLangName = LANG_NAMES_API[sourceLang] || sourceLang;
  const targetLangsStr = targetLangs.map(l => LANG_NAMES_API[l] || l).join(', ');
  const structureExample = '{"T0":{' + targetLangs.map(l => '"' + l + '":"..."').join(',') + '},"T1":{...},...}';

  console.log('[api] translateAboutHtmlAllLangs: ' + textCount + ' strings, ' + targetLangs.length + ' langs, single call');
  const prompt = `Translate the following text strings from ${sourceLangName} to ${targetLangsStr}.
Return ONLY valid JSON — no markdown, no code fences.
Structure: ${structureExample}
Include ALL keys from the source — every key must appear in the output.

MANDATORY GLOSSARY — use these exact translations, never paraphrase:
${glossaryTable(glossary)}

Do NOT translate: artist names, "Ermes Dance Academy", "Motion Bites®".

Source strings (${sourceLangName}):
${JSON.stringify(sourceTexts, null, 2)}`;

  const raw = await callAI(prompt, 6000, true); // Haiku: single call instead of N
  const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
  const translatedTexts = JSON.parse(clean);

  // Save to cache
  saveTranslationCache({ ...cache, [cacheKey]: translatedTexts });
  console.log('[cache] Saved key=' + cacheKey);

  // Build translated HTML for each lang
  const result = {};
  for (const lang of targetLangs) {
    const langTexts = {};
    for (const key of Object.keys(translatedTexts)) {
      langTexts[key] = translatedTexts[key]?.[lang] || sourceTexts[key];
    }
    result[lang] = applyTranslations(aboutHtmlsByLang[lang], sourceTexts, langTexts);
  }

  return { result, fromCache: false, textCount };
}

export function applyGlossaryPostProcessing(text, lang, glossary) {
  let result = text;
  for (const entry of glossary) {
    if (entry.en && entry[lang]) {
      result = result.split(entry.en).join(entry[lang]);
    }
  }
  return result;
}
