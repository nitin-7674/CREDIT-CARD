import { useState, useCallback } from 'react';
import * as api from '../services/api';

const INITIAL_STATE = {
  step:         1,
  loading:      false,
  error:        null,
  application:  null,
  creditScore:  null,
  eligibility:  null,
  offers:       [],
  selectedOffer: null,
  shipping:     null,
};

export function useApplication() {
  const [state, setState] = useState(INITIAL_STATE);

  const update = useCallback((patch) =>
    setState((prev) => ({ ...prev, ...patch })), []);

  // Step 1 → Submit application form
  const submitApplication = useCallback(async (formData) => {
    update({ loading: true, error: null });
    try {
      const res = await api.submitApplication(formData);
      update({ application: res.application, loading: false, step: 2 });
      return res.application;
    } catch (err) {
      update({ loading: false, error: err.response?.data?.errors?.[0]?.msg || err.message });
      return null;
    }
  }, [update]);

  // Step 2 → Run eligibility + credit score
  const runEligibility = useCallback(async (applicationId) => {
    update({ loading: true, error: null });
    try {
      const res = await api.runEligibility(applicationId);
      update({
        creditScore: res.credit_score,
        eligibility: res.eligibility,
        loading: false,
      });
      return res;
    } catch (err) {
      update({ loading: false, error: err.response?.data?.message || err.message });
      return null;
    }
  }, [update]);

  // Step 2 → 3: Generate offers
  const generateOffers = useCallback(async (applicationId) => {
    update({ loading: true, error: null });
    try {
      const res = await api.generateOffers(applicationId);
      update({ offers: res.offers, loading: false, step: 3 });
      return res.offers;
    } catch (err) {
      update({ loading: false, error: err.response?.data?.message || err.message });
      return null;
    }
  }, [update]);

  // Step 3 → Select offer
  const selectOffer = useCallback((offer) => {
    update({ selectedOffer: offer });
  }, [update]);

  // Step 3 → 4: Confirm offer
  const confirmOffer = useCallback(async (applicationId, offerId) => {
    update({ loading: true, error: null });
    try {
      const res = await api.confirmOffer(applicationId, offerId);
      update({ shipping: res.shipping, loading: false, step: 4 });
      return res.shipping;
    } catch (err) {
      update({ loading: false, error: err.response?.data?.message || err.message });
      return null;
    }
  }, [update]);

  // Reset everything
  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return {
    ...state,
    actions: { submitApplication, runEligibility, generateOffers, selectOffer, confirmOffer, reset },
  };
}
