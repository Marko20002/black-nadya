# Black Nadya

Marketing website for Black Nadya, a natural cosmetics brand. The site is a
brand/product showcase — there is no online checkout. Customers either
request a cargo/courier order (a form that lands in the admin inbox) or buy
in person at a partner pharmacy. Everything on the site (products,
homepage background, About Us text, contact info, pharmacies) is editable
by the site owner through a custom admin panel — no code changes needed.

The site is trilingual: **English, Macedonian (MK), and Albanian (SQ)**,
with a language switcher in the navbar and per-language admin fields for
all translatable content.

## Stack

- **Backend:** Django + Django REST Framework, JWT auth, SQLite (dev) /
  PostgreSQL (production)
- **Frontend:** React + Vite, React Router, i18next
- **Media:** local filesystem (dev) / Cloudflare R2 (production, S3-compatible)

## Project Structure

```
black-nadya/
├── backend/     # Django project (config, products, locations, inquiries, sitecontent)
├── frontend/    # React app (public site + /admin-panel)
└── .github/workflows/ci.yml
```

---

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env             # local dev needs DJANGO_DEBUG=True + DJANGO_ALLOWED_HOSTS set
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data       # optional: demo products/pharmacies/site content
python manage.py runserver
```

`DJANGO_DEBUG` and `DJANGO_ALLOWED_HOSTS` default to production-safe values in
code (`DEBUG=False`, only the Railway host allowed) so a missing env var in
production fails safe instead of leaking debug info. The `.env` file above
overrides both for local dev.

The API runs at `http://localhost:8000`. Django's own admin (technical
fallback) is at `http://localhost:8000/admin/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The site runs at `http://localhost:5173`. It reads the API base URL from
`VITE_API_BASE_URL` (see `frontend/.env` / `frontend/.env.example`) —
defaults to `http://localhost:8000`.

### Logging into the admin panel

Go to `http://localhost:5173/admin-panel/login` and sign in with the
superuser you created above. The whole `/admin-panel` section is protected;
logging out clears the stored JWT.

---

## Deployment

Intended production setup:

| Piece | Where |
|---|---|
| Frontend | Vercel, `blacknadya.com` |
| Backend + Postgres | Railway, `api.blacknadya.com` |
| Media (product photos, logo, backgrounds) | Cloudflare R2 |
| DNS | Cloudflare, for both `blacknadya.com` and `api.blacknadya.com` |

This repo is ready for that setup — deploying is a matter of connecting
the repo to each service and setting environment variables. No accounts or
services have been created for you.

### 1. Backend on Railway

1. Create a new Railway project, add this repo, and set the service's
   root directory to `backend/`.
2. Add a **Postgres** plugin to the project — Railway will inject
   `DATABASE_URL` automatically, which `config/settings.py` reads via
   `django-environ`. No manual DB config needed.
3. Set these environment variables on the Railway service (see
   `backend/.env.example` for the full list with descriptions):

   | Variable | Value |
   |---|---|
   | `DJANGO_SECRET_KEY` | a long random string (`python -c "import secrets; print(secrets.token_urlsafe(50))"`) |
   | `DJANGO_DEBUG` | `False` |
   | `DJANGO_ALLOWED_HOSTS` | `api.blacknadya.com,.up.railway.app` |
   | `DJANGO_CORS_ALLOWED_ORIGINS` | `https://blacknadya.com` |
   | `USE_S3` | `True` |
   | `AWS_ACCESS_KEY_ID` | R2 API token access key |
   | `AWS_SECRET_ACCESS_KEY` | R2 API token secret |
   | `AWS_STORAGE_BUCKET_NAME` | your R2 bucket name, e.g. `black-nadya-media` |
   | `AWS_S3_ENDPOINT_URL` | `https://<cloudflare-account-id>.r2.cloudflarestorage.com` |
   | `AWS_S3_CUSTOM_DOMAIN` | `media.blacknadya.com` (if you set up a public R2 custom domain) |

4. Railway picks up `backend/Procfile`: the `release` line runs migrations
   and `collectstatic` on every deploy, and `web` starts `gunicorn`
   (WhiteNoise serves static files; media goes to R2 when `USE_S3=True`).
5. Create a superuser once, after the first deploy, via Railway's shell:
   `python manage.py createsuperuser`. Optionally run
   `python manage.py seed_data` to seed demo content.
6. In Cloudflare DNS, point `api.blacknadya.com` at the Railway service
   (CNAME, per Railway's custom domain instructions), then add that
   custom domain in the Railway service settings.

### 2. Media on Cloudflare R2

1. Create an R2 bucket (e.g. `black-nadya-media`).
2. Create an R2 API token scoped to that bucket — this gives you the
   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` values above (R2 is
   S3-compatible, so Django's `storages` backend talks to it directly).
3. Optional: connect a custom domain (e.g. `media.blacknadya.com`) to the
   bucket in the R2 dashboard so uploaded images are served from your own
   domain, and set `AWS_S3_CUSTOM_DOMAIN` accordingly.

### 3. Frontend on Vercel

1. Import this repo into Vercel, set the project root to `frontend/`.
2. Set the environment variable:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://api.blacknadya.com` |

3. Vercel auto-detects the Vite build (`npm run build`, output `dist/`).
   `frontend/vercel.json` adds the SPA rewrite so client-side routes
   (`/products`, `/admin-panel`, etc.) don't 404 on refresh.
4. In Cloudflare DNS, point `blacknadya.com` (and `www`, if used) at
   Vercel per Vercel's custom domain instructions, then add the domain in
   the Vercel project settings.

### 4. After both are live

- Visit `https://blacknadya.com/admin-panel/login` and sign in with the
  superuser created on Railway.
- Use **Manage Homepage** to upload the real background image and logo,
  **Manage About Us** / **Manage Contact Info** for brand copy, and
  **Products** / **Pharmacies** to replace the seeded demo content.

---

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: Django checks
and tests for the backend, and lint + build for the frontend. A red build
means something is broken before it reaches `main`.
