export default function Field({ label, value, onChange, placeholder, type = 'text', className = '', hint }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white placeholder-white/20 outline-none transition-colors"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.28)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
      />
      {hint && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{hint}</p>}
    </div>
  );
}
