# FlexiRoute

FlexiRoute is a logistics optimization demo that helps teams monitor delivery points, detect urgent shortages, and re-route resources to high-priority locations.

## What This Project Does

- Tracks warehouses, trucks, products, and delivery points.
- Prioritizes urgent demand (normal/elevated/critical flow).
- Provides recommendation and redirect actions for orders.
- Uses role-based JWT login for demo users.

## Tech Stack

- Backend: Django + Django REST Framework + SimpleJWT
- Frontend: Next.js (Pages Router) + TypeScript
- Database: SQLite (local development)

## Project Structure

- `Backend/test_innovate` - Django API and data models
- `flexiroute-frontend` - Next.js web app
- `docs/PRD.md` - product requirements and goals

## Run Locally

### 1. Backend

```bash
cd Backend/test_innovate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

### 2. Frontend

Open a second terminal:

```bash
cd flexiroute-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Team Workflow (GitHub Pull/Clone)

After pulling latest changes, run:

```bash
cd Backend/test_innovate
python manage.py migrate
```

The backend is configured to auto-create required demo baseline data and demo users after migrations (idempotent behavior for team development).

Demo credentials:

- `dispatcher_demo` / `demo12345`
- `driver_demo` / `demo12345`
- `manager_demo` / `demo12345`

If needed, you can still run full reseed manually:

```bash
cd Backend/test_innovate
python seed_data.py
```

## Environment Notes

Frontend API proxy target defaults to:

- `http://127.0.0.1:8000/api`

Optional frontend override:

- `BACKEND_BASE_URL`

Optional backend demo-seed toggle:

- `AUTO_SEED_DEMO=0` to disable auto demo bootstrap.
