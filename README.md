# ReviewGate — AI-Powered Customer Feedback & Review Platform

An intelligent platform that helps businesses collect customer feedback and encourage satisfied customers to leave public Google reviews. Built as a production-ready MVP designed for SaaS scalability.

## 🚀 How It Works

1. **Customer scans a QR code** linked to a specific business
2. **Rates their experience** from 1–5 stars
3. **Rating ≤ 3**: Shows a private feedback form (visible only to the business owner)
4. **Rating ≥ 4**: AI generates a review draft → customer copies & pastes to Google

> The system **never** automatically submits reviews to Google. It only assists the customer.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic |
| **Database** | SQLite (MVP) — designed for easy PostgreSQL migration |
| **AI** | OpenRouter API (Mistral 7B Instruct) |

---

## 📁 Project Structure

```
review-gate/
├── backend/
│   ├── main.py          # FastAPI application + routes
│   ├── models.py        # SQLAlchemy database models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── services.py      # OpenRouter AI integration
│   ├── database.py      # DB initialization + seed data
│   ├── requirements.txt # Python dependencies
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/app/
│   │   ├── layout.tsx               # Root layout + SEO
│   │   ├── page.tsx                 # Home / landing page
│   │   ├── globals.css              # Global styles
│   │   ├── [businessId]/page.tsx    # Main review flow page
│   │   └── components/
│   │       ├── StarRating.tsx       # 1-5 star rating selector
│   │       ├── NegativeFeedbackForm.tsx  # Private feedback form (rating ≤ 3)
│   │       ├── PositiveReviewFlow.tsx    # Tag selector + AI generation (rating ≥ 4)
│   │       ├── ReviewDisplay.tsx    # Generated review card with copy/Google actions
│   │       ├── LoadingSpinner.tsx   # Animated loading state
│   │       └── Toast.tsx           # Success/error notifications
│   ├── .env.local        # Frontend environment variables
│   ├── next.config.ts    # Next.js configuration
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **OpenRouter API Key** (optional — falls back to template-based reviews)

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and add your OPENROUTER_API_KEY

# Start the server
python main.py
```

The backend will start at `http://localhost:8000`.

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:3000`.

### 3. Try It Out

1. Open `http://localhost:3000` — the landing page
2. Click **"Try Demo"** or navigate to `http://localhost:3000/cafe123`
3. Rate your experience and follow the flow!

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | No (uses fallback) |
| `DATABASE_URL` | SQLite/PostgreSQL connection string | No (defaults to SQLite) |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/business/{business_id}` | Get business details |
| `POST` | `/feedback` | Submit private feedback |
| `POST` | `/generate-review` | Generate AI review |
| `GET` | `/stats/{business_id}` | Get business statistics |

### Example: Submit Feedback

```json
POST /feedback
{
  "business_id": "cafe123",
  "rating": 2,
  "feedback": "The service was slow.",
  "email": "optional@email.com",
  "phone": ""
}
```

### Example: Generate Review

```json
POST /generate-review
{
  "business_id": "cafe123",
  "keywords": ["Friendly Staff", "Great Service"],
  "custom_text": "The latte was amazing"
}
```

---

## 🌱 Demo Data

The app seeds one demo business on startup:

| Field | Value |
|-------|-------|
| Business ID | `cafe123` |
| Name | Brew Haven |
| Type | Coffee Shop |
| Google Place ID | `ChIJ2eFfoDOADTkRVPUyjRKQsSs` |

---

## 📝 License

MIT
