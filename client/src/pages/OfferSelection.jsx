import React, { useEffect, useRef } from 'react';

const BADGE = {
  platinum: { cls: 'rgba(79,142,247,.15)', color: 'var(--accent2)', text: 'PREMIUM' },
  gold:     { cls: 'rgba(232,201,110,.15)', color: 'var(--accent)',  text: 'POPULAR' },
  standard: { cls: 'rgba(109,232,192,.15)', color: 'var(--accent3)', text: 'STARTER' },
};

function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}`; }

export default function OfferSelection({
  application, offers, selectedOffer, loading, error,
  onFetchOffers, onSelect, onConfirm, onReset,
}) {
  const ran = useRef(false);
  useEffect(() => {
    if (!ran.current && application && !offers.length) {
      ran.current = true;
      onFetchOffers(application.id);
    }
  }, [application, offers, onFetchOffers]);

  return (
    <div className="cv-panel">
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(109,232,192,.1)' }}>💳</div>
        <div>
          <div className="cv-panel-title">Card Offers</div>
          <div className="cv-panel-sub">Personalised for your profile</div>
        </div>
      </div>
      <div className="cv-panel-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
            <span className="cv-loader" /> Generating your offers…
          </div>
        )}
        {error && <div className="cv-alert cv-alert-error">⚠️ {error}</div>}

        {!loading && offers.length > 0 && (
          <>
            <div className="cv-section-title">Recommended for You</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {offers.map((o) => {
                const badge   = BADGE[o.offer_type] || BADGE.standard;
                const selected = selectedOffer?.id === o.id;
                return (
                  <div key={o.id}
                    onClick={() => onSelect(o)}
                    style={{
                      border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 14, padding: 18,
                      background: selected ? 'rgba(232,201,110,.06)' : 'var(--surface2)',
                      cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      transition: 'all .25s',
                      transform: selected ? 'translateX(4px)' : 'none',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: badge.cls, color: badge.color,
                      fontSize: '.7rem', fontWeight: 700,
                      padding: '3px 10px', borderRadius: 20,
                    }}>{badge.text}</div>

                    <div style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: '1.15rem', letterSpacing: '.06em', marginBottom: 6,
                    }}>{o.offer_name}</div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        `Limit: ${fmt(o.credit_limit)}`,
                        `APR: ${o.apr}%`,
                        `Rewards: ${o.rewards_rate}x`,
                        `Fee: ${fmt(o.annual_fee)}/yr`,
                      ].map((chip) => (
                        <span key={chip} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '2px 8px',
                          fontFamily: "'JetBrains Mono',monospace", fontSize: '.72rem',
                        }}>{chip}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedOffer && (
              <button className="btn-cv-primary" style={{ marginTop: 24 }} onClick={() => onConfirm(application.id, selectedOffer.id)}>
                Confirm &amp; Proceed to Shipping →
              </button>
            )}
            <button className="btn-cv-secondary" onClick={onReset}>Restart Application</button>
          </>
        )}
      </div>
    </div>
  );
}
