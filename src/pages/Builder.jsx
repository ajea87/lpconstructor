import { useState, useEffect } from 'react';
import Field from '../components/Field';
import ProgressBar from '../components/ProgressBar';
import { getGlossary } from '../lib/glossary';
import {
  getAnthropicKey, getOpenAIKey, saveAnthropicKey, saveOpenAIKey,
  getProvider, setProvider,
  translateTexts, translateAboutHtml, applyGlossaryPostProcessing,
} from '../lib/api';
import { buildPage, buildAboutHtmlStr } from '../lib/generator';
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
  aboutData: {
    introText: '',
    totalLessons: '',
    category: '',
    courses: [],
    instructorName: '',
    instructorRole: '',
    instructorPhoto: '',
  },
};

// ── About Form Builder sub-components ──────────────────────

function AboutFormBuilder({ aboutData, onChange }) {
  function setField(key, val) {
    onChange({ ...aboutData, [key]: val });
  }

  function addCourse() {
    onChange({
      ...aboutData,
      courses: [...(aboutData.courses || []), { title: '', level: 'All levels', lessons: [], open: true }],
    });
  }

  function updateCourse(i, patch) {
    const courses = aboutData.courses.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    onChange({ ...aboutData, courses });
  }

  function removeCourse(i) {
    onChange({ ...aboutData, courses: aboutData.courses.filter((_, idx) => idx !== i) });
  }

  function moveCourse(i, dir) {
    const courses = [...(aboutData.courses || [])];
    const j = i + dir;
    if (j < 0 || j >= courses.length) return;
    [courses[i], courses[j]] = [courses[j], courses[i]];
    onChange({ ...aboutData, courses });
  }

  function addLesson(courseIdx) {
    const courses = aboutData.courses.map((c, i) =>
      i === courseIdx
        ? { ...c, lessons: [...(c.lessons || []), { title: '', wistiaId: '' }] }
        : c
    );
    onChange({ ...aboutData, courses });
  }

  function updateLesson(courseIdx, lessonIdx, patch) {
    const courses = aboutData.courses.map((c, i) =>
      i === courseIdx
        ? { ...c, lessons: c.lessons.map((l, j) => j === lessonIdx ? { ...l, ...patch } : l) }
        : c
    );
    onChange({ ...aboutData, courses });
  }

  function removeLesson(courseIdx, lessonIdx) {
    const courses = aboutData.courses.map((c, i) =>
      i === courseIdx
        ? { ...c, lessons: c.lessons.filter((_, j) => j !== lessonIdx) }
        : c
    );
    onChange({ ...aboutData, courses });
  }

  const inputStyle = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    padding: '7px 10px',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const smallInputStyle = { ...inputStyle, fontSize: 12, padding: '5px 8px' };

  return (
    <div className="space-y-5">
      {/* Intro text */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Intro Text</p>
        <textarea
          style={{ ...inputStyle, minHeight: 160, lineHeight: 1.6, resize: 'vertical' }}
          value={aboutData.introText || ''}
          onChange={e => setField('introText', e.target.value)}
          placeholder="Write the artist's intro — who they are, their teaching philosophy, what makes these courses unique..."
          spellCheck="false"
        />
      </div>

      {/* Course meta */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Course Meta</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Total Lessons</label>
            <input
              type="number"
              style={inputStyle}
              value={aboutData.totalLessons || ''}
              onChange={e => setField('totalLessons', e.target.value)}
              placeholder="30"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <input
              style={inputStyle}
              value={aboutData.category || ''}
              onChange={e => setField('category', e.target.value)}
              placeholder="Traditional Bachata"
            />
          </div>
        </div>
      </div>

      {/* Courses */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Courses</p>
        <div className="space-y-3">
          {(aboutData.courses || []).map((course, ci) => (
            <div key={ci} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10 }}>
              {/* Course header */}
              <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                onClick={() => updateCourse(ci, { open: !course.open })}
              >
                <span className="text-white/40 text-xs">{course.open ? '▼' : '▶'}</span>
                <span className="flex-1 text-sm font-semibold text-white truncate">
                  {course.title || `Course ${ci + 1}`}
                </span>
                <span className="text-xs text-gray-500">{(course.lessons || []).length} lessons</span>
                <div className="flex gap-1 ml-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => moveCourse(ci, -1)}
                    className="w-6 h-6 rounded text-xs text-white/40 hover:text-white flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >↑</button>
                  <button
                    onClick={() => moveCourse(ci, 1)}
                    className="w-6 h-6 rounded text-xs text-white/40 hover:text-white flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >↓</button>
                  <button
                    onClick={() => removeCourse(ci)}
                    className="w-6 h-6 rounded text-xs flex items-center justify-center"
                    style={{ background: 'rgba(255,50,50,0.1)', color: 'rgba(255,80,80,0.7)' }}
                  >✕</button>
                </div>
              </div>

              {course.open && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: '#2a2a2a' }}>
                  <div className="grid grid-cols-3 gap-3 pt-3">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 mb-1 block">Course Title</label>
                      <input
                        style={inputStyle}
                        value={course.title}
                        onChange={e => updateCourse(ci, { title: e.target.value })}
                        placeholder="Movement and Body Posture in Traditional Bachata"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Level</label>
                      <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={course.level}
                        onChange={e => updateCourse(ci, { level: e.target.value })}
                      >
                        <option>All levels</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-2">
                    {(course.lessons || []).map((lesson, li) => (
                      <div key={li} className="flex gap-2 items-center">
                        <div className="flex-1 min-w-0">
                          <input
                            style={smallInputStyle}
                            value={lesson.title}
                            onChange={e => updateLesson(ci, li, { title: e.target.value })}
                            placeholder={`Lesson ${li + 1} title`}
                          />
                        </div>
                        <div style={{ width: 130, flexShrink: 0 }}>
                          <input
                            style={{ ...smallInputStyle, fontFamily: 'monospace' }}
                            value={lesson.wistiaId || ''}
                            onChange={e => updateLesson(ci, li, { wistiaId: e.target.value })}
                            placeholder="Wistia ID (free)"
                          />
                        </div>
                        <button
                          onClick={() => removeLesson(ci, li)}
                          className="w-7 h-7 flex-none rounded flex items-center justify-center text-xs"
                          style={{ background: 'rgba(255,50,50,0.1)', color: 'rgba(255,80,80,0.7)' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addLesson(ci)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', background: 'transparent' }}
                  >
                    + Add Lesson
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addCourse}
          className="mt-3 text-sm font-bold px-4 py-2 rounded-lg w-full"
          style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', background: 'transparent' }}
        >
          + Add Course
        </button>
      </div>

      {/* Instructor */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Instructor</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <input style={inputStyle} value={aboutData.instructorName || ''} onChange={e => setField('instructorName', e.target.value)} placeholder="Carolina Rosa" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Role</label>
            <input style={inputStyle} value={aboutData.instructorRole || ''} onChange={e => setField('instructorRole', e.target.value)} placeholder="Traditional Bachata Artist & Educator" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Photo URL</label>
            <input style={inputStyle} value={aboutData.instructorPhoto || ''} onChange={e => setField('instructorPhoto', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── API Key Selector ────────────────────────────────────────

function ApiKeySection({ provider, onProviderChange }) {
  const [anthropicKey, setAnthropicKeyLocal] = useState(getAnthropicKey);
  const [openaiKey, setOpenAIKeyLocal] = useState(getOpenAIKey);

  function handleAnthropicKey(v) {
    setAnthropicKeyLocal(v);
    saveAnthropicKey(v);
  }
  function handleOpenAIKey(v) {
    setOpenAIKeyLocal(v);
    saveOpenAIKey(v);
  }
  function selectProvider(p) {
    setProvider(p);
    onProviderChange(p);
  }

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">AI Provider</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => selectProvider('anthropic')}
          className="flex-1 h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          style={{
            background: provider === 'anthropic' ? '#fff' : 'transparent',
            color: provider === 'anthropic' ? '#000' : 'rgba(255,255,255,0.5)',
            border: provider === 'anthropic' ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span>🟣</span> Anthropic Claude
        </button>
        <button
          onClick={() => selectProvider('openai')}
          className="flex-1 h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          style={{
            background: provider === 'openai' ? '#fff' : 'transparent',
            color: provider === 'openai' ? '#000' : 'rgba(255,255,255,0.5)',
            border: provider === 'openai' ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span>🟢</span> OpenAI GPT-4o
        </button>
      </div>
      {provider === 'anthropic' && (
        <Field
          label="Anthropic API Key"
          type="password"
          value={anthropicKey}
          onChange={handleAnthropicKey}
          placeholder="sk-ant-..."
        />
      )}
      {provider === 'openai' && (
        <Field
          label="OpenAI API Key"
          type="password"
          value={openaiKey}
          onChange={handleOpenAIKey}
          placeholder="sk-..."
        />
      )}
    </div>
  );
}

// ── Main Builder ────────────────────────────────────────────

// Section header helper
const SectionLabel = ({ children }) => (
  <p className="text-xs font-black uppercase tracking-widest mb-3 text-gray-400">
    {children}
  </p>
);

export default function Builder() {
  const [provider, setProvider_local] = useState(getProvider);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [step, setStep] = useState(0);        // 0 = idle, 1-4 = progress
  const [error, setError] = useState('');
  const [pages, setPages] = useState(null);   // { en, es, it, fr, de } or { en }
  const [enOnly, setEnOnly] = useState(false);
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
    // Check that the current provider has a key set
    const currentProvider = provider;
    if (currentProvider === 'anthropic' && !getAnthropicKey()) {
      setError('Enter your Anthropic API key.');
      return;
    }
    if (currentProvider === 'openai' && !getOpenAIKey()) {
      setError('Enter your OpenAI API key.');
      return;
    }
    if (!form.aboutData.courses?.length > 0 && !form.aboutData.introText) {
      setError('Add at least one course or intro text in the About section.');
      return;
    }

    setError(''); setStep(1); setPages(null);
    const glossary = getGlossary();

    try {
      // Step 1: Translate UI texts
      const uiTrans = await translateTexts(form, glossary);

      // Step 2: Translate About x 4 in parallel
      setStep(2);
      const enAboutHtml = buildAboutHtmlStr(form.aboutData);
      const [aboutEs, aboutIt, aboutFr, aboutDe] = await Promise.all([
        translateAboutHtml(enAboutHtml, 'es', glossary),
        translateAboutHtml(enAboutHtml, 'it', glossary),
        translateAboutHtml(enAboutHtml, 'fr', glossary),
        translateAboutHtml(enAboutHtml, 'de', glossary),
      ]);

      const aboutByLang = {
        en: enAboutHtml,
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
      setEnOnly(false);
      setActiveTab('en');
      setStep(4);
    } catch (err) {
      setError(err.message || String(err));
      setStep(0);
    }
  }

  function generateEnOnly() {
    setError('');
    const enAboutHtml = buildAboutHtmlStr(form.aboutData);
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
    const html = buildPage(form, 'en', enStrings, enAboutHtml);
    setPages({ en: html });
    setEnOnly(true);
    setActiveTab('en');
    setStep(4);
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
    const fname = enOnly && lang === 'en' ? `${slug}.html` : `${slug}${FILE_SUFFIX[lang]}.html`;
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
      enOnly,
    });
    setToast('Saved to history ✓');
  }

  const busy = step > 0 && step < 4;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-20">
      <h1 className="text-2xl font-black mb-1">LP Builder</h1>
      <p className="text-sm mb-8 text-gray-400">
        Generate landing pages in 5 languages with one click.
      </p>

      {/* API Key Selector */}
      <ApiKeySection provider={provider} onProviderChange={setProvider_local} />

      {/* Artist */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
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
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
        <SectionLabel>Wistia Videos</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <th className="text-left pb-3 pr-4 font-bold text-xs uppercase tracking-wider text-gray-400" style={{ width: 80 }}>Language</th>
                <th className="text-left pb-3 pr-4 font-bold text-xs uppercase tracking-wider text-gray-400">Hero Video ID</th>
                <th className="text-left pb-3 font-bold text-xs uppercase tracking-wider text-gray-400">Free Lesson Video ID</th>
              </tr>
            </thead>
            <tbody>
              {LANGS.map(({ key, flag, label }) => (
                <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-2 pr-4">
                    <span className="text-base mr-1">{flag}</span>
                    <span className="text-xs font-bold text-gray-400">{label}</span>
                    {key !== 'en' && (
                      <span className="ml-1 text-xs text-gray-600">↳</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      className="w-full rounded px-2 py-1.5 text-xs font-mono text-white outline-none"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                      value={form.wistiaVideos[key].heroVideoId}
                      onChange={e => setVideoField(key, 'heroVideoId', e.target.value)}
                      placeholder={key === 'en' ? 'j1mton7xgc' : `fallback: ${form.wistiaVideos.en.heroVideoId || 'EN value'}`}
                      spellCheck="false"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      className="w-full rounded px-2 py-1.5 text-xs font-mono text-white outline-none"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
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
        <p className="text-xs mt-2 text-gray-500">
          Leave blank to use EN values as fallback.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
        <SectionLabel>Call to Action</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="CTA Text" value={form.ctaText} onChange={v => setField('ctaText', v)} placeholder="Get Started for 8€/month" />
          <Field label="CTA URL" value={form.ctaUrl} onChange={v => setField('ctaUrl', v)} placeholder="https://academy.ermesdance.com/pricing" />
        </div>
        <Field label="Free Lesson Title (shown in modal)" value={form.freeLessonTitle} onChange={v => setField('freeLessonTitle', v)} placeholder="Lesson 2 - Hip Motion (FREE LESSON)" />
      </div>

      {/* About These Courses */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-400">About These Courses</p>
        <p className="text-sm text-gray-400 mb-4">Builds the course section programmatically — translated × 4 languages</p>
        <AboutFormBuilder
          aboutData={form.aboutData}
          onChange={data => setField('aboutData', data)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.25)', color: '#ff6666' }}>
          {error}
        </div>
      )}

      {/* Generate buttons */}
      {!busy && step !== 4 && (
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <button
              onClick={() => {
                const hasKey = provider === 'anthropic' ? !!getAnthropicKey() : !!getOpenAIKey();
                if (!hasKey) {
                  setError(`Enter your ${provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key to generate in 5 languages.`);
                  return;
                }
                generate();
              }}
              className="w-full h-12 rounded-xl font-black text-base tracking-wide transition-opacity"
              style={{ background: '#fff', color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              ⚡ Generate in 5 languages
            </button>
          </div>
          <button
            onClick={generateEnOnly}
            className="h-12 px-5 rounded-xl font-black text-sm tracking-wide transition-opacity whitespace-nowrap"
            style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.72')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            → English only
          </button>
        </div>
      )}

      {/* Progress */}
      {busy && (
        <ProgressBar currentStep={step} />
      )}

      {/* Results */}
      {pages && step === 4 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm font-bold text-gray-400">
              {enOnly ? '✓ English page generated' : '✓ 5 pages generated'}
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={saveHistory}
                className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Save to History
              </button>
              {!enOnly && (
                <button
                  onClick={downloadZip}
                  className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                  style={{ background: '#fff', color: '#000' }}
                >
                  ⬇ Download all 5 (ZIP)
                </button>
              )}
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
          {!enOnly && (
            <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
              {LANGS.map(({ key, label, flag }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="px-4 py-2.5 text-sm font-bold transition-colors"
                  style={{
                    borderBottom: activeTab === key ? '2px solid #fff' : '2px solid transparent',
                    marginBottom: -1,
                    color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.4)',
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
          )}

          {(enOnly ? [{ key: 'en' }] : LANGS).map(({ key }) => activeTab === key && (
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
                  ⬇ {enOnly ? `${form.pageSlug || 'lp-artista'}.html` : `${form.pageSlug || 'lp-artista'}${FILE_SUFFIX[key]}.html`}
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
