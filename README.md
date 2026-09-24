# FarmDirect AI — Direct Agricultural Marketplace (SIH26033 Prototype)

> **SIH Problem Statement SIH26033:** Direct-to-Consumer Digital Marketplace connecting farmers and FPOs directly with consumers & bulk buyers, supported by smart AI demand forecasting, fair price guidance, and route-optimized logistics.

---

## 📌 Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Frontend ["React + TypeScript + Vite + Tailwind CSS"]
        UI[Landing & Multi-Role UI]
        Router[React Router & RBAC Guards]
        Context[Auth & i18n Context (EN / TA / HI)]
        Maps[Leaflet + OpenStreetMap Route Visualizer]
        Charts[Recharts Demand & Price Analytics]
    end

    subgraph Backend ["FastAPI + Python 3.11+"]
        AuthModule[JWT & Bcrypt Hashing Auth]
        MarketplaceAPI[Products, Categories, Cart & Orders Engine]
        LogisticsAPI[Delivery Batching & Status Timeline]
        AIService[AI Service Interfaces: Demand, Price, Route]
        AdminAPI[User Moderation & Live Impact Panel]
    end

    subgraph AI_ML ["ML & Optimization Engine"]
        DemandModel[GradientBoostingRegressor + Seasonal Naive]
        PriceAdvisor[Market Modal Price & Cost Floor Advisor]
        RouteOptimizer[Nearest Neighbor + 2-Opt TSP Solver]
    end

    subgraph Database ["SQLAlchemy 2.x + SQLite / PostgreSQL"]
        DB[(SQLite / PostgreSQL Database)]
    end

    UI --> Router --> MarketplaceAPI & LogisticsAPI & AIService & AdminAPI
    MarketplaceAPI & LogisticsAPI & AdminAPI --> DB
    AIService --> DemandModel & PriceAdvisor & RouteOptimizer
```

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Leaflet (`react-leaflet`).
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.x, Pydantic v2, JWT Authentication, Bcrypt password hashing.
- **Database:** SQLite (`sqlite:///./farmdirect_demo.db` zero-setup fallback) / PostgreSQL.
- **AI/ML:** `scikit-learn` (GradientBoostingRegressor), `pandas`, `numpy`, `joblib`, 2-Opt Traveling Salesperson Problem (TSP) Route Solver.

---

## 🔑 Demo Accounts & Credentials

Password for all pre-seeded demo accounts: `Demo@123`

| Role | Email | Features to Test |
|---|---|---|
| 🧑‍🌾 **Farmer / FPO** | `farmer@demo.com` | Product CRUD, AI Price Guidance, Stock Management, Packing Orders |
| 🛒 **Consumer / Bulk Buyer** | `buyer@demo.com` | Marketplace Search/Filter, Cart, Checkout, Live Order Tracking, Reviews |
| 🚚 **Logistics Partner** | `logistics@demo.com` | Delivery Pool, Accept Deliveries, Status Update, 2-Opt Interactive Route Map |
| 🛡️ **Platform Admin** | `admin@demo.com` | Live Impact Panel, User Moderation, Farmer Verification, Reports Queue |

---

## ⚡ Quick Start (Local Setup)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.db.seed
python scripts/generate_demo_data.py
python scripts/train_demand_model.py
uvicorn app.main:app --reload --port 8000
```
FastAPI interactive docs will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Setup (Optional)
Run the full stack with PostgreSQL and FastAPI in containers:
```bash
docker-compose up --build
```

---

## 🤖 AI / ML Services & Model Swapping

The AI engine in `backend/app/services/ai/` follows a strict Provider Protocol (`DemandForecaster`, `PriceAdvisor`, `RouteOptimizer`):

1. **Demand Forecasting (`demand.py`):** Uses a trained `GradientBoostingRegressor` model persisted in `backend/models/demand_model.joblib`. Predicts 4-week future demand levels (`LOW`, `MEDIUM`, `HIGH`) and generates chart arrays and stock recommendations.
2. **Fair Price Guidance (`price.py`):** Blends market modal prices with a **Fair Price Breakdown** showing direct farmer net share (~75%) vs logistics/platform fee (~25%).
3. **Route Optimization (`route.py`):** Pure Python Nearest-Neighbor + 2-Opt TSP optimization solver. Enforces pickup-before-drop precedence constraints, calculates travel distance, ETA, and route distance saved vs naive routing.

---

## 📊 Live Impact Panel Formulas

The Live Impact Panel calculates three core benefits derived from direct transactions:
1. **Est. Farmer Price Uplift (+22.5%):** Direct direct-to-buyer sales eliminate the 5-layer mandi commission agent deductions.
2. **Est. Consumer Savings (-18.0%):** Direct produce purchasing cuts traditional retail store markups.
3. **Route Distance Saved (km):** Sum of distance reductions achieved by 2-Opt batched routing over unoptimized individual trips.

---

## 🧪 Testing Instructions

### Run Backend Pytest Suite
```bash
cd backend
.\venv\Scripts\pytest
```

### Run Frontend Type Check & Production Build
```bash
cd frontend
npm run lint
npm run build
```

---

## ⚠️ Limitations & Disclaimers
- **Demo / Simulated Data:** All AI predictions, market price trends, farmer verification badges, payment gateways, and GPS routing lines are tagged as **"Demo / Simulated"** in compliance with prototype guidelines.
- **Simulated Payments:** No actual money transfer occurs; payments are simulated for workflow demonstration.

---

## 🎬 5-Minute SIH Presentation & Demo Script

1. **Min 0-1 (Problem & Landing Page):** Show the traditional 5-layer supply chain comparison. Highlight how FarmDirect AI gives farmers 75% share while saving consumers 18%.
2. **Min 1-2 (Farmer Flow):** Log in as `farmer@demo.com`. Add a harvest product (Tomato) and launch **AI Price Guidance** to auto-apply recommended market pricing.
3. **Min 2-3 (Buyer Flow):** Log in as `buyer@demo.com`. Filter marketplace by organic produce in Coimbatore, add to cart, and checkout with simulated UPI payment.
4. **Min 3-4 (Logistics & Route Optimization):** Log in as `logistics@demo.com`. Accept the delivery from the pool and view the **2-Opt Interactive Leaflet Route Map** demonstrating route distance saved.
5. **Min 4-5 (Admin & Impact Panel):** Log in as `admin@demo.com`. Review the **Live Impact Panel** showing farmer uplift %, consumer savings %, and total route km saved.

