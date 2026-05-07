/**
 * CardVault – Database Setup Script
 * Run: node db/setup.js
 * Creates all tables in the 'cardvault' PostgreSQL database.
 */
const pool = require('./pool');

const schema = `
-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── APPLICATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  dob             DATE         NOT NULL,
  pan             VARCHAR(10)  NOT NULL,
  mobile          VARCHAR(15)  NOT NULL,
  email           VARCHAR(255) NOT NULL,
  annual_income   INTEGER      NOT NULL,
  employment_type VARCHAR(50)  NOT NULL,
  emp_duration    VARCHAR(20)  NOT NULL,
  existing_loans  VARCHAR(50)  NOT NULL DEFAULT 'none',
  emi_load        INTEGER      NOT NULL DEFAULT 0,
  address         TEXT,
  status          VARCHAR(30)  NOT NULL DEFAULT 'submitted',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── CREDIT SCORES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  score           INTEGER      NOT NULL CHECK (score BETWEEN 300 AND 900),
  category        VARCHAR(20)  NOT NULL,
  bureau          VARCHAR(50)  NOT NULL DEFAULT 'CIBIL',
  generated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── ELIGIBILITY CHECKS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eligibility_checks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  credit_score    BOOLEAN      NOT NULL,
  income          BOOLEAN      NOT NULL,
  employment      BOOLEAN      NOT NULL,
  age             BOOLEAN      NOT NULL,
  debt_ratio      BOOLEAN      NOT NULL,
  passed_count    INTEGER      NOT NULL,
  is_eligible     BOOLEAN      NOT NULL,
  checked_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── CARD OFFERS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS card_offers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  offer_type      VARCHAR(20)  NOT NULL,   -- platinum | gold | standard
  offer_name      VARCHAR(150) NOT NULL,
  credit_limit    INTEGER      NOT NULL,
  apr             NUMERIC(5,2) NOT NULL,
  rewards_rate    NUMERIC(4,1) NOT NULL,
  annual_fee      INTEGER      NOT NULL,
  is_selected     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── SHIPPING RECORDS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipping (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  offer_id        UUID         NOT NULL REFERENCES card_offers(id) ON DELETE CASCADE,
  tracking_number VARCHAR(50)  NOT NULL,
  courier         VARCHAR(50)  NOT NULL DEFAULT 'Blue Dart',
  current_status  VARCHAR(50)  NOT NULL DEFAULT 'approved',
  estimated_delivery DATE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_updated ON applications;
CREATE TRIGGER trg_applications_updated
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_shipping_updated ON shipping;
CREATE TRIGGER trg_shipping_updated
  BEFORE UPDATE ON shipping
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_pan   ON applications(pan);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_credit_scores_app  ON credit_scores(application_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_app    ON eligibility_checks(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_app         ON card_offers(application_id);
CREATE INDEX IF NOT EXISTS idx_shipping_app       ON shipping(application_id);
`;

async function setup() {
  const client = await pool.connect();
  try {
    console.log('🔧 Setting up CardVault database...');
    await client.query(schema);
    console.log('✅ All tables created successfully.');
    console.log('\nTables created:');
    console.log('  • applications');
    console.log('  • credit_scores');
    console.log('  • eligibility_checks');
    console.log('  • card_offers');
    console.log('  • shipping');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
