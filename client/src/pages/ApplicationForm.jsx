import React, { useState } from 'react';

const EMPLOYMENT_OPTIONS = [
  { value: 'salaried',     label: 'Salaried' },
  { value: 'self_employed',label: 'Self-Employed' },
  { value: 'business',     label: 'Business Owner' },
  { value: 'student',      label: 'Student' },
  { value: 'retired',      label: 'Retired' },
];
const DURATION_OPTIONS = [
  { value: 'less1', label: 'Less than 1 year' },
  { value: '1to3',  label: '1 – 3 years' },
  { value: '3to5',  label: '3 – 5 years' },
  { value: '5plus', label: '5+ years' },
];
const LOAN_OPTIONS = [
  { value: 'none',     label: 'None' },
  { value: 'home',     label: 'Home Loan' },
  { value: 'car',      label: 'Car Loan' },
  { value: 'personal', label: 'Personal Loan' },
  { value: 'multiple', label: 'Multiple Loans' },
];

export default function ApplicationForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', dob: '', pan: '',
    mobile: '', email: '', annual_income: '',
    employment_type: '', emp_duration: '',
    existing_loans: 'none', emi_load: '0', address: '',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.first_name.trim())   e.first_name = 'Required';
    if (!form.last_name.trim())    e.last_name  = 'Required';
    if (!form.dob)                 e.dob        = 'Required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase())) e.pan = 'Invalid PAN (e.g. ABCDE1234F)';
    if (!form.mobile.trim())       e.mobile     = 'Required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.annual_income || isNaN(form.annual_income)) e.annual_income = 'Enter valid income';
    if (!form.employment_type)     e.employment_type = 'Select employment type';
    if (!form.emp_duration)        e.emp_duration    = 'Select duration';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, pan: form.pan.toUpperCase(), annual_income: parseInt(form.annual_income), emi_load: parseInt(form.emi_load) || 0 });
  }

  const field = (label, key, props = {}) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        value={form[key]}
        onChange={set(key)}
        style={errors[key] ? { borderColor: 'var(--danger) !important' } : {}}
        {...props}
      />
      {errors[key] && <div style={{ color: 'var(--danger)', fontSize: '.75rem', marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  const select = (label, key, options) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <select className="form-select" value={form[key]} onChange={set(key)}>
        <option value="">Select...</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {errors[key] && <div style={{ color: 'var(--danger)', fontSize: '.75rem', marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  return (
    <div className="cv-panel">
      <div className="cv-panel-header">
        <div className="cv-panel-icon" style={{ background: 'rgba(232,201,110,.1)' }}>📋</div>
        <div>
          <div className="cv-panel-title">Application Form</div>
          <div className="cv-panel-sub">Personal &amp; Financial Details</div>
        </div>
      </div>
      <div className="cv-panel-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">{field('First Name', 'first_name', { placeholder: 'Arjun' })}</div>
            <div className="col-md-6">{field('Last Name',  'last_name',  { placeholder: 'Sharma' })}</div>
            <div className="col-md-6">{field('Date of Birth', 'dob', { type: 'date' })}</div>
            <div className="col-md-6">{field('PAN Number', 'pan', { placeholder: 'ABCDE1234F', maxLength: 10, style: { textTransform: 'uppercase' } })}</div>
            <div className="col-md-6">{field('Mobile', 'mobile', { placeholder: '+91 98765 43210', type: 'tel' })}</div>
            <div className="col-md-6">{field('Email',  'email',  { placeholder: 'arjun@example.com', type: 'email' })}</div>
            <div className="col-12">{field('Annual Income (₹)', 'annual_income', { type: 'number', placeholder: '800000', min: 0 })}</div>
            <div className="col-md-6">{select('Employment Type',     'employment_type', EMPLOYMENT_OPTIONS)}</div>
            <div className="col-md-6">{select('Employment Duration', 'emp_duration',    DURATION_OPTIONS)}</div>
            <div className="col-md-6">{select('Existing Loans', 'existing_loans', LOAN_OPTIONS)}</div>
            <div className="col-md-6">{field('Monthly EMI Burden (₹)', 'emi_load', { type: 'number', placeholder: '0', min: 0 })}</div>
            <div className="col-12">{field('Residential Address', 'address', { placeholder: '123, MG Road, Bengaluru – 560001' })}</div>
          </div>

          {error && <div className="cv-alert cv-alert-error">⚠️ {error}</div>}

          <button type="submit" className="btn-cv-primary mt-3" disabled={loading}>
            {loading && <span className="cv-loader" />}
            {loading ? 'Submitting…' : 'Submit Application →'}
          </button>
        </form>
      </div>
    </div>
  );
}
