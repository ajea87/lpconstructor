import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Field from '../components/Field';
import ProgressBar from '../components/ProgressBar';
import { getGlossary } from '../lib/glossary';
import {
  getAnthropicKey, getOpenAIKey, saveAnthropicKey, saveOpenAIKey,
  getProvider, setProvider,
  getTranslationModel, setTranslationModel as persistTranslationModel,
  HAIKU_MODEL, SONNET_MODEL,
  translateTexts, translateAboutHtmlAllLangs, applyGlossaryPostProcessing,
  getTranslationCache, clearTranslationCache,
} from '../lib/api';
import { buildPage, buildAboutHtmlStr, buildMultilingualPage } from '../lib/generator';
import { saveToHistory, getHistory } from '../lib/storage';
import JSZip from 'jszip';

const LANGS = [
  { key: 'en', label: 'EN', flag: '🇬🇧' },
  { key: 'es', label: 'ES', flag: '🇪🇸' },
  { key: 'it', label: 'IT', flag: '🇮🇹' },
  { key: 'fr', label: 'FR', flag: '🇫🇷' },
  { key: 'de', label: 'DE', flag: '🇩🇪' },
];

const LANG_NAMES = { en: 'English', es: 'Español', it: 'Italiano', fr: 'Français', de: 'Deutsch' };
const BASE_LANG_KEY = 'base-lang';
const TARGET_LANGS_KEY = 'target-langs';

const DEFAULT_FORM = {
  pageSlug: '',
  artistName: '',
  artistRole: '',
  courseLevel: '',
  courseTitle: '',
  courseSubtitle: '',
  heroVideoIds: { en: '', es: '', it: '', fr: '', de: '' },
  heroVideoPerLang: false,
  freeLessonVideoIds: { en: '', es: '', it: '', fr: '', de: '' },
  freeLessonVideoPerLang: false,
  ctaText: 'Get Started for 8€/month',
  ctaUrls: {
    en: 'https://academy.ermesdance.com/pricing',
    es: 'https://academy.ermesdance.com/pricing-es',
    it: 'https://academy.ermesdance.com/pricing-it',
    fr: 'https://academy.ermesdance.com/pricing-fr',
    de: 'https://academy.ermesdance.com/pricing-de',
  },
  freeLessonTitle: '',
  aboutData: {
    introText: '',
    totalLessons: '',
    category: '',
    courses: [],
    instructorPhoto: '',
  },
};

// ── About Form Builder sub-components ──────────────────────

function AboutFormBuilder({ aboutData, onChange, artistName, artistRole }) {
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
                      <div key={li}>
                        {/* Row 1: title + wistia single + toggle + delete */}
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 min-w-0">
                            <input
                              style={smallInputStyle}
                              value={lesson.title}
                              onChange={e => updateLesson(ci, li, { title: e.target.value })}
                              placeholder={`Lesson ${li + 1} title`}
                            />
                          </div>
                          {!lesson.wistiaPerLang && (
                            <div style={{ width: 120, flexShrink: 0 }}>
                              <input
                                style={{ ...smallInputStyle, fontFamily: 'monospace' }}
                                value={lesson.wistiaId || ''}
                                onChange={e => updateLesson(ci, li, { wistiaId: e.target.value })}
                                placeholder="Wistia ID (free)"
                              />
                            </div>
                          )}
                          <button
                            title={lesson.wistiaPerLang ? 'Collapse per-language' : 'Per language'}
                            onClick={() => {
                              if (lesson.wistiaPerLang) {
                                updateLesson(ci, li, {
                                  wistiaId: lesson.wistiaIds?.en || '',
                                  wistiaIds: undefined,
                                  wistiaPerLang: false,
                                });
                              } else {
                                updateLesson(ci, li, {
                                  wistiaIds: { en: lesson.wistiaId || '', es: '', it: '', fr: '', de: '' },
                                  wistiaId: undefined,
                                  wistiaPerLang: true,
                                });
                              }
                            }}
                            className="flex-none h-7 px-2 rounded text-xs font-bold"
                            style={{
                              background: lesson.wistiaPerLang ? 'rgba(255,200,0,0.15)' : 'rgba(255,255,255,0.06)',
                              color: lesson.wistiaPerLang ? '#ffd000' : 'rgba(255,255,255,0.4)',
                              border: lesson.wistiaPerLang ? '1px solid rgba(255,200,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
                              whiteSpace: 'nowrap',
                            }}
                          >🌐</button>
                          <button
                            onClick={() => removeLesson(ci, li)}
                            className="w-7 h-7 flex-none rounded flex items-center justify-center text-xs"
                            style={{ background: 'rgba(255,50,50,0.1)', color: 'rgba(255,80,80,0.7)' }}
                          >✕</button>
                        </div>
                        {/* Row 2: per-language wistia inputs */}
                        {lesson.wistiaPerLang && (
                          <div className="mt-1.5 ml-0 grid grid-cols-5 gap-1.5">
                            {[
                              { key: 'en', flag: '🇬🇧' },
                              { key: 'es', flag: '🇪🇸' },
                              { key: 'it', flag: '🇮🇹' },
                              { key: 'fr', flag: '🇫🇷' },
                              { key: 'de', flag: '🇩🇪' },
                            ].map(({ key, flag }) => (
                              <div key={key}>
                                <label className="text-xs text-gray-500 mb-0.5 block">{flag} {key.toUpperCase()}</label>
                                <input
                                  style={{ ...smallInputStyle, fontFamily: 'monospace', fontSize: 11 }}
                                  value={lesson.wistiaIds?.[key] || ''}
                                  onChange={e => updateLesson(ci, li, {
                                    wistiaIds: { ...lesson.wistiaIds, [key]: e.target.value },
                                  })}
                                  placeholder="ID"
                                />
                              </div>
                            ))}
                          </div>
                        )}
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
          className="w-full h-12 bg-white text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 mt-4 transition-colors hover:bg-gray-100"
        >
          <span className="text-lg font-black">+</span> Add Course
        </button>
      </div>

      {/* Instructor */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Instructor</p>
        <div
          className="rounded-lg px-4 py-3 mb-3 text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
        >
          Instructor name and role are taken from the Artist section above.
          <div className="mt-1 font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {artistName || <span style={{ opacity: 0.4 }}>Name not set</span>}
            {artistRole ? ` · ${artistRole}` : ''}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Photo URL</label>
          <input style={inputStyle} value={aboutData.instructorPhoto || ''} onChange={e => setField('instructorPhoto', e.target.value)} placeholder="https://..." />
        </div>
      </div>
    </div>
  );
}

// ── API Key Selector ────────────────────────────────────────

function ApiKeySection({ provider, onProviderChange, translationModel, onTranslationModelChange }) {
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
      {provider === 'anthropic' && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #222' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">Translation Model</p>
          <div className="flex gap-2">
            {[
              { id: HAIKU_MODEL,  label: '⚡ Haiku',  sub: 'fast & cheap' },
              { id: SONNET_MODEL, label: '✦ Sonnet', sub: 'higher quality' },
            ].map(({ id, label, sub }) => (
              <button
                key={id}
                onClick={() => { persistTranslationModel(id); onTranslationModelChange(id); }}
                className="flex-1 h-9 rounded-lg text-xs font-bold flex flex-col items-center justify-center leading-tight transition-colors"
                style={{
                  background: translationModel === id ? '#fff' : 'transparent',
                  color: translationModel === id ? '#000' : 'rgba(255,255,255,0.5)',
                  border: translationModel === id ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {label}
                <span style={{ fontSize: 9, opacity: 0.6, fontWeight: 'normal' }}>{sub}</span>
              </button>
            ))}
          </div>
        </div>
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
  const [pages, setPages] = useState(null);   // { en, es, it, fr, de } or subset
  const [baseLang, setBaseLangLocal] = useState(() => localStorage.getItem(BASE_LANG_KEY) || 'en');
  const [targetLangs, setTargetLangs] = useState(() => {
    try { const s = localStorage.getItem(TARGET_LANGS_KEY); return s ? JSON.parse(s) : ['en','es','it','fr','de']; } catch { return ['en','es','it','fr','de']; }
  });
  const [isMono, setIsMono] = useState(false);
  const [monoPage, setMonoPage] = useState(null);
  const [cachedTranslations, setCachedTranslations] = useState(null);
  const [translationModel, setTranslationModelLocal] = useState(getTranslationModel);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('en');
  const [toast, setToast] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    const entry = getHistory().find(e => e.id === editId);
    if (entry?.form) {
      setForm(entry.form);
      setEditingEntry(entry);
    }
    setSearchParams({}, { replace: true });
  }, []);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t); } }, [toast]);

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function setVideoId(field, lang, val) {
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: val } }));
  }

  function buildBaseStrings(f) {
    return {
      courseLevel:      f.courseLevel,
      courseTitle:      f.courseTitle,
      courseSubtitle:   f.courseSubtitle,
      ctaText:          f.ctaText,
      freeLessonTitle:  f.freeLessonTitle,
      beyondSuffix:     'You Also Get',
      unlimitedTitle:   'Unlimited Access to all Courses',
      activateSound:    'Activate Sound',
      freeLessonBtn:    'Free Lesson',
      coursesLabel:     'Courses',
      biteLabel:        'Bite-Sized Classes',
      accessLabel:      'Access',
      allRightsReserved:'All rights reserved.',
    };
  }

  function setBaseLang(lang) {
    localStorage.setItem(BASE_LANG_KEY, lang);
    setBaseLangLocal(lang);
    setTargetLangs(prev => {
      const next = prev.includes(lang) ? prev : [...prev, lang];
      localStorage.setItem(TARGET_LANGS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function toggleTargetLang(lang) {
    if (lang === baseLang) return;
    setTargetLangs(prev => {
      const next = prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang];
      localStorage.setItem(TARGET_LANGS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function fileSuffix(lang) {
    return lang === baseLang ? '' : '-' + lang;
  }

  async function generate() {
    const langsToTranslate = targetLangs.filter(l => l !== baseLang);

    // API key guard — only needed when there are langs to translate
    if (langsToTranslate.length > 0) {
      const currentProvider = provider;
      if (currentProvider === 'anthropic' && !getAnthropicKey()) { setError('Enter your Anthropic API key.'); return; }
      if (currentProvider === 'openai' && !getOpenAIKey()) { setError('Enter your OpenAI API key.'); return; }
    }

    setError('');
    setStep(langsToTranslate.length > 0 ? 1 : 3);
    setPages(null); setMonoPage(null); setIsMono(false);
    const glossary = getGlossary();

    try {
      let uiTrans = {};
      let aboutByLang = {};
      const aboutBase = { ...form.aboutData, instructorName: form.artistName, instructorRole: form.artistRole };
      const baseAboutHtml = buildAboutHtmlStr(aboutBase, baseLang);

      if (langsToTranslate.length > 0) {
        // Step 1: Translate UI texts
        uiTrans = await translateTexts(form, glossary, baseLang, langsToTranslate);

        // Step 2: Translate About — single call for all target langs
        setStep(2);
        const aboutHtmlsByLang = {};
        for (const lang of langsToTranslate) {
          aboutHtmlsByLang[lang] = buildAboutHtmlStr(aboutBase, lang);
        }
        const { result: aboutTranslated, fromCache, textCount } = await translateAboutHtmlAllLangs(baseAboutHtml, aboutHtmlsByLang, glossary, baseLang, langsToTranslate);
        setCacheInfo({ fromCache, textCount });

        aboutByLang = { [baseLang]: baseAboutHtml };
        for (const lang of langsToTranslate) {
          aboutByLang[lang] = applyGlossaryPostProcessing(aboutTranslated[lang] || baseAboutHtml, lang, glossary);
        }
      } else {
        // No translation needed
        setStep(3);
        aboutByLang = { [baseLang]: baseAboutHtml };
      }

      // Step 3: Build pages
      setStep(3);
      const baseStrings = buildBaseStrings(form);
      const result = {};
      for (const lang of targetLangs) {
        const strings = lang === baseLang ? baseStrings : { ...baseStrings, ...(uiTrans[lang] || {}) };
        result[lang] = buildPage(form, lang, strings, aboutByLang[lang] || baseAboutHtml, baseLang, targetLangs);
      }

      setCachedTranslations({ uiTrans, aboutByLang, enStrings: baseStrings });
      setPages(result);
      setIsMono(false);
      setMonoPage(null);
      setActiveTab(baseLang);
      saveToHistory({ artistName: form.artistName, pageSlug: form.pageSlug, form, pages: result, baseLang, generatedLangs: targetLangs });
      setStep(4);
    } catch (err) {
      setError(err.message || String(err));
      setStep(0);
    }
  }

  async function generateMono() {
    setError(''); setMonoPage(null); setPages(null); setIsMono(false);

    const langsToTranslate = targetLangs.filter(l => l !== baseLang);
    let uiTrans, aboutByLang, baseStrings_val;

    if (cachedTranslations) {
      ({ uiTrans, aboutByLang, enStrings: baseStrings_val } = cachedTranslations);
    } else {
      if (langsToTranslate.length > 0) {
        const currentProvider = provider;
        if (currentProvider === 'anthropic' && !getAnthropicKey()) {
          setError('Enter your Anthropic API key to generate multilingual page.');
          return;
        }
        if (currentProvider === 'openai' && !getOpenAIKey()) {
          setError('Enter your OpenAI API key to generate multilingual page.');
          return;
        }
        setStep(1);
      } else {
        setStep(3);
      }
      const glossary = getGlossary();
      try {
        const aboutBase = { ...form.aboutData, instructorName: form.artistName, instructorRole: form.artistRole };
        const baseAboutHtml = buildAboutHtmlStr(aboutBase, baseLang);

        if (langsToTranslate.length > 0) {
          uiTrans = await translateTexts(form, glossary, baseLang, langsToTranslate);
          setStep(2);
          const aboutHtmlsByLang = {};
          for (const lang of langsToTranslate) {
            aboutHtmlsByLang[lang] = buildAboutHtmlStr(aboutBase, lang);
          }
          const { result: aboutTranslated, fromCache, textCount } = await translateAboutHtmlAllLangs(baseAboutHtml, aboutHtmlsByLang, glossary, baseLang, langsToTranslate);
          setCacheInfo({ fromCache, textCount });
          aboutByLang = { [baseLang]: baseAboutHtml };
          for (const lang of langsToTranslate) {
            aboutByLang[lang] = applyGlossaryPostProcessing(aboutTranslated[lang] || baseAboutHtml, lang, glossary);
          }
        } else {
          uiTrans = {};
          aboutByLang = { [baseLang]: baseAboutHtml };
        }
        baseStrings_val = buildBaseStrings(form);
        setCachedTranslations({ uiTrans, aboutByLang, enStrings: baseStrings_val });
      } catch (err) {
        setError(err.message || String(err));
        setStep(0);
        return;
      }
    }

    setStep(3);
    const allStrings = {};
    for (const lang of targetLangs) {
      allStrings[lang] = lang === baseLang ? baseStrings_val : { ...baseStrings_val, ...(uiTrans[lang] || {}) };
    }

    const html = buildMultilingualPage(form, allStrings, aboutByLang, baseLang, targetLangs);
    setMonoPage(html);
    setIsMono(true);
    saveToHistory({ artistName: form.artistName, pageSlug: form.pageSlug, form, pages: { mono: html }, isMono: true, baseLang, generatedLangs: targetLangs });
    setStep(4);
  }

  function copyMono() {
    navigator.clipboard.writeText(monoPage).then(() => setToast('Copied ✓'));
  }

  function downloadMono() {
    const slug = form.pageSlug || 'lp-artista';
    const blob = new Blob([monoPage], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${slug}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    const zip = new JSZip();
    const slug = form.pageSlug || 'lp-artista';
    for (const lang of targetLangs) {
      if (pages[lang]) zip.file(`${slug}${fileSuffix(lang)}.html`, pages[lang]);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${slug}.zip`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadOne(lang) {
    const slug = form.pageSlug || 'lp-artista';
    const fname = `${slug}${fileSuffix(lang)}.html`;
    const blob = new Blob([pages[lang]], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }

  function copyOne(lang) {
    navigator.clipboard.writeText(pages[lang]).then(() => setToast(`${lang.toUpperCase()} copied ✓`));
  }

  function saveHistory() {
    if (isMono) {
      saveToHistory({ artistName: form.artistName, pageSlug: form.pageSlug, form, pages: { mono: monoPage }, isMono: true, baseLang, generatedLangs: targetLangs });
    } else {
      saveToHistory({ artistName: form.artistName, pageSlug: form.pageSlug, form, pages, baseLang, generatedLangs: targetLangs });
    }
    setToast('Saved to history ✓');
  }

  function cancelEdit() {
    setEditingEntry(null);
    setForm(DEFAULT_FORM);
    setStep(0);
    setPages(null);
    setMonoPage(null);
    setIsMono(false);
    setError('');
  }

  const busy = step > 0 && step < 4;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-20">
      <h1 className="text-2xl font-black mb-1">LP Builder</h1>
      <p className="text-sm mb-8 text-gray-400">
        Generate landing pages in 5 languages with one click.
      </p>

      {/* Edit-mode banner */}
      {editingEntry && (
        <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 mb-6 text-sm font-bold"
          style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.35)', color: '#ffd000' }}>
          <span>
            ✏️ Editing: <span style={{ opacity: 0.8 }}>{editingEntry.artistName} · {editingEntry.pageSlug}</span>
            <span className="ml-2 font-normal" style={{ opacity: 0.6 }}>— Changes will save as a new version</span>
          </span>
          <button
            onClick={cancelEdit}
            className="shrink-0 h-7 px-3 rounded-lg text-xs font-black"
            style={{ background: 'rgba(255,200,0,0.15)', border: '1px solid rgba(255,200,0,0.3)', color: '#ffd000' }}
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Content language */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">Content Language</p>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>The language you're writing the form in. Other languages will be translated from this.</p>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map(({ key, flag, label }) => (
            <button
              key={key}
              onClick={() => setBaseLang(key)}
              className="h-9 px-3 rounded-lg text-sm font-bold transition-colors"
              style={{
                background: baseLang === key ? '#fff' : 'transparent',
                color: baseLang === key ? '#000' : 'rgba(255,255,255,0.5)',
                border: baseLang === key ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {flag} {label}
            </button>
          ))}
        </div>
      </div>

      {/* API Key Selector */}
      <ApiKeySection
        provider={provider}
        onProviderChange={setProvider_local}
        translationModel={translationModel}
        onTranslationModelChange={setTranslationModelLocal}
      />

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
        <div className="space-y-4">
          {[
            { label: 'Hero Video ID', idsField: 'heroVideoIds', perLangField: 'heroVideoPerLang', placeholder: 'j1mton7xgc' },
            { label: 'Free Lesson Video ID', idsField: 'freeLessonVideoIds', perLangField: 'freeLessonVideoPerLang', placeholder: 'bsqtbsbig6' },
          ].map(({ label, idsField, perLangField, placeholder }) => {
            const perLang = form[perLangField];
            const ids = form[idsField] || {};
            const monoInput = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#fff', fontSize: 12, padding: '6px 10px', outline: 'none', fontFamily: 'monospace', width: '100%' };
            return (
              <div key={idsField}>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-xs font-bold text-gray-400 flex-1">{label}</label>
                  <button
                    onClick={() => setForm(f => ({
                      ...f,
                      [perLangField]: !perLang,
                      [idsField]: perLang
                        ? { ...ids, en: ids.en || '' }
                        : { en: ids.en || '', es: '', it: '', fr: '', de: '' },
                    }))}
                    className="h-6 px-2 rounded text-xs font-bold"
                    style={{
                      background: perLang ? 'rgba(255,200,0,0.15)' : 'rgba(255,255,255,0.06)',
                      color: perLang ? '#ffd000' : 'rgba(255,255,255,0.4)',
                      border: perLang ? '1px solid rgba(255,200,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >🌐 Per language</button>
                </div>
                {!perLang ? (
                  <input
                    style={monoInput}
                    value={ids.en || ''}
                    onChange={e => setVideoId(idsField, 'en', e.target.value)}
                    placeholder={placeholder}
                    spellCheck="false"
                  />
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {LANGS.map(({ key, flag }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500 mb-1 block">{flag} {key.toUpperCase()}</label>
                        <input
                          style={monoInput}
                          value={ids[key] || ''}
                          onChange={e => setVideoId(idsField, key, e.target.value)}
                          placeholder={key === 'en' ? placeholder : ids.en || '↳ EN'}
                          spellCheck="false"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
        <SectionLabel>Call to Action</SectionLabel>
        <div className="mb-3">
          <Field label="CTA Text" value={form.ctaText} onChange={v => setField('ctaText', v)} placeholder="Get Started for 8€/month" />
        </div>
        <div className="mb-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">CTA URL — per language</label>
          <div className="space-y-2">
            {LANGS.map(({ key, flag }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm w-6 shrink-0">{flag}</span>
                <input
                  className="flex-1 rounded px-2 py-1.5 text-xs text-white outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', fontFamily: 'inherit' }}
                  value={(form.ctaUrls || {})[key] || ''}
                  onChange={e => setForm(f => ({ ...f, ctaUrls: { ...f.ctaUrls, [key]: e.target.value } }))}
                  placeholder={`https://academy.ermesdance.com/pricing${key === 'en' ? '' : '-' + key}`}
                  spellCheck="false"
                />
              </div>
            ))}
          </div>
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
          artistName={form.artistName}
          artistRole={form.artistRole}
        />
      </div>

      {/* Generate languages */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#111', border: '1px solid #222' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">Generate Languages</p>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map(({ key, flag, label }) => {
            const isBase = key === baseLang;
            const checked = targetLangs.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleTargetLang(key)}
                className="h-9 px-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5"
                style={{
                  background: checked ? (isBase ? 'rgba(255,200,0,0.12)' : 'rgba(255,255,255,0.1)') : 'transparent',
                  color: checked ? (isBase ? '#ffd000' : '#fff') : 'rgba(255,255,255,0.3)',
                  border: checked ? (isBase ? '1px solid rgba(255,200,0,0.35)' : '1px solid rgba(255,255,255,0.25)') : '1px solid rgba(255,255,255,0.1)',
                  cursor: isBase ? 'default' : 'pointer',
                }}
                disabled={isBase}
              >
                {flag} {label}{isBase && <span style={{fontSize:9,opacity:0.6}}> base</span>}
              </button>
            );
          })}
        </div>
        {targetLangs.length === 1 && (
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Only base language — no API call needed.</p>
        )}
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
              onClick={generate}
              className="w-full h-12 rounded-xl font-black text-base tracking-wide transition-opacity"
              style={{ background: '#fff', color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {targetLangs.length === 1
                ? (editingEntry ? '⚡ Regenerate (no API)' : '⚡ Generate (no API)')
                : (editingEntry ? `⚡ Regenerate in ${targetLangs.length} languages` : `⚡ Generate in ${targetLangs.length} languages`)}
            </button>
          </div>
          {targetLangs.length > 1 && (
            <button
              onClick={generateMono}
              className="h-12 px-5 rounded-xl font-black text-sm tracking-wide transition-opacity whitespace-nowrap"
              style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.72')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              🌐 Single multilingual file
            </button>
          )}
        </div>
      )}

      {/* Cache info */}
      {cacheInfo && !busy && (
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {cacheInfo.fromCache
              ? `⚡ About section from cache — ~${cacheInfo.textCount * 30} tokens saved`
              : `${cacheInfo.textCount} text strings translated · saved to cache`}
          </p>
          {cacheInfo.fromCache && (
            <button
              onClick={() => { clearTranslationCache(); setCacheInfo(null); }}
              className="text-xs"
              style={{ color: 'rgba(255,100,100,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Clear cache
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {busy && (
        <ProgressBar currentStep={step} />
      )}

      {/* Mono results */}
      {isMono && monoPage && step === 4 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm font-bold text-gray-400">✓ Single multilingual file generated</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={saveHistory}
                className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Save to History
              </button>
              <button
                onClick={() => { setStep(0); setIsMono(false); setMonoPage(null); }}
                className="h-8 px-4 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                ← Edit form
              </button>
            </div>
          </div>
          <div className="mb-3 px-4 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Single file · All 5 languages · Language auto-detected from browser
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={copyMono}
              className="h-8 px-3 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            >
              Copy HTML
            </button>
            <button
              onClick={downloadMono}
              className="h-8 px-3 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            >
              ⬇ {form.pageSlug || 'lp-artista'}.html
            </button>
          </div>
          <textarea
            readOnly
            className="w-full rounded-xl px-4 py-3 text-xs font-mono resize-y"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: 'rgba(255,255,255,0.45)', minHeight: 320, lineHeight: 1.6, outline: 'none' }}
            value={monoPage}
          />
        </div>
      )}

      {/* Results */}
      {pages && step === 4 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm font-bold text-gray-400">
              {targetLangs.length === 1 ? '✓ 1 page generated' : `✓ ${targetLangs.length} pages generated`}
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={saveHistory}
                className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Save to History
              </button>
              {targetLangs.length > 1 && (
                <button
                  onClick={downloadZip}
                  className="h-8 px-4 rounded-lg text-xs font-bold transition-colors"
                  style={{ background: '#fff', color: '#000' }}
                >
                  ⬇ Download all {targetLangs.length} (ZIP)
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
          {targetLangs.length > 1 && (
            <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
              {LANGS.filter(({ key }) => targetLangs.includes(key)).map(({ key, label, flag }) => (
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

          {targetLangs.map(lang => activeTab === lang && (
            <div key={lang}>
              <div className="flex gap-2 mb-3 flex-wrap">
                <button
                  onClick={() => copyOne(lang)}
                  className="h-8 px-3 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                >
                  Copy HTML
                </button>
                <button
                  onClick={() => downloadOne(lang)}
                  className="h-8 px-3 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                >
                  ⬇ {`${form.pageSlug || 'lp-artista'}${fileSuffix(lang)}.html`}
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
                value={pages[lang]}
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
