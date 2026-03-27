// ── Storage keys ────────────────────────────────────────────
const ANTHROPIC_KEY_STORAGE = 'ermes_api_key_anthropic';
const OPENAI_KEY_STORAGE    = 'ermes_api_key_openai';
const PROVIDER_STORAGE      = 'ermes_api_provider'; // 'anthropic' | 'openai'

export function getAnthropicKey() { return localStorage.getItem(ANTHROPIC_KEY_STORAGE) || ''; }
export function getOpenAIKey()    { return localStorage.getItem(OPENAI_KEY_STORAGE)    || ''; }
export function saveAnthropicKey(k) { localStorage.setItem(ANTHROPIC_KEY_STORAGE, k); }
export function saveOpenAIKey(k)    { localStorage.setItem(OPENAI_KEY_STORAGE, k); }

export function getProvider() {
  const stored = localStorage.getItem(PROVIDER_STORAGE);
  if (stored) return stored;
  // auto-detect: whichever key is already stored
  if (getAnthropicKey()) return 'anthropic';
  if (getOpenAIKey())    return 'openai';
  return 'anthropic';
}
export function setProvider(p) { localStorage.setItem(PROVIDER_STORAGE, p); }

// ── Core AI call ────────────────────────────────────────────
async function callAI(prompt, maxTokens = 6000) {
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
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
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

// ── Glossary helper ─────────────────────────────────────────
function glossaryTable(glossary) {
  const header = '| English | ES | IT | FR | DE |';
  const sep    = '|---------|-----|-----|-----|-----|';
  const rows   = glossary.map(g =>
    `| ${g.en} | ${g.es} | ${g.it} | ${g.fr} | ${g.de} |`
  );
  return [header, sep, ...rows].join('\n');
}

// ── Public API functions ────────────────────────────────────
export async function translateTexts(formFields, glossary) {
  const prompt = `You are a professional translator for a dance academy.
Translate the following fields to Spanish (es), Italian (it), French (fr), and German (de).
Return ONLY valid JSON — no markdown, no code fences.
Structure: {"es":{...},"it":{...},"fr":{...},"de":{...}}
Each object must have exactly these keys: courseLevel, courseTitle, courseSubtitle, ctaText, freeLessonTitle, beyondSuffix, unlimitedTitle.

MANDATORY GLOSSARY — use these exact translations, never paraphrase:
${glossaryTable(glossary)}

Do NOT translate: artist names, "Ermes Dance Academy", "Motion Bites®".

Source (EN):
courseLevel: ${formFields.courseLevel}
courseTitle: ${formFields.courseTitle}
courseSubtitle: ${formFields.courseSubtitle}
ctaText: ${formFields.ctaText}
freeLessonTitle: ${formFields.freeLessonTitle}
beyondSuffix: You Also Get
unlimitedTitle: Unlimited Access to all Courses`;

  const raw = await callAI(prompt);
  const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(clean);
}

export async function translateAboutHtml(html, targetLang, glossary) {
  const langNames = { es: 'Spanish', it: 'Italian', fr: 'French', de: 'German' };
  const prompt = `Translate the visible text in the following HTML block to ${langNames[targetLang]}.
Return ONLY the translated HTML — no markdown, no code fences, no explanation.
Preserve ALL HTML attributes exactly (class, id, data-wistia, data-title, aria-*, style, href, src).
Do NOT translate: artist names, "Ermes Dance Academy", "Motion Bites®", Wistia video IDs.

MANDATORY GLOSSARY — use these exact translations:
${glossaryTable(glossary)}

${html}`;

  const raw = await callAI(prompt, 8000);
  return raw.replace(/^```html?\s*/i, '').replace(/\s*```$/, '');
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
