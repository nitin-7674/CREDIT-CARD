import React, { useEffect, useState } from 'react';

const SHIPPING_STEPS = [
  { key: 'approved',     icon: '✅', title: 'Application Approved',  sub: 'Your application has been verified and approved.' },
  { key: 'manufacturing',icon: '🏭', title: 'Card Manufacturing',    sub: 'Your personalised card is being produced.' },
  { key: 'dispatched',   icon: '📦', title: 'Dispatched',            sub: null },
  { key: 'out_delivery', icon: '🚚', title: 'Out for Delivery',      sub: 'Expected delivery within 3–5 business days.' },
  { key: 'delivered',    icon: '🏠', title: 'Delivered',             sub: 'Activate your card via the CardVault app.' },
];

export default function ShippingStatus({ shipping, onReset }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Animate steps appearing one by one
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= 3) clearInterval(interval); // Show first 3 immediately, rest on delivery
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cv-panel">
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(232,201,110,.1)' }}>🚀</div>
        <div>
          <div className="cv-panel-title">Shipping &amp; Activation</div>
          <div className="cv-panel-sub">Your card is on the way!</div>
        </div>
      </div>
      <div className="cv-panel-body">
        <div className="cv-alert cv-alert-success" style={{ marginBottom: 24 }}>
          🎉 Congratulations! Your application has been approved and card is being dispatched.
        </div>

        {shipping && (
          <div style={{ marginBottom: 24 }}>
            <div className="cv-info-row"><span className="cv-info-key">Tracking No.</span><span className="cv-info-val">{shipping.tracking_number}</span></div>
            <div className="cv-info-row"><span className="cv-info-key">Courier</span><span className="cv-info-val">{shipping.courier}</span></div>
            <div className="cv-info-row"><span className="cv-info-key">Est. Delivery</span><span className="cv-info-val">{shipping.estimated_delivery ? new Date(shipping.estimated_delivery).toLocaleDateString('en-IN') : '—'}</span></div>
          </div>
        )}

        <div className="cv-section-title">Delivery Tracking</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SHIPPING_STEPS.map((step, i) => {
            const isDone   = i < visibleCount - 1;
            const isActive = i === visibleCount - 1;
            const isLast   = i === SHIPPING_STEPS.length - 1;
            return (
              <div key={step.key} style={{ display: 'flex', gap: 16, opacity: i < visibleCount ? 1 : .2, transition: 'opacity .5s' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isDone ? 'var(--accent3)' : isActive ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.85rem', zIndex: 1,
                    background: isDone ? 'var(--accent3)' : isActive ? 'var(--accent)' : 'var(--surface)',
                    boxShadow: isActive ? '0 0 16px rgba(232,201,110,.4)' : 'none',
                    animation: isActive ? 'pulse 1.5s infinite' : 'none',
                    transition: 'all .5s',
                  }}>{step.icon}</div>
                  {!isLast && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 28, margin: '2px 0',
                      background: isDone ? 'var(--accent3)' : 'var(--border)',
                      transition: 'background .5s',
                    }} />
                  )}
                </div>
                <div style={{ paddingBottom: isLast ? 0 : 24, paddingTop: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{step.title}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>
                    {step.key === 'dispatched' && shipping
                      ? `Shipped via ${shipping.courier}. Tracking: ${shipping.tracking_number}`
                      : step.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-cv-secondary" style={{ marginTop: 24 }} onClick={onReset}>
          Apply for Another Card
        </button>
      </div>
    </div>
  );
}
