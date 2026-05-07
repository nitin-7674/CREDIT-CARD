import React, { useEffect, useRef } from 'react';

const CRITERIA_META = {
  credit_score: { label: 'Credit Score (≥ 650)',          icon: '📊' },
  income:       { label: 'Annual Income (≥ ₹3,00,000)',   icon: '💰' },
  employment:   { label: 'Employment Type',               icon: '💼' },
  age:          { label: 'Age (21 – 65 years)',           icon: '🎂' },
  debt_ratio:   { label: 'EMI-to-Income Ratio (≤ 40%)',  icon: '📉' },
};

export default function EligibilityCheck({
  application, eligibility, creditScore,
  loading, error, onRunCheck, onProceed, onReset,
}) {
  const ran = useRef(false);

  useEffect(() => {
    if (!ran.current && application && !eligibility) {
      ran.current = true;
      onRunCheck(application.id);
    }
  }, [application, eligibility, onRunCheck]);

  return (
    <div className="cv-panel">
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(79,142,247,.1)' }}>🔍</div>
        <div>
          <div className="cv-panel-title">Eligibility Evaluation</div>
          <div className="cv-panel-sub">5 Rule-Based Criteria</div>
        </div>
      </div>
      <div className="cv-panel-body">

        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
            <span className="cv-loader" /> Running eligibility checks…
          </div>
        )}

        {error && <div className="cv-alert cv-alert-error">⚠️ {error}</div>}

        {eligibility && !loading && (
          <>
            <div className="cv-section-title">Evaluation Results</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {Object.entries(CRITERIA_META).map(([key, meta]) => {
                const pass = eligibility[key];
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: pass ? 'rgba(109,232,192,.06)' : 'rgba(247,95,95,.06)',
                    border: `1px solid ${pass ? 'rgba(109,232,192,.3)' : 'rgba(247,95,95,.3)'}`,
                    fontSize: '.88rem', transition: 'all .4s',
                  }}>
                    <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{meta.icon}</span>
                    <span style={{ flex: 1 }}>{meta.label}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '.7rem', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 6,
                      background: pass ? 'rgba(109,232,192,.15)' : 'rgba(247,95,95,.15)',
                      color: pass ? 'var(--accent3)' : 'var(--danger)',
                    }}>
                      {pass ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                );
              })}
            </div>

            {eligibility.is_eligible ? (
              <div className="cv-alert cv-alert-success">
                ✅ Eligible! You passed {eligibility.passed_count}/5 criteria. Proceed to see your personalised offers.
              </div>
            ) : (
              <div className="cv-alert cv-alert-error">
                ❌ Not eligible. You passed only {eligibility.passed_count}/5 criteria (minimum 4 required).
              </div>
            )}

            {eligibility.is_eligible && (
              <button className="btn-cv-primary mt-3" onClick={() => onProceed(application.id)}>
                View Card Offers →
              </button>
            )}
            <button className="btn-cv-secondary" onClick={onReset}>
              Restart Application
            </button>
          </>
        )}
      </div>
    </div>
  );
}
