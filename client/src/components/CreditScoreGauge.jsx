import React from 'react';

function getScoreStyle(score) {
  if (score >= 800) return { cat: 'Excellent',     color: 'var(--accent3)' };
  if (score >= 720) return { cat: 'Good',          color: 'var(--accent2)' };
  if (score >= 650) return { cat: 'Fair',          color: 'var(--accent)' };
  if (score >= 580) return { cat: 'Below Average', color: '#f0934a' };
  return                   { cat: 'Poor',          color: 'var(--danger)' };
}

export default function CreditScoreGauge({ creditScore }) {
  const score = creditScore?.score;
  const { cat, color } = score ? getScoreStyle(score) : { cat: 'Awaiting Evaluation', color: 'var(--accent)' };
  const pct    = score ? (score - 300) / 600 : 0;
  const offset = 172 - pct * 172;

  return (
    <div className="cv-panel" style={{ marginBottom: 24 }}>
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(232,201,110,.08)' }}>📊</div>
        <div className="cv-panel-title">Credit Score</div>
      </div>
      <div className="cv-panel-body">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0' }}>
          <svg viewBox="0 0 140 70" style={{ width: 140, height: 70, overflow: 'visible' }}>
            <path
              fill="none" strokeWidth="14" strokeLinecap="round"
              stroke="var(--surface2)"
              d="M 15 65 A 55 55 0 0 1 125 65"
              strokeDasharray="172" strokeDashoffset="0"
            />
            <path
              fill="none" strokeWidth="14" strokeLinecap="round"
              stroke={color}
              d="M 15 65 A 55 55 0 0 1 125 65"
              strokeDasharray="172"
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke .5s' }}
            />
          </svg>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.4rem', color, lineHeight: 1 }}>
            {score || '—'}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {cat}
          </div>
        </div>
        {creditScore && (
          <>
            <div className="cv-info-row"><span className="cv-info-key">Range</span><span className="cv-info-val">300 – 900</span></div>
            <div className="cv-info-row"><span className="cv-info-key">Bureau</span><span className="cv-info-val">{creditScore.bureau}</span></div>
            <div className="cv-info-row">
              <span className="cv-info-key">Generated</span>
              <span className="cv-info-val">{new Date(creditScore.generated_at).toLocaleDateString('en-IN')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
