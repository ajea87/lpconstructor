const API_KEY_STORAGE = 'ermes_api_key';

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}
export function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

async function callClaude(apiKey, prompt, maxTokens = 6000) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
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

function glossaryTable(glossary) {
  const header = '| English | ES | IT | FR | DE |';
  const sep    = '|---------|-----|-----|-----|-----|';
  const rows   = glossary.map(g =>
    `| ${g.en} | ${g.es} | ${g.it} | ${g.fr} | ${g.de} |`
  );
  return [header, sep, ...rows].join('\n');
}

export async function translateTexts(formFields, glossary, apiKey) {
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

  const raw = await callClaude(apiKey, prompt);
  const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(clean);
}

export async function translateAboutHtml(html, targetLang, glossary, apiKey) {
  const langNames = { es: 'Spanish', it: 'Italian', fr: 'French', de: 'German' };
  const prompt = `Translate the visible text in the following HTML block to ${langNames[targetLang]}.
Return ONLY the translated HTML — no markdown, no code fences, no explanation.
Preserve ALL HTML attributes exactly (class, id, data-wistia, data-title, aria-*, style, href, src).
Do NOT translate: artist names, "Ermes Dance Academy", "Motion Bites®", Wistia video IDs.

MANDATORY GLOSSARY — use these exact translations:
${glossaryTable(glossary)}

${html}`;

  const raw = await callClaude(apiKey, prompt, 8000);
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
