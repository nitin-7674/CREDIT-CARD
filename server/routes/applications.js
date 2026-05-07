const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const {
  generateCreditScore,
  getCreditCategory,
  runEligibilityChecks,
  generateOffers,
  generateTrackingNumber,
  getEstimatedDelivery,
} = require('../services/ruleEngine');

const router = express.Router();

// ─── VALIDATION RULES ─────────────────────────────────────────────────────────
const applicationValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('dob').isDate().withMessage('Valid date of birth is required'),
  body('pan')
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN format (e.g. ABCDE1234F)'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('annual_income').isInt({ min: 0 }).withMessage('Annual income must be a positive number'),
  body('employment_type')
    .isIn(['salaried', 'self_employed', 'business', 'student', 'retired'])
    .withMessage('Invalid employment type'),
  body('emp_duration')
    .isIn(['less1', '1to3', '3to5', '5plus'])
    .withMessage('Invalid employment duration'),
];

// ─── POST /api/applications ───────────────────────────────────────────────────
// Submit a new credit card application
router.post('/', applicationValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert application
    const {
      first_name, last_name, dob, pan, mobile, email,
      annual_income, employment_type, emp_duration,
      existing_loans = 'none', emi_load = 0, address = '',
    } = req.body;

    const appResult = await client.query(
      `INSERT INTO applications
         (first_name, last_name, dob, pan, mobile, email,
          annual_income, employment_type, emp_duration,
          existing_loans, emi_load, address, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'submitted')
       RETURNING *`,
      [first_name, last_name, dob, pan.toUpperCase(), mobile, email,
       annual_income, employment_type, emp_duration,
       existing_loans, emi_load, address]
    );
    const application = appResult.rows[0];

    await client.query('COMMIT');
    res.status(201).json({ success: true, application });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /applications error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit application.' });
  } finally {
    client.release();
  }
});

// ─── GET /api/applications/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications WHERE id = $1', [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/applications/:id/eligibility ───────────────────────────────────
// Run eligibility checks & generate credit score
router.post('/:id/eligibility', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch application
    const appRes = await client.query(
      'SELECT * FROM applications WHERE id = $1', [req.params.id]
    );
    if (!appRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const app = appRes.rows[0];

    // Generate credit score
    const score    = generateCreditScore(app);
    const category = getCreditCategory(score);

    // Save credit score
    const scoreRes = await client.query(
      `INSERT INTO credit_scores (application_id, score, category)
       VALUES ($1, $2, $3) RETURNING *`,
      [app.id, score, category]
    );

    // Run eligibility checks
    const checks    = runEligibilityChecks(app, score);
    const eligResult = await client.query(
      `INSERT INTO eligibility_checks
         (application_id, credit_score, income, employment, age, debt_ratio,
          passed_count, is_eligible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [app.id, checks.credit_score, checks.income, checks.employment,
       checks.age, checks.debt_ratio, checks.passed_count, checks.is_eligible]
    );

    // Update application status
    const newStatus = checks.is_eligible ? 'eligibility_passed' : 'eligibility_failed';
    await client.query(
      'UPDATE applications SET status=$1 WHERE id=$2', [newStatus, app.id]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      credit_score: scoreRes.rows[0],
      eligibility:  eligResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /eligibility error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/applications/:id/offers ───────────────────────────────────────
// Generate card offers based on eligibility
router.post('/:id/offers', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appRes = await client.query(
      'SELECT * FROM applications WHERE id=$1', [req.params.id]
    );
    if (!appRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const app = appRes.rows[0];

    // Fetch latest credit score
    const scoreRes = await client.query(
      'SELECT score FROM credit_scores WHERE application_id=$1 ORDER BY generated_at DESC LIMIT 1',
      [app.id]
    );
    if (!scoreRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Run eligibility check first.' });
    }
    const score = scoreRes.rows[0].score;

    // Generate offers
    const offerList = generateOffers(score, app.annual_income);
    const insertedOffers = [];
    for (const o of offerList) {
      const r = await client.query(
        `INSERT INTO card_offers
           (application_id, offer_type, offer_name, credit_limit, apr, rewards_rate, annual_fee)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [app.id, o.offer_type, o.offer_name, o.credit_limit, o.apr, o.rewards_rate, o.annual_fee]
      );
      insertedOffers.push(r.rows[0]);
    }

    await client.query(
      'UPDATE applications SET status=$1 WHERE id=$2',
      ['offers_generated', app.id]
    );

    await client.query('COMMIT');
    res.json({ success: true, offers: insertedOffers });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/applications/:id/confirm-offer ────────────────────────────────
// Select an offer and initiate shipping
router.post('/:id/confirm-offer', async (req, res) => {
  const { offer_id } = req.body;
  if (!offer_id) {
    return res.status(400).json({ success: false, message: 'offer_id is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Mark offer as selected
    await client.query(
      'UPDATE card_offers SET is_selected=TRUE WHERE id=$1 AND application_id=$2',
      [offer_id, req.params.id]
    );

    // Create shipping record
    const trackingNum = generateTrackingNumber();
    const estDelivery = getEstimatedDelivery();

    const shipRes = await client.query(
      `INSERT INTO shipping
         (application_id, offer_id, tracking_number, current_status, estimated_delivery)
       VALUES ($1,$2,$3,'approved',$4) RETURNING *`,
      [req.params.id, offer_id, trackingNum, estDelivery]
    );

    await client.query(
      'UPDATE applications SET status=$1 WHERE id=$2',
      ['shipping', req.params.id]
    );

    await client.query('COMMIT');
    res.json({ success: true, shipping: shipRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/applications/:id/shipping ──────────────────────────────────────
router.get('/:id/shipping', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, co.offer_name, co.offer_type, co.credit_limit
       FROM shipping s
       JOIN card_offers co ON co.id = s.offer_id
       WHERE s.application_id = $1
       ORDER BY s.created_at DESC LIMIT 1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Shipping record not found.' });
    }
    res.json({ success: true, shipping: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
