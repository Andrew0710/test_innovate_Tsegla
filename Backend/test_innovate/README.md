# Backend Setup

## Team Pull Workflow

After pulling from GitHub, run:

```bash
python manage.py migrate
```

The backend now auto-creates the required demo users and baseline demo entities after migrations.

Demo users:

- `dispatcher_demo` / `demo12345`
- `driver_demo` / `demo12345`
- `manager_demo` / `demo12345`

## Optional Toggle

Auto-seeding is controlled by `AUTO_SEED_DEMO` (enabled by default):

```bash
# Windows PowerShell
$env:AUTO_SEED_DEMO = "0"
```

When `AUTO_SEED_DEMO=0`, migrations will not create demo data.

## Full Reset Seed

If you need a destructive full reset (clears and re-creates demo data), run:

```bash
python seed_data.py
```
