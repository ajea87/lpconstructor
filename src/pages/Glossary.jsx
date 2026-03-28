import { getGlossary } from '../lib/glossary';

const LANGS = ['es', 'it', 'fr', 'de'];
const LANG_LABELS = { es: '🇪🇸 ES', it: '🇮🇹 IT', fr: '🇫🇷 FR', de: '🇩🇪 DE' };

const entries = getGlossary();

export default function Glossary() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1">Translation Glossary</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          These translations are injected into every API call and applied as post-processing.
          To update, edit <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>src/data/defaultGlossary.js</code>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #222' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#111', borderBottom: '1px solid #222' }}>
              <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400" style={{ minWidth: 200 }}>English</th>
              {LANGS.map(l => (
                <th key={l} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400" style={{ minWidth: 160 }}>
                  {LANG_LABELS[l]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td className="px-4 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{entry.en}</td>
                {LANGS.map(l => (
                  <td key={l} className="px-4 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{entry[l] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
