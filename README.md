# FlexiRoute

FlexiRoute is a logistics optimization demo that helps operations teams monitor delivery points, detect urgent shortages, and re-route resources to high-priority locations.

## Main Functionality

- Inventory and transport visibility for warehouses, products, and trucks.
- Delivery point monitoring with stock %, required capacity, and urgency priority.
- Order workflow for shortage requests: `PENDING -> REDIRECTED/REJECTED -> LOADING -> FULFILLED`.
- Automatic critical handling (auto-decision for critical shortages when donor conditions are met).
- Dispatcher actions for manual approve/reject/loading steps.
- JWT login with role metadata (`DISPATCHER`, `OPERATOR`, `MANAGER`).

## Tech Stack

- Backend: Django 6 + Django REST Framework + SimpleJWT
- Frontend: Next.js (Pages Router) + TypeScript + React 19
- Database: SQLite (local development)

## Project Structure

- `Backend/test_innovate` - Django API, models, migrations, seed scripts
- `flexiroute-frontend` - Next.js dashboard and API proxy
- `docs/PRD.md` - product requirements

## Prerequisites

- Python 3.11+ recommended
- Node.js 20+ recommended
- npm 10+ recommended

## Exactly How To Start Locally

Open two terminals at the repository root.

### 1. Start backend (Terminal A)

#### Windows PowerShell

```powershell
cd Backend/test_innovate
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

#### macOS/Linux

```bash
cd Backend/test_innovate
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

Backend API base URL: `http://127.0.0.1:8000/api/`

### 2. Start frontend (Terminal B)

```bash
cd flexiroute-frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

### 3. Login with demo users

- `dispatcher_demo` / `demo12345`
- `driver_demo` / `demo12345`
- `manager_demo` / `demo12345`

## Demo Data Seeding Behavior

- Running `python manage.py migrate` automatically seeds baseline demo data and demo users.
- Auto-seed is idempotent (safe across repeated migrations).
- Disable auto-seed: set `AUTO_SEED_DEMO=0` before running migrations.
- Full reseed (destructive reset of demo entities):

```bash
cd Backend/test_innovate
python seed_data.py
```

## Environment Variables

### Backend

- `AUTO_SEED_DEMO` (default: `1`)
	- `1`: enable auto demo bootstrap on migrate
	- `0`: disable auto demo bootstrap

### Frontend

- `BACKEND_BASE_URL` (default: `http://127.0.0.1:8000/api`)
	- Used by the Next.js proxy endpoint (`/api/proxy/*`) to forward requests to Django.

## Core Data Models

### Warehouse domain

- `Warehouse`
	- Fields: `name`, coordinates (`x_coord`, `y_coord`), `delivery_radius`
- `Product`
	- Belongs to `Warehouse`
	- Fields: `name`, `count`, `mass`
- `Truck`
	- Belongs to `Warehouse`
	- Fields: `status`, `capacity`, `current_load`, current position (`current_x`, `current_y`)
	- Computed property: `is_full`

### Delivery domain

- `DeliveryPoint`
	- Fields: `name`, coordinates, `priority_level`, `need_name`, `need_capacity`, `current_stock_percent`, `next_delivery`
- `Order`
	- Belongs to `DeliveryPoint`
	- Fields: `priority`, `urgency_level`, `quantity`, `content`, workflow fields (`status`, `approval_mode`, `decision_reason`, `decided_by`, `decided_at`, `time`)
- `EmployeeProfile`
	- One-to-one with Django `User`
	- Fields: `role`, optional `workplace` (`DeliveryPoint`)

## API Endpoints

Base URL: `http://127.0.0.1:8000/api/`

### Auth

- `POST /api/delivery/login/`
	- Returns: `access`, `refresh`, `role`, `workplace_id`

### Warehouse resources

- `GET|POST /api/warehouses/`
- `GET|PUT|PATCH|DELETE /api/warehouses/{id}/`
- `GET|POST /api/products/`
- `GET|PUT|PATCH|DELETE /api/products/{id}/`
- `GET|POST /api/trucks/`
- `GET|PUT|PATCH|DELETE /api/trucks/{id}/`

### Delivery points

- `GET|POST /api/delivery/points/`
- `GET|PUT|PATCH|DELETE /api/delivery/points/{id}/`
- `GET /api/delivery/points/{id}/requests/?limit=20`
	- Recent orders for a specific delivery point
- `GET /api/delivery/points/surplus/?target_id={id}`
	- Candidate donor points with surplus stock, optionally sorted by distance to a target point

### Orders

- `GET|POST /api/delivery/orders/`
	- Supports status filtering: `?status=PENDING,REDIRECTED`
- `GET|PUT|PATCH|DELETE /api/delivery/orders/{id}/`
- `GET /api/delivery/orders/recommendations/`
	- Ranked pending orders with computed priority metrics
- `POST /api/delivery/orders/urgent/`
	- Creates a critical urgent order and applies auto-decision logic
- `GET /api/delivery/orders/{id}/suggest_redirect/`
	- Suggests nearest donor point with sufficient stock
- `POST /api/delivery/orders/{id}/approve_redirect/`
	- Dispatcher-only manual approval
- `POST /api/delivery/orders/{id}/reject_request/`
	- Dispatcher-only manual rejection
- `POST /api/delivery/orders/{id}/mark_loading/`
	- Dispatcher-only transition from `REDIRECTED` to `LOADING`
- `POST /api/delivery/orders/{id}/fulfill/`
	- Completes order and updates delivery point stock/priority

## Workflow Notes

- New orders are evaluated immediately for auto-decision rules.
- Critical requests can be auto-approved when stock is very low and a donor point exists.
- Non-critical requests require dispatcher approval.
- Fulfillment updates target point stock percentage and recalculates point priority.

## Quick Health Checks

In backend terminal:

```bash
python manage.py check
```

In frontend terminal:

```bash
npm run lint
```
