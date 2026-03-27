import { useState, useEffect } from 'react';
import Field from '../components/Field';
import ProgressBar from '../components/ProgressBar';
import { getGlossary } from '../lib/glossary';
import { getApiKey, saveApiKey, translateTexts, translateAboutHtml, applyGlossaryPostProcessing } from '../lib/api';
import { buildPage } from '../lib/generator';
import { saveToHistory } from '../lib/storage';
import JSZip from 'jszip';

const LANGS = [
  { key: 'en', label: 'EN', flag: '🇬🇧' },
  { key: 'es', label: 'ES', flag: '🇪🇸' },
  { key: 'it', label: 'IT', flag: '🇮🇹' },
  { key: 'fr', label: 'FR', flag: '🇫🇷' },
  { key: 'de', label: 'DE', flag: '🇩🇪' },
];

const FILE_SUFFIX = { en: '', es: '-es', it: '-it', fr: '-fr', de: '-de' };

const DEFAULT_FORM = {
  pageSlug: '',
  artistName: '',
  artistRole: '',
  courseLevel: '',
  courseTitle: '',
  courseSubtitle: '',
  wistiaVideos: {
    en: { heroVideoId: '', freeLessonVideoId: '' },
    es: { heroVideoId: '', freeLessonVideoId: '' },
    it: { heroVideoId: '', freeLessonVideoId: '' },
    fr: { heroVideoId: '', freeLessonVideoId: '' },
    de: { heroVideoId: '', freeLessonVideoId: '' },
  },
  ctaText: 'Get Started for 8€/month',
  ctaUrl: 'https://academy.ermesdance.com/pricing',
  freeLessonTitle: '',
  aboutHtml: '',
};

export default function Builder() {
  const [apiKey, setApiKey] = useState(getApiKey);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [step, setStep] = useState(0);        // 0 = idle, 1-4 = progress
  const [error, setError] = useState('');
  const [pages, setPages] = useState(null);   // { en, es, it, fr, de }
  const [activeTab, setActiveTab] = useState('en');
  const [toast, setToast] = useState('');

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t); } }, [toast]);

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function setVideoField(lang, field, val) {
    setForm(f => ({
      ...f,
      wistiaVideos: {
        ...f.wistiaVideos,
        [lang]: { ...f.wistiaVideos[lang], [field]: val },
      },
    }));
  }

  async function generate() {
    if (!apiKey.trim()) { setError('Enter your Anthropic API key.'); return; }
    if (!form.aboutHtml.trim()) { setError('Paste the about_these_courses HTML block.'); return; }
    saveApiKey(apiKey.trim());

    setError(''); setStep(1); setPages(null);
    const glossary = getGlossary();

    try {
      // Step 1: Translate UI texts
      const uiTrans = await translateTexts(form, glossary, apiKey.trim());

      // Step 2: Translate About x 4 in parallel
      setStep(2);
      const [aboutEs, aboutIt, aboutFr, aboutDe] = await Promise.all([
        translateAboutHtml(form.aboutHtml, 'es', glossary, apiKey.trim()),
        translateAboutHtml(form.aboutHtml, 'it', glossary, apiKey.trim()),
        translateAboutHtml(form.aboutHtml, 'fr', glossary, apiKey.trim()),
        translateAboutHtml(form.aboutHtml, 'de', glossary, apiKey.trim()),
      ]);

      const aboutByLang = {
        en: form.aboutHtml,
        es: applyGlossaryPostProcessing(aboutEs, 'es', glossary),
        it: applyGlossaryPostProcessing(aboutIt, 'it', glossary),
        fr: applyGlossaryPostProcessing(aboutFr, 'fr', glossary),
        de: applyGlossaryPostProcessing(aboutDe, 'de', glossary),
      };

      // Step 3: Build pages
      setStep(3);
      const enStrings = {
        courseLevel:      form.courseLevel,
        courseTitle:      form.courseTitle,
        courseSubtitle:   form.courseSubtitle,
        ctaText:          form.ctaText,
        freeLessonTitle:  form.freeLessonTitle,
        beyondSuffix:     'You Also Get',
        unlimitedTitle:   'Unlimited Access to all Courses',
        activateSound:    'Activate Sound',
        freeLessonBtn:    'Free Lesson',
        coursesLabel:     'Courses',
        biteLabel:        'Bite-Sized Classes',
        accessLabel:      'Access',
        allRightsReserved:'All rights reserved.',
      };

      const result = {};
      for (const { key } of LANGS) {
        const strings = key === 'en' ? enStrings : { ...enStrings, ...(uiTrans[key] || {}) };
        result[key] = buildPage(form, key, strings, aboutByLang[key]);
      }

      setPages(result);
      setActiveTab('en');
      setStep(4);
    } catch (err) {
      setError(err.message || String(err));
      setStep(0);
    }
  }

  async function downloadZip() {
    const zip = new JSZip();
    const slug = form.pageSlug || 'lp-artista';
    for (const { key } of LANGS) {
      zip.file(`${slug}${FILE_SUFFIX[key]}.html`, pages[key]);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${slug}.zip`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadOne(lang) {
    const slug = form.pageSlug || 'lp-artista';
    const fname = `${slug}${FILE_SUFFIX[lang]}.html`;
    const blob = new Blob([pages[lang]], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }

  function copyOne(lang) {
    navigator.clipboard.writeText(pages[lang]).then(() => setToast(`${lang.toUpperCase()} copied ✓`));
  }

  function saveHistory() {
    saveToHistory({
      artistName: form.artistName,
      pageSlug: form.pageSlug,
      pages,
    });
    setToast('Saved to history ✓');
  }

  const busy = step > 0 && step < 4;

  // Section header helper
  const SectionLabel = ({ children }) => (
    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
      {children}
    </p>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-20">
      <h1 className="text-2xl font-black mb-1">LP Builder</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Generate landing pages in 5 languages with one click.
      </p>

      {/* API Key */}
      <div className="rounded-xl p-4 mb-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <SectionLabel>Anthropic API Key</SectionLabel>
        <Field
          type="password"
          value={apiKey}
          onChange={setApiKey}
          placeholder="sk-ant-..."
        />
      </div>

      {/* Artist */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <SectionLabel>Artist</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Page Slug" value={form.pageSlug} onChange={v => setField('pageSlug', v)} placeholder="lp-nueva-artista" />
          <Field label="Course Level" value={form.courseLevel} onChange={v => setField('courseLevel', v)} placeholder="Open Level" />
          <Field label="Artist Name" value={form.artistName} onChange={v => setField('artistName', v)} placeholder="Carolina Rosa" />
          <Field label="Artist Role" value={form.artistRole} onChange={v => setField('artistRole', v)} placeholder="Traditional Bachata Artist" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Course Title" value={form.courseTitle} onChange={v => setField('courseTitle', v)} placeholder="Traditional Bachata That Lives in the Body" />
          <Field label="Course Subtitle" value={form.courseSubtitle} onChange={v => setField('courseSubtitle', v)} placeholder="Take Your Dance to the Next Level." />
        </div>
      </div>

      {/* Wistia Videos */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <SectionLabel>Wistia Videos</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                <th className="text-left pb-3 pr-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', width: 80 }}>Language</th>
                <th className="text-left pb-3 pr-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Hero Video ID</th>
                <th className="text-left pb-3 font-bold text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Free Lesson Video ID</th>
              </tr>
            </thead>
            <tbody>
              {LANGS.map(({ key, flag, label }) => (
                <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-2 pr-4">
                    <span className="text-base mr-1">{flag}</span>
                    <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    {key !== 'en' && (
                      <span className="ml-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>↳</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      className="w-full rounded px-2 py-1.5 text-xs font-mono text-white placeholder-white/20 outline-none"
                      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                      value={form.wistiaVideos[key].heroVideoId}
                      onChange={e => setVideoField(key, 'heroVideoId', e.target.value)}
                      placeholder={key === 'en' ? 'j1mton7xgc' : `fallback: ${form.wistiaVideos.en.heroVideoId || 'EN value'}`}
                      spellCheck="false"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      className="w-full rounded px-2 py-1.5 text-xs font-mono text-white placeholder-white/20 outline-none"
                      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                      value={form.wistiaVideos[key].freeLessonVideoId}
                      onChange={e => setVideoField(key, 'freeLessonVideoId', e.target.value)}
                      placeholder={key === 'en' ? 'bsqtbsbig6' : `fallback: ${form.wistiaVideos.en.freeLessonVideoId || 'EN value'}`}
                      spellCheck="false"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Leave blank to use EN values as fallback.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <SectionLabel>Call to Action</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="CTA Text" value={form.ctaText} onChange={v => setField('ctaText', v)} placeholder="Get Started for 8€/month" />
          <Field label="CTA URL" value={form.ctaUrl} onChange={v => setField('ctaUrl', v)} placeholder="https://academy.ermesdance.com/pricing" />
        </div>
        <Field label="Free Lesson Title (shown in modal)" value={form.freeLessonTitle} onChange={v => setField('freeLessonTitle', v)} placeholder="Lesson 2 - Hip Motion (FREE LESSON)" />
      </div>

      {/* About HTML */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <SectionLabel>About These Courses — artist-specific HTML block</SectionLabel>
        <textarea
          className="w-full rounded-lg px-3 py-2.5 text-xs font-mono text-white placeholder-white/20 outline-none resize-y"
          style={{
            background: '#111',
            border: '1px solid rgba(255,255,255,0.09)',
            minHeight: 280,
            lineHeight: 1.6,
          }}
          value={form.aboutHtml}
          onChange={e => setField('aboutHtml', e.target.value)}
          placeholder={`Paste the full about_these_courses HTML block for this artist.\n\n<style>...</style>\n<section class="ed4-section">...</section>\n<script>...</script>`}
          spellCheck="false"
          onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.28)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
        />
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Will be auto-translated × 4 languages
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.25)', color: '#ff6666' }}>
          {error}
        </div>
      )}

      {/* Generate button */}
      {!busy && step !== 4 && (
        <button
          onClick={generate}
          disabled={busy}
          className="w-full h-12 rounded-xl font-black text-base tracking-wide transition-opacity"
          style={{ background: '#fff', color: '#000' }}
          onMouseEnter={e => (e.target.style.opacity = '0.88')}
          onMouseLeave={e => (e.target.style.opacity = '1')}
        >
          ⚡ Generate in 5 languages
        </button>
      )}

      {/* Progress */}
      {busy && (
        <ProgressBar currentStep={step} />
      )}

      {/* Results */}
      {pages && step === 4 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              ✓ 5 pages generated
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={saveHistory}
                className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Save to History
              </button>
              <button
                onClick={downloadZip}
                className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                style={{ background: '#fff', color: '#000' }}
              >
                ⬇ Download all 5 (ZIP)
              </button>
              <button
                onClick={() => setStep(0)}
                className="h-8 px-4 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                ← Edit form
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
            {LANGS.map(({ key, label, flag }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="px-4 py-2.5 text-sm font-bold transition-colors"
                style={{
                  borderBottom: activeTab === key ? '2px solid #fff' : '2px solid transparent',
                  marginBottom: -1,
                  color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.35)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === key ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  paddingBottom: 10,
                }}
              >
                {flag} {label}
              </button>
            ))}
          </div>

          {LANGS.map(({ key }) => activeTab === key && (
            <div key={key}>
              <div className="flex gap-2 mb-3 flex-wrap">
                <button
                  onClick={() => copyOne(key)}
                  className="h-8 px-3 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                >
                  Copy HTML
                </button>
                <button
                  onClick={() => downloadOne(key)}
                  className="h-8 px-3 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                >
                  ⬇ {`${form.pageSlug || 'lp-artista'}${FILE_SUFFIX[key]}.html`}
                </button>
              </div>
              <textarea
                readOnly
                className="w-full rounded-xl px-4 py-3 text-xs font-mono resize-y"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  color: 'rgba(255,255,255,0.45)',
                  minHeight: 320,
                  lineHeight: 1.6,
                  outline: 'none',
                }}
                value={pages[key]}
              />
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
