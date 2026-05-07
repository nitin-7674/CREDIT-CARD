# CardVault – Credit Card Origination System

> Full-Stack Credit Card Onboarding Platform  
> **Tech Stack:** React.js · Node.js (Express) · PostgreSQL · Bootstrap

---

## Project Structure

```
cardvault/
├── package.json               ← root (runs both client + server)
│
├── server/                    ← Node.js + Express backend
│   ├── index.js               ← Express entry point
│   ├── .env.example           ← copy to .env and fill in values
│   ├── db/
│   │   ├── pool.js            ← PostgreSQL connection pool (pg)
│   │   └── setup.js           ← DB schema creation script
│   ├── routes/
│   │   └── applications.js    ← All API routes (5 endpoints)
│   ├── services/
│   │   └── ruleEngine.js      ← Credit score + eligibility + offer logic
│   └── middleware/
│       └── errorHandler.js    ← Global error + 404 handlers
│
└── client/                    ← React.js frontend
    ├── public/index.html
    └── src/
        ├── App.jsx             ← Root component + layout
        ├── index.js            ← ReactDOM entry
        ├── hooks/
        │   └── useApplication.js   ← Workflow state (React hooks)
        ├── services/
        │   └── api.js              ← Axios API service layer
        ├── components/
        │   ├── StageTracker.jsx    ← 4-stage progress bar
        │   ├── CardPreview.jsx     ← Animated card visual
        │   ├── CreditScoreGauge.jsx← SVG gauge widget
        │   └── ApplicationSummary.jsx
        ├── pages/
        │   ├── ApplicationForm.jsx ← Step 1 – form
        │   ├── EligibilityCheck.jsx← Step 2 – 5-criteria eval
        │   ├── OfferSelection.jsx  ← Step 3 – card picker
        │   └── ShippingStatus.jsx  ← Step 4 – delivery tracking
        └── styles/
            └── global.css
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install
```bash
git clone <repo-url>
cd cardvault
npm run install:all
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL credentials:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

### 3. Create the Database
```sql
-- In psql:
CREATE DATABASE cardvault;
```

### 4. Run DB Schema Setup
```bash
npm run setup:db
```
This creates 5 tables: `applications`, `credit_scores`, `eligibility_checks`, `card_offers`, `shipping`.

### 5. Start the App
```bash
npm run dev
```
- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:5000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check |
| `POST` | `/api/applications` | Submit new application |
| `GET`  | `/api/applications/:id` | Get application details |
| `POST` | `/api/applications/:id/eligibility` | Run eligibility check + credit score |
| `POST` | `/api/applications/:id/offers` | Generate card offers |
| `POST` | `/api/applications/:id/confirm-offer` | Select offer + initiate shipping |
| `GET`  | `/api/applications/:id/shipping` | Get shipping status |

---

## Rule-Based Engine

### Credit Score Generation (300 – 900)
| Factor | Weight |
|--------|--------|
| Annual Income | +40 to +120 |
| Employment Type | -80 to +60 |
| Employment Duration | -20 to +50 |
| Existing Loans | -60 to +30 |
| EMI-to-Income Ratio | -80 to 0 |

### Eligibility Criteria (Need 4 of 5)
1. Credit Score ≥ 650
2. Annual Income ≥ ₹3,00,000
3. Employment type: Salaried / Self-Employed / Business
4. Age: 21 – 65 years
5. EMI-to-Income Ratio ≤ 40%

### Offer Recommendation Logic
| Card | Score Required | Income Required |
|------|---------------|-----------------|
| Platinum Elite | ≥ 800 | ≥ ₹8,00,000 |
| Gold Rewards   | ≥ 700 | ≥ ₹5,00,000 |
| Select Classic | Any eligible | Any eligible |

---

## 4-Stage Approval Workflow

```
[1] Application → [2] Eligibility Check → [3] Offer Generation → [4] Shipping
```

Each stage:
1. **Application** – Form submission, stored in `applications` table
2. **Eligibility Check** – Credit score generated and saved; 5 rules evaluated; results in `credit_scores` + `eligibility_checks`
3. **Offer Generation** – Personalised card offers inserted into `card_offers`
4. **Shipping** – Offer confirmed, tracking number generated, stored in `shipping`

---

## Database Schema (PostgreSQL)

```sql
applications       -- Core applicant data
credit_scores      -- Generated CIBIL score per application
eligibility_checks -- 5-criteria pass/fail results
card_offers        -- Generated offer options
shipping           -- Delivery tracking records
```

All tables use UUID primary keys. Triggers auto-update `updated_at`.
