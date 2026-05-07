/**
 * CardVault – Rule-Based Engine
 * Credit score generation + eligibility evaluation + offer recommendation
 */

// ─── CREDIT SCORE GENERATOR ───────────────────────────────────────────────────
function generateCreditScore(data) {
  let score = 600;
  const income = parseInt(data.annual_income) || 0;

  // Income factor
  if      (income >= 1_500_000) score += 120;
  else if (income >= 800_000)   score += 80;
  else if (income >= 400_000)   score += 40;
  else if (income < 200_000)    score -= 60;

  // Employment type factor
  const empScores = { salaried: 60, business: 30, self_employed: 20, retired: 0, student: -80 };
  score += empScores[data.employment_type] ?? 0;

  // Employment duration factor
  const durationScores = { '5plus': 50, '3to5': 30, '1to3': 10, 'less1': -20 };
  score += durationScores[data.emp_duration] ?? 0;

  // Existing loans factor
  const loanScores = { none: 30, home: -10, car: -20, personal: -40, multiple: -60 };
  score += loanScores[data.existing_loans] ?? 0;

  // EMI-to-income ratio factor
  const emi = parseInt(data.emi_load) || 0;
  const emiRatio = income > 0 ? (emi * 12) / income : 1;
  if      (emiRatio > 0.5) score -= 80;
  else if (emiRatio > 0.3) score -= 40;

  // Small random variance (simulates real bureau variance)
  score += Math.floor(Math.random() * 40) - 20;

  return Math.max(300, Math.min(900, Math.round(score)));
}

function getCreditCategory(score) {
  if (score >= 800) return 'Excellent';
  if (score >= 720) return 'Good';
  if (score >= 650) return 'Fair';
  if (score >= 580) return 'Below Average';
  return 'Poor';
}

// ─── ELIGIBILITY RULES ────────────────────────────────────────────────────────
function runEligibilityChecks(data, score) {
  const income = parseInt(data.annual_income) || 0;
  const emi    = parseInt(data.emi_load) || 0;
  const emiRatio = income > 0 ? (emi * 12) / income : 1;

  const dobDate = new Date(data.dob);
  const age = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 86_400_000));

  const checks = {
    credit_score: score >= 650,
    income:       income >= 300_000,
    employment:   ['salaried', 'self_employed', 'business'].includes(data.employment_type),
    age:          age >= 21 && age <= 65,
    debt_ratio:   emiRatio <= 0.4,
  };

  const passedCount = Object.values(checks).filter(Boolean).length;
  const isEligible  = passedCount >= 4; // minimum 4 of 5

  return { ...checks, passed_count: passedCount, is_eligible: isEligible };
}

// ─── OFFER RECOMMENDATION ─────────────────────────────────────────────────────
function generateOffers(score, income) {
  const offers = [];

  if (score >= 800 && income >= 800_000) {
    offers.push({
      offer_type:   'platinum',
      offer_name:   'CardVault Platinum Elite',
      credit_limit: 500_000,
      apr:          12.99,
      rewards_rate: 5.0,
      annual_fee:   4999,
    });
  }

  if (score >= 700 && income >= 500_000) {
    offers.push({
      offer_type:   'gold',
      offer_name:   'CardVault Gold Rewards',
      credit_limit: 250_000,
      apr:          16.99,
      rewards_rate: 3.0,
      annual_fee:   1999,
    });
  }

  // Everyone eligible gets the standard card
  offers.push({
    offer_type:   'standard',
    offer_name:   'CardVault Select Classic',
    credit_limit: 75_000,
    apr:          21.99,
    rewards_rate: 1.0,
    annual_fee:   499,
  });

  return offers;
}

// ─── TRACKING NUMBER GENERATOR ────────────────────────────────────────────────
function generateTrackingNumber() {
  return 'BD' + Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000);
}

function getEstimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().split('T')[0];
}

module.exports = {
  generateCreditScore,
  getCreditCategory,
  runEligibilityChecks,
  generateOffers,
  generateTrackingNumber,
  getEstimatedDelivery,
};
