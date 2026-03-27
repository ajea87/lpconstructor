import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, deleteFromHistory } from '../lib/storage';
import JSZip from 'jszip';

const LANGS = ['en', 'es', 'it', 'fr', 'de'];
const FLAG = { en: '🇬🇧', es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷', de: '🇩🇪' };
const FILE_SUFFIX = { en: '', es: '-es', it: '-it', fr: '-fr', de: '-de' };

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('en', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch { return iso; }
}

export default function History() {
  const [items, setItems] = useState([]);

  useEffect(() => { setItems(getHistory()); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    deleteFromHistory(id);
    setItems(getHistory());
  }

  async function downloadZip(entry) {
    const zip = new JSZip();
    const slug = entry.pageSlug || 'lp-artista';
    for (const lang of LANGS) {
      if (entry.pages?.[lang]) zip.file(`${slug}${FILE_SUFFIX[lang]}.html`, entry.pages[lang]);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${slug}.zip`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadOne(entry, lang) {
    const slug = entry.pageSlug || 'lp-artista';
    const blob = new Blob([entry.pages[lang]], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${slug}${FILE_SUFFIX[lang]}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-4">🕓</div>
        <h2 className="text-xl font-black mb-2">No generated pages yet</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Pages you generate will appear here.
        </p>
        <Link
          to="/"
          className="inline-flex h-10 items-center px-6 rounded-xl text-sm font-bold"
          style={{ background: '#fff', color: '#000' }}
        >
          Go to Builder
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-20">
      <h1 className="text-2xl font-black mb-1">Generated Pages</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {items.length} {items.length === 1 ? 'entry' : 'entries'} saved locally.
      </p>

      <div className="space-y-4">
        {items.map(entry => (
          <div
            key={entry.id}
            className="rounded-xl p-5"
            style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-black text-base">{entry.artistName || 'Unknown Artist'}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {entry.pageSlug || 'no-slug'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {LANGS.map(lang => entry.pages?.[lang] && (
                <button
                  key={lang}
                  onClick={() => downloadOne(entry, lang)}
                  className="h-8 px-3 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {FLAG[lang]} {lang.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => downloadZip(entry)}
                className="h-8 px-4 rounded-lg text-xs font-bold"
                style={{ background: '#fff', color: '#000' }}
              >
                ⬇ ZIP
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                className="h-8 px-3 rounded-lg text-xs font-bold ml-auto"
                style={{ background: 'rgba(255,50,50,0.08)', color: 'rgba(255,80,80,0.7)', border: '1px solid rgba(255,50,50,0.15)' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
