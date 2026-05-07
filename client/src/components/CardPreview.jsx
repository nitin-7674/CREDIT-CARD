import React from 'react';

const TIER_STYLES = {
  platinum: { bg: 'linear-gradient(135deg,#0d1520 0%,#152240 40%,#1e3a6e 100%)', brand: 'PLATINUM' },
  gold:     { bg: 'linear-gradient(135deg,#1a1508 0%,#3d2e08 40%,#7a5c12 100%)', brand: 'GOLD' },
  standard: { bg: 'linear-gradient(135deg,#0d1a14 0%,#0f2a1e 40%,#15503a 100%)', brand: 'SELECT' },
  default:  { bg: 'linear-gradient(135deg,#111318 0%,#1a1f2e 100%)',             brand: 'CARDVAULT' },
};

function fakeCardNum() {
  return [1,2,3,4].map(() => Math.floor(1000 + Math.random() * 9000)).join(' ');
}

export default function CardPreview({ applicant, selectedOffer }) {
  const tier = selectedOffer?.offer_type || 'default';
  const style = TIER_STYLES[tier] || TIER_STYLES.default;
  const name = applicant
    ? `${applicant.first_name} ${applicant.last_name}`.toUpperCase()
    : 'YOUR NAME';
  const limit = selectedOffer
    ? `₹${Number(selectedOffer.credit_limit).toLocaleString('en-IN')}`
    : '——';

  return (
    <div className="cv-panel" style={{ marginBottom: 24 }}>
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(232,201,110,.08)' }}>✨</div>
        <div className="cv-panel-title">Your Card Preview</div>
      </div>
      <div className="cv-panel-body">
        <div style={{
          width: '100%', aspectRatio: '1.586/1', borderRadius: 18,
          padding: 24, position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: style.bg, transition: 'all .5s',
        }}>
          {/* Shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.05) 50%,transparent 60%)',
            animation: 'shimmer 3s infinite',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 28, borderRadius: 5,
              background: 'linear-gradient(135deg,#d4a84b,#f0c84a,#d4a84b)',
              border: '1px solid rgba(255,255,255,.1)',
            }} />
            <div style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem',
              letterSpacing: '.1em', opacity: .9,
              color: selectedOffer ? undefined : 'rgba(255,255,255,.3)',
            }}>
              {style.brand}
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.9rem', letterSpacing: '.2em', color: 'rgba(255,255,255,.7)' }}>
            {selectedOffer ? fakeCardNum() : '•••• •••• •••• ••••'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.6)' }}>{name}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8rem', color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                LIMIT: {limit}
              </div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'rgba(255,255,255,.3)', textAlign: 'right' }}>
              VALID THRU<br/>MM/YY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
