import React from 'react';

function fmt(n) { return n ? `₹${Number(n).toLocaleString('en-IN')}` : '—'; }

const EMP_LABELS = {
  salaried: 'Salaried', self_employed: 'Self-Employed',
  business: 'Business Owner', student: 'Student', retired: 'Retired',
};

export default function ApplicationSummary({ application }) {
  return (
    <div className="cv-panel">
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(109,232,192,.08)' }}>📁</div>
        <div className="cv-panel-title">Application Summary</div>
      </div>
      <div className="cv-panel-body">
        {!application ? (
          <div style={{ color: 'var(--muted)', fontSize: '.85rem', textAlign: 'center', padding: '12px 0' }}>
            Fill the form to see your summary.
          </div>
        ) : (
          <>
            <div className="cv-info-row">
              <span className="cv-info-key">Name</span>
              <span className="cv-info-val">{application.first_name} {application.last_name}</span>
            </div>
            <div className="cv-info-row">
              <span className="cv-info-key">PAN</span>
              <span className="cv-info-val">{application.pan}</span>
            </div>
            <div className="cv-info-row">
              <span className="cv-info-key">Income</span>
              <span className="cv-info-val">{fmt(application.annual_income)}</span>
            </div>
            <div className="cv-info-row">
              <span className="cv-info-key">Employment</span>
              <span className="cv-info-val">{EMP_LABELS[application.employment_type] || application.employment_type}</span>
            </div>
            <div className="cv-info-row">
              <span className="cv-info-key">Existing Loans</span>
              <span className="cv-info-val" style={{ textTransform: 'capitalize' }}>{application.existing_loans}</span>
            </div>
            <div className="cv-info-row">
              <span className="cv-info-key">Status</span>
              <span className="cv-info-val" style={{ color: 'var(--accent3)', textTransform: 'capitalize' }}>
                {application.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
