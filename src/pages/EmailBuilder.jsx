import { useState, useMemo } from 'react';
import { generateEmailHtml } from '../lib/emailGenerator';
import { saveEmailToHistory } from '../lib/storage';

const ERMES_LOGO =
  'https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2164751305/settings_images/a873d5-a7a4-e2ba-0222-2a6224428c21_2946885f-ffea-485a-9de3-55c9ebec76f1.png';

const DEFAULT_BLOCKS = [
  { id: 'd1', type: 'logo',   url: ERMES_LOGO, width: 150, align: 'center' },
  { id: 'd2', type: 'image',  url: '', alt: 'Email header', link: '', width: 'full' },
  { id: 'd3', type: 'text',   content: 'Welcome to Ermes Dance Academy', size: 'heading', align: 'center', bg: 'white' },
  { id: 'd4', type: 'text',   content: 'Join thousands of dancers worldwide and start learning with the best instructors.', size: 'normal', align: 'center', bg: 'white' },
  { id: 'd5', type: 'button', text: 'Get Started for 8\u20ac/month', url: 'https://academy.ermesdance.com/pricing', style: 'black', align: 'center' },
  { id: 'd6', type: 'footer', copyright: '\xa9 2026 Ermes Dance Academy. All rights reserved.', unsubLink: '#', unsubText: 'Unsubscribe' },
];

const BLOCK_DEFAULTS = {
  logo:    { url: ERMES_LOGO, width: 150, align: 'center' },
  image:   { url: '', alt: '', link: '', width: 'full' },
  text:    { content: 'Your text here', size: 'normal', align: 'left', bg: 'white' },
  button:  { text: 'Click here', url: '#', style: 'black', align: 'center' },
  divider: { color: 'light' },
  spacer:  { height: 24 },
  columns: { imgUrl: '', imgAlt: '', text: 'Your text here', order: 'img-left' },
  footer:  { copyright: '\xa9 2026 Ermes Dance Academy. All rights reserved.', unsubLink: '#', unsubText: 'Unsubscribe' },
};

const BLOCK_LABELS = {
  logo: '🖼 Logo', image: '🖼 Image', text: '✏️ Text', button: '🔘 Button',
  divider: '— Divider', spacer: '⬜ Spacer', columns: '⊞ 2 Columns', footer: '🔗 Footer',
};

let _nextId = 100;
function uid() { return 'b' + (++_nextId); }

// ── Shared micro-components ───────────────────────────────────────────────────

const inputBase = {
  width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6,
  padding: '6px 10px', color: '#fff', fontSize: 12,
  fontFamily: "'Montserrat',sans-serif", outline: 'none', boxSizing: 'border-box',
};

function Lbl({ children }) {
  return (
    <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4, fontFamily: "'Montserrat',sans-serif" }}>
      {children}
    </label>
  );
}

function Inp({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputBase} />;
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function Txt({ value, onChange, placeholder, rows = 4 }) {
  return <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputBase, resize: 'vertical' }} />;
}

function Fld({ label, children }) {
  return <div style={{ marginBottom: 10 }}><Lbl>{label}</Lbl>{children}</div>;
}

// ── Block editor forms ────────────────────────────────────────────────────────

function BlockEditor({ block, onChange }) {
  const u = changes => onChange(changes);
  switch (block.type) {
    case 'logo':
      return (
        <>
          <Fld label="Logo URL"><Inp value={block.url} onChange={v => u({ url: v })} placeholder="https://..." /></Fld>
          <Fld label="Width (px)"><Inp type="number" value={String(block.width ?? 150)} onChange={v => u({ width: Number(v) || 150 })} /></Fld>
          <Fld label="Align"><Sel value={block.align} onChange={v => u({ align: v })} options={[['left','Left'],['center','Center'],['right','Right']]} /></Fld>
        </>
      );
    case 'image':
      return (
        <>
          <Fld label="Image URL"><Inp value={block.url} onChange={v => u({ url: v })} placeholder="https://..." /></Fld>
          <Fld label="Alt text"><Inp value={block.alt} onChange={v => u({ alt: v })} placeholder="Description..." /></Fld>
          <Fld label="Link (optional)"><Inp value={block.link} onChange={v => u({ link: v })} placeholder="https://..." /></Fld>
          <Fld label="Width"><Sel value={block.width} onChange={v => u({ width: v })} options={[['full','Full width'],['50%','50%']]} /></Fld>
        </>
      );
    case 'text':
      return (
        <>
          <Fld label="Content"><Txt value={block.content} onChange={v => u({ content: v })} placeholder="Your text..." rows={4} /></Fld>
          <Fld label="Size"><Sel value={block.size} onChange={v => u({ size: v })} options={[['small','Small (14px)'],['normal','Normal (16px)'],['large','Large (20px)'],['heading','Heading (28px)']]} /></Fld>
          <Fld label="Align"><Sel value={block.align} onChange={v => u({ align: v })} options={[['left','Left'],['center','Center'],['right','Right']]} /></Fld>
          <Fld label="Background"><Sel value={block.bg} onChange={v => u({ bg: v })} options={[['white','White'],['black','Black'],['beige','Beige (#f6f3ef)']]} /></Fld>
        </>
      );
    case 'button':
      return (
        <>
          <Fld label="Button text"><Inp value={block.text} onChange={v => u({ text: v })} placeholder="Click here" /></Fld>
          <Fld label="URL"><Inp value={block.url} onChange={v => u({ url: v })} placeholder="https://..." /></Fld>
          <Fld label="Style"><Sel value={block.style} onChange={v => u({ style: v })} options={[['black','Black (white text)'],['white','White (black text)']]} /></Fld>
          <Fld label="Align"><Sel value={block.align} onChange={v => u({ align: v })} options={[['left','Left'],['center','Center'],['right','Right']]} /></Fld>
        </>
      );
    case 'divider':
      return <Fld label="Color"><Sel value={block.color} onChange={v => u({ color: v })} options={[['light','Light gray'],['black','Black']]} /></Fld>;
    case 'spacer':
      return <Fld label="Height"><Sel value={String(block.height ?? 24)} onChange={v => u({ height: Number(v) })} options={[['16','16px'],['24','24px'],['32','32px'],['48','48px']]} /></Fld>;
    case 'columns':
      return (
        <>
          <Fld label="Image URL"><Inp value={block.imgUrl} onChange={v => u({ imgUrl: v })} placeholder="https://..." /></Fld>
          <Fld label="Image alt"><Inp value={block.imgAlt} onChange={v => u({ imgAlt: v })} placeholder="Description..." /></Fld>
          <Fld label="Text"><Txt value={block.text} onChange={v => u({ text: v })} placeholder="Your text..." rows={3} /></Fld>
          <Fld label="Order"><Sel value={block.order} onChange={v => u({ order: v })} options={[['img-left','Image left, text right'],['img-right','Text left, image right']]} /></Fld>
        </>
      );
    case 'footer':
      return (
        <>
          <Fld label="Copyright"><Txt value={block.copyright} onChange={v => u({ copyright: v })} placeholder="© 2026..." rows={2} /></Fld>
          <Fld label="Unsubscribe text"><Inp value={block.unsubText} onChange={v => u({ unsubText: v })} placeholder="Unsubscribe" /></Fld>
          <Fld label="Unsubscribe URL"><Inp value={block.unsubLink} onChange={v => u({ unsubLink: v })} placeholder="https://..." /></Fld>
        </>
      );
    default: return null;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EmailBuilder() {
  const [subject, setSubject]     = useState('New from Ermes Dance Academy');
  const [blocks,  setBlocks]      = useState(DEFAULT_BLOCKS);
  const [selId,   setSelId]       = useState(null);
  const [toast,   setToast]       = useState('');

  const emailHtml = useMemo(() => generateEmailHtml(subject, blocks), [subject, blocks]);

  // Block manipulation
  function addBlock(type) {
    const b = { id: uid(), type, ...BLOCK_DEFAULTS[type] };
    setBlocks(bs => [...bs, b]);
    setSelId(b.id);
  }
  function removeBlock(id) {
    setBlocks(bs => bs.filter(b => b.id !== id));
    if (selId === id) setSelId(null);
  }
  function moveBlock(id, dir) {
    setBlocks(bs => {
      const i = bs.findIndex(b => b.id === id);
      if (i < 0) return bs;
      if (dir === -1 && i === 0) return bs;
      if (dir === 1 && i === bs.length - 1) return bs;
      const arr = [...bs];
      [arr[i], arr[i + dir]] = [arr[i + dir], arr[i]];
      return arr;
    });
  }
  function updateBlock(id, changes) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...changes } : b));
  }

  // Actions
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }
  function copyHtml() {
    navigator.clipboard.writeText(emailHtml).then(() => showToast('Copied ✓'));
  }
  function downloadHtml() {
    const name = (subject || 'email').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'email';
    const blob = new Blob([emailHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name + '.html'; a.click();
    URL.revokeObjectURL(url);
  }
  function saveHistory() {
    saveEmailToHistory({ subject, html: emailHtml });
    showToast('Saved to history ✓');
  }

  const btnSec = {
    height: 30, borderRadius: 7, border: '1px solid #333', fontSize: 11, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", background: 'rgba(255,255,255,0.06)', color: '#fff',
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: "'Montserrat',sans-serif" }}>

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div style={{ width: 400, flexShrink: 0, background: '#0d0d0d', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Subject + actions (fixed header) */}
        <div style={{ padding: '18px 16px 0', flexShrink: 0 }}>
          <Lbl>Subject line</Lbl>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Email subject…"
            style={{ ...inputBase, fontSize: 13, marginBottom: 12, background: '#111', border: '1px solid #222', borderRadius: 10, padding: '8px 12px' }}
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <button onClick={copyHtml}     style={{ ...btnSec, flex: 1, background: '#fff', color: '#000', border: 'none' }}>Copy HTML</button>
            <button onClick={downloadHtml} style={{ ...btnSec, flex: 1 }}>⬇ .html</button>
            <button onClick={saveHistory}  style={{ ...btnSec, flex: 1 }}>Save</button>
          </div>
          <div style={{ height: 1, background: '#1a1a1a' }} />
        </div>

        {/* Block list (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 0' }}>
          {blocks.length === 0 && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 24 }}>
              No blocks yet — add one below
            </p>
          )}
          {blocks.map((block, i) => (
            <div key={block.id} style={{ marginBottom: 3 }}>
              {/* Block row */}
              <div
                onClick={() => setSelId(selId === block.id ? null : block.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                  background: selId === block.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: '1px solid ' + (selId === block.id ? 'rgba(255,255,255,0.14)' : 'transparent'),
                }}
              >
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: selId === block.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                  {BLOCK_LABELS[block.type] || block.type}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }}
                  disabled={i === 0}
                  style={{ background: 'none', border: 'none', color: i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)', cursor: i === 0 ? 'default' : 'pointer', fontSize: 12, padding: '2px 4px', lineHeight: 1 }}
                >↑</button>
                <button
                  onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }}
                  disabled={i === blocks.length - 1}
                  style={{ background: 'none', border: 'none', color: i === blocks.length - 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)', cursor: i === blocks.length - 1 ? 'default' : 'pointer', fontSize: 12, padding: '2px 4px', lineHeight: 1 }}
                >↓</button>
                <button
                  onClick={e => { e.stopPropagation(); removeBlock(block.id); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: 14, padding: '2px 4px', lineHeight: 1 }}
                >✕</button>
              </div>

              {/* Inline editor (visible when selected) */}
              {selId === block.id && (
                <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: '12px 12px 4px', marginTop: 2, marginBottom: 6 }}>
                  <BlockEditor block={block} onChange={ch => updateBlock(block.id, ch)} />
                </div>
              )}
            </div>
          ))}

          {/* Add block buttons */}
          <div style={{ marginTop: 14, paddingBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Add block</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
              {[
                ['logo',    '+ Logo'],
                ['image',   '+ Image'],
                ['text',    '+ Text'],
                ['button',  '+ Button'],
                ['divider', '+ Divider'],
                ['spacer',  '+ Spacer'],
                ['columns', '+ 2 Columns'],
                ['footer',  '+ Footer'],
              ].map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  style={{ height: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid #222', borderRadius: 6, color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — live preview ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e8e8e8' }}>
        {/* Preview topbar */}
        <div style={{ flexShrink: 0, padding: '10px 16px', background: '#e0e0e0', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#888', fontFamily: "'Montserrat',sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Preview
          </span>
          <span style={{ fontSize: 12, color: '#555', fontFamily: "'Montserrat',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            — {subject || '(no subject)'}
          </span>
        </div>
        {/* iframe */}
        <iframe
          srcDoc={emailHtml}
          title="Email preview"
          sandbox="allow-same-origin"
          style={{ flex: 1, border: 'none', width: '100%', background: '#f0f0f0' }}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#fff', color: '#000', padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,0.35)', zIndex: 9999, fontFamily: "'Montserrat',sans-serif" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
