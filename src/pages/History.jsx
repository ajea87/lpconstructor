import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHistory, deleteFromHistory, getEmailHistory, deleteEmailFromHistory } from '../lib/storage';
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
  const [items,      setItems]      = useState([]);
  const [emailItems, setEmailItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getHistory());
    setEmailItems(getEmailHistory());
  }, []);

  function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    deleteFromHistory(id);
    setItems(getHistory());
  }

  function handleDeleteEmail(id) {
    if (!confirm('Delete this email?')) return;
    deleteEmailFromHistory(id);
    setEmailItems(getEmailHistory());
  }

  function copyEmailHtml(html) {
    navigator.clipboard.writeText(html);
  }

  function downloadEmailHtml(entry) {
    const name = (entry.subject || 'email').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'email';
    const blob = new Blob([entry.html || ''], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name + '.html'; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip(entry) {
    const slug = entry.pageSlug || 'lp-artista';
    const pages = entry.pages || {};

    // Diagnostic
    console.log('[History] downloadZip, slug:', slug, 'pages keys:', Object.keys(pages));
    Object.entries(pages).forEach(([k, v]) => {
      console.log('[History] pages.' + k + ':', v?.length ?? 0, 'chars');
    });

    const zip = new JSZip();

    if (entry.isMono && pages.mono && pages.mono.length > 100) {
      // Single multilingual file → zip it as one file
      zip.file(slug + '.html', pages.mono);
      console.log('[History] Adding mono file:', slug + '.html');
    } else {
      // 5-lang or en-only
      LANGS.forEach(lang => {
        const html = pages[lang];
        if (html && html.length > 100) {
          zip.file(slug + FILE_SUFFIX[lang] + '.html', html);
          console.log('[History] Adding', lang + ':', html.length, 'chars');
        } else {
          console.warn('[History] Skipping lang=' + lang + ', html length:', html?.length ?? 0);
        }
      });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    console.log('[History] ZIP blob size:', blob.size, 'bytes');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = slug + '.zip'; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadMono(entry) {
    const slug = entry.pageSlug || 'lp-artista';
    const html = entry.pages?.mono || '';
    console.log('[History] downloadMono:', slug + '.html', html.length, 'chars');
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = slug + '.html'; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadOne(entry, lang) {
    const slug = entry.pageSlug || 'lp-artista';
    const html = entry.pages?.[lang] || '';
    console.log('[History] downloadOne lang=' + lang + ':', html.length, 'chars');
    const fname = entry.enOnly && lang === 'en' ? slug + '.html' : slug + FILE_SUFFIX[lang] + '.html';
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }

  if (items.length === 0 && emailItems.length === 0) {
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
            style={{ background: '#111', border: '1px solid #222' }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-black text-base">{entry.artistName || 'Unknown Artist'}</p>
                <p className="text-xs font-mono mt-0.5 text-gray-400">
                  {entry.pageSlug || 'no-slug'}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                {entry.enOnly && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
                    EN only
                  </span>
                )}
                {entry.isMono && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(100,200,255,0.08)', color: 'rgba(100,200,255,0.7)' }}>
                    🌐 multilingual
                  </span>
                )}
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {entry.isMono && entry.pages?.mono ? (
                <>
                  <button
                    onClick={() => downloadMono(entry)}
                    className="h-8 px-3 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    ⬇ {entry.pageSlug || 'lp-artista'}.html
                  </button>
                  <button
                    onClick={() => downloadZip(entry)}
                    className="h-8 px-4 rounded-lg text-xs font-bold"
                    style={{ background: '#fff', color: '#000' }}
                  >
                    ⬇ ZIP
                  </button>
                </>
              ) : (
                <>
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
                  {!entry.enOnly && (
                    <button
                      onClick={() => downloadZip(entry)}
                      className="h-8 px-4 rounded-lg text-xs font-bold"
                      style={{ background: '#fff', color: '#000' }}
                    >
                      ⬇ ZIP
                    </button>
                  )}
                </>
              )}
              {entry.form && (
                <button
                  onClick={() => navigate(`/?edit=${entry.id}`)}
                  className="h-8 px-3 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,200,0,0.08)', color: 'rgba(255,200,0,0.8)', border: '1px solid rgba(255,200,0,0.2)' }}
                >
                  ✏️ Edit
                </button>
              )}
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

      {/* ── Email history ────────────────────────────────────────────── */}
      {emailItems.length > 0 && (
        <>
          <h2 className="text-xl font-black mt-12 mb-1">Emails</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {emailItems.length} {emailItems.length === 1 ? 'email' : 'emails'} saved locally.
          </p>
          <div className="space-y-4">
            {emailItems.map(entry => (
              <div
                key={entry.id}
                className="rounded-xl p-5"
                style={{ background: '#111', border: '1px solid #222' }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-black text-base">{entry.subject || 'Untitled Email'}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {entry.html?.length ?? 0} chars
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(100,200,255,0.08)', color: 'rgba(100,200,255,0.7)' }}>
                      📧 email
                    </span>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyEmailHtml(entry.html || '')}
                    className="h-8 px-3 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Copy HTML
                  </button>
                  <button
                    onClick={() => downloadEmailHtml(entry)}
                    className="h-8 px-3 rounded-lg text-xs font-bold"
                    style={{ background: '#fff', color: '#000' }}
                  >
                    ⬇ Download
                  </button>
                  <button
                    onClick={() => handleDeleteEmail(entry.id)}
                    className="h-8 px-3 rounded-lg text-xs font-bold ml-auto"
                    style={{ background: 'rgba(255,50,50,0.08)', color: 'rgba(255,80,80,0.7)', border: '1px solid rgba(255,50,50,0.15)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
