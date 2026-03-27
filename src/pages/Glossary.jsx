import { useState, useEffect } from 'react';
import { getGlossary, saveGlossary, resetGlossary } from '../lib/glossary';

const LANGS = ['es', 'it', 'fr', 'de'];
const LANG_LABELS = { es: '🇪🇸 ES', it: '🇮🇹 IT', fr: '🇫🇷 FR', de: '🇩🇪 DE' };

export default function Glossary() {
  const [entries, setEntries] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => { setEntries(getGlossary()); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t); } }, [toast]);

  function updateCell(index, lang, value) {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, [lang]: value } : e));
  }

  function addRow() {
    setEntries(prev => [...prev, { en: '', es: '', it: '', fr: '', de: '' }]);
  }

  function deleteRow(index) {
    setEntries(prev => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    saveGlossary(entries);
    setToast('Saved ✓');
  }

  function handleReset() {
    if (!confirm('Reset glossary to defaults?')) return;
    const def = resetGlossary();
    setEntries(def);
    setToast('Reset to defaults ✓');
  }

  const cellStyle = {
    background: '#111',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    padding: '6px 10px',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black mb-1">Translation Glossary</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            These translations are injected into every API call and applied as post-processing. They override AI output.
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleReset}
            className="h-9 px-4 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Reset to defaults
          </button>
          <button
            onClick={addRow}
            className="h-9 px-4 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            + Add term
          </button>
          <button
            onClick={handleSave}
            className="h-9 px-4 rounded-lg text-xs font-bold"
            style={{ background: '#fff', color: '#000' }}
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl" style={{ border: '1px solid #1a1a1a' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
              <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', minWidth: 200 }}>English</th>
              {LANGS.map(l => (
                <th key={l} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', minWidth: 160 }}>
                  {LANG_LABELS[l]}
                </th>
              ))}
              <th className="px-4 py-3" style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td className="px-4 py-2">
                  <input
                    style={cellStyle}
                    value={entry.en || ''}
                    onChange={e => updateCell(i, 'en', e.target.value)}
                    placeholder="English term"
                  />
                </td>
                {LANGS.map(l => (
                  <td key={l} className="px-4 py-2">
                    <input
                      style={cellStyle}
                      value={entry[l] || ''}
                      onChange={e => updateCell(i, l, e.target.value)}
                      placeholder={`${l} translation`}
                    />
                  </td>
                ))}
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => deleteRow(i)}
                    className="w-7 h-7 rounded-lg text-sm transition-colors flex items-center justify-center mx-auto"
                    style={{ background: 'rgba(255,50,50,0.08)', color: 'rgba(255,80,80,0.6)' }}
                    title="Delete"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            No entries. Click "Add term" to get started.
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
