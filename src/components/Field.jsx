export default function Field({ label, value, onChange, placeholder, type = 'text', className = '', hint }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
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
        className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white outline-none transition-colors"
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          '--tw-placeholder-opacity': 1,
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
        onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
