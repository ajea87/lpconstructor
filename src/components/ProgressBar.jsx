const STEPS = [
  { id: 1, label: 'Translating UI texts', detail: '1 API call' },
  { id: 2, label: 'Translating About section', detail: '4 parallel API calls' },
  { id: 3, label: 'Building HTML files', detail: '5 languages' },
  { id: 4, label: 'Done', detail: '' },
];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="rounded-xl p-6 space-y-3" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Generating…
      </p>
      {STEPS.map(step => {
        const done    = currentStep > step.id;
        const active  = currentStep === step.id;
        const pending = currentStep < step.id;
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: done ? '#fff' : active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                color: done ? '#000' : active ? '#fff' : 'rgba(255,255,255,0.25)',
                border: active ? '1px solid rgba(255,255,255,0.4)' : 'none',
              }}
            >
              {done ? '✓' : step.id}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-semibold ${pending ? 'text-gray-500' : 'text-white'}`}
              >
                {step.label}
              </span>
              {step.detail && (
                <span className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {step.detail}
                </span>
              )}
            </div>
            {active && (
              <div className="flex-none">
                <span className="text-xs animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }}>●●●</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
