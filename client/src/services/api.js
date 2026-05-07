import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── APPLICATION SERVICES ─────────────────────────────────────────────────────

/** Submit a new application */
export const submitApplication = (formData) =>
  api.post('/applications', formData).then((r) => r.data);

/** Fetch application by ID */
export const getApplication = (id) =>
  api.get(`/applications/${id}`).then((r) => r.data);

/** Run eligibility check for an application */
export const runEligibility = (id) =>
  api.post(`/applications/${id}/eligibility`).then((r) => r.data);

/** Generate card offers for an application */
export const generateOffers = (id) =>
  api.post(`/applications/${id}/offers`).then((r) => r.data);

/** Confirm an offer and trigger shipping */
export const confirmOffer = (applicationId, offerId) =>
  api.post(`/applications/${applicationId}/confirm-offer`, { offer_id: offerId }).then((r) => r.data);

/** Get shipping details */
export const getShipping = (id) =>
  api.get(`/applications/${id}/shipping`).then((r) => r.data);

export default api;
