import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

import { useApplication } from './hooks/useApplication';

import StageTracker       from './components/StageTracker';
import CardPreview        from './components/CardPreview';
import CreditScoreGauge   from './components/CreditScoreGauge';
import ApplicationSummary from './components/ApplicationSummary';

import ApplicationForm  from './pages/ApplicationForm';
import EligibilityCheck from './pages/EligibilityCheck';
import OfferSelection   from './pages/OfferSelection';
import ShippingStatus   from './pages/ShippingStatus';

export default function App() {
  const {
    step, loading, error,
    application, creditScore, eligibility,
    offers, selectedOffer, shipping,
    actions,
  } = useApplication();

  return (
    <div>
      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        background: 'rgba(10,12,16,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem',
            letterSpacing: '.12em', color: 'var(--accent)',
          }}>
            Card<span style={{ color: 'var(--accent2)' }}>Vault</span>
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Credit Card Origination System
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.72rem', color: 'var(--muted)' }}>
          React.js · Node.js · PostgreSQL
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 60px', textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 400,
          background: 'radial-gradient(ellipse,rgba(78,142,247,.18) 0%,transparent 70%)',
          top: -40, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 'clamp(3rem,8vw,6rem)', letterSpacing: '.08em', lineHeight: .95,
          background: 'linear-gradient(135deg,var(--accent) 0%,var(--accent2) 60%,var(--accent3) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Apply for Your<br />Dream Card
        </h1>
        <p style={{ marginTop: 18, fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 500, lineHeight: 1.7 }}>
          Instant eligibility evaluation across 5+ criteria. Get your personalised offer in under 2 minutes.
        </p>
      </section>

      {/* ── STAGE TRACKER ── */}
      <StageTracker currentStep={step} />

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 360px',
        gap: 32, alignItems: 'start',
      }}
        className="main-grid"
      >
        {/* LEFT – Active Step Panel */}
        <div>
          {step === 1 && (
            <ApplicationForm
              onSubmit={actions.submitApplication}
              loading={loading} error={error}
            />
          )}
          {step === 2 && (
            <EligibilityCheck
              application={application}
              eligibility={eligibility}
              creditScore={creditScore}
              loading={loading} error={error}
              onRunCheck={actions.runEligibility}
              onProceed={actions.generateOffers}
              onReset={actions.reset}
            />
          )}
          {step === 3 && (
            <OfferSelection
              application={application}
              offers={offers}
              selectedOffer={selectedOffer}
              loading={loading} error={error}
              onFetchOffers={actions.generateOffers}
              onSelect={actions.selectOffer}
              onConfirm={actions.confirmOffer}
              onReset={actions.reset}
            />
          )}
          {step === 4 && (
            <ShippingStatus shipping={shipping} onReset={actions.reset} />
          )}
        </div>

        {/* RIGHT – Sidebar */}
        <div>
          <CardPreview applicant={application} selectedOffer={selectedOffer} />
          <CreditScoreGauge creditScore={creditScore} />
          <ApplicationSummary application={application} />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        textAlign: 'center', padding: '32px 24px',
        color: 'var(--muted)', fontSize: '.78rem',
        borderTop: '1px solid var(--border)',
      }}>
        CardVault Credit Card Origination System &nbsp;·&nbsp;
        React.js · Node.js · Express · PostgreSQL &nbsp;·&nbsp;
        Mar – Apr 2025
      </footer>

      {/* Responsive grid fix */}
      <style>{`
        @media(max-width:820px){
          .main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
