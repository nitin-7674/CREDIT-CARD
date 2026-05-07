import React from 'react';

const STAGES = [
  { n: 1, label: 'Application' },
  { n: 2, label: 'Eligibility Check' },
  { n: 3, label: 'Offer Generation' },
  { n: 4, label: 'Shipping' },
];

export default function StageTracker({ currentStep }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 48px' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '8px 16px', overflowX: 'auto',
      }}>
        {STAGES.map((s, i) => {
          const isDone   = currentStep > s.n;
          const isActive = currentStep === s.n;
          return (
            <React.Fragment key={s.n}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', borderRadius: 10,
                background: isActive ? 'rgba(232,201,110,.08)' : 'transparent',
                color: isDone ? 'var(--accent3)' : isActive ? 'var(--accent)' : 'var(--muted)',
                whiteSpace: 'nowrap', fontSize: '.85rem', fontWeight: 500,
                transition: 'all .3s',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  border: '2px solid currentColor',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '.7rem', fontWeight: 700, flexShrink: 0,
                  background: isDone ? 'var(--accent3)' : isActive ? 'var(--accent)' : 'transparent',
                  borderColor: isDone ? 'var(--accent3)' : isActive ? 'var(--accent)' : 'currentColor',
                  color: (isDone || isActive) ? 'var(--bg)' : 'currentColor',
                  transition: 'all .3s',
                }}>
                  {isDone ? '✓' : s.n}
                </div>
                {s.label}
              </div>
              {i < STAGES.length - 1 && (
                <span style={{ color: 'var(--border)', fontSize: '1.1rem', padding: '0 4px' }}>›</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
