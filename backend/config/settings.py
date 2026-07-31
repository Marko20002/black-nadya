"""
Django settings for the Black Nadya project.
"""

from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env(
    'DJANGO_SECRET_KEY',
    default='django-insecure-=_e8(#^fmcbxe&96m21$10y!l44cr%z!7j$voz4$mwq3@8x!^6',
)

DEBUG = env('DJANGO_DEBUG')

# Fails safe if DJANGO_ALLOWED_HOSTS is ever missing in production: only the
# known Railway host is allowed rather than '*'. Local dev sets both
# DJANGO_DEBUG=True and DJANGO_ALLOWED_HOSTS via backend/.env (see
# backend/.env.example).
ALLOWED_HOSTS = env.list(
    'DJANGO_ALLOWED_HOSTS',
    default=['black-nadya-production.up.railway.app'],
)


INSTALLED_APPS = [
    'modeltranslation',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',

    'products',
    'locations',
    'inquiries',
    'sitecontent',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# Reads DATABASE_URL (e.g. postgres://user:pass@host:port/dbname) when set —
# this is what Railway injects automatically once a Postgres plugin is
# attached. Falls back to local SQLite when DATABASE_URL is not set.

DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}'),
}


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
# Site content (products, About Us, pharmacies, contact info, homepage
# tagline) is translated into these three languages via django-modeltranslation.

LANGUAGE_CODE = 'en'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('en', 'English'),
    ('mk', 'Macedonian'),
    ('sq', 'Albanian'),
]

MODELTRANSLATION_LANGUAGES = ('en', 'mk', 'sq')
MODELTRANSLATION_DEFAULT_LANGUAGE = 'en'
MODELTRANSLATION_FALLBACK_LANGUAGES = ('en',)


STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Media storage: Cloudflare R2 (S3-compatible) in production when USE_S3 is
# set, local filesystem storage otherwise. R2 credentials come from a
# Cloudflare API token scoped to the bucket; see backend/.env.example.
USE_S3 = env.bool('USE_S3', default=False)

if USE_S3:
    STORAGES['default'] = {'BACKEND': 'storages.backends.s3.S3Storage'}

    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    # Must be the account-level endpoint only — no bucket name in the host,
    # e.g. https://<account_id>.r2.cloudflarestorage.com. With
    # AWS_S3_ADDRESSING_STYLE = "virtual", django-storages prepends the
    # bucket itself (<bucket>.<account_id>.r2.cloudflarestorage.com); if the
    # env var already includes the bucket, the resulting host is broken.
    AWS_S3_ENDPOINT_URL = env('AWS_S3_ENDPOINT_URL')
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default=None)  # e.g. media.blacknadya.com
    AWS_S3_ADDRESSING_STYLE = 'virtual'
    # R2 doesn't use AWS regions, but boto3's SigV4 signing still requires a
    # region string be present — Cloudflare's docs say to use "auto".
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='auto')
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
else:
    STORAGES['default'] = {'BACKEND': 'django.core.files.storage.FileSystemStorage'}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django's default (2.5MB) is easy for an admin to hit with an unmodified
# phone-camera photo on the homepage/product image uploads — raise it to a
# generous ceiling for an admin-only, low-traffic upload path.
DATA_UPLOAD_MAX_MEMORY_SIZE = 15 * 1024 * 1024  # 15MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 15 * 1024 * 1024


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'config.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    # No default throttle classes: general browsing (site-settings, products,
    # pharmacies, etc.) is unthrottled. Only views that opt in explicitly via
    # their own `throttle_classes` (e.g. the order-request/contact-message
    # inquiry forms — see inquiries/views.py) are rate limited, each under
    # its own scope below so they don't share a bucket with browsing traffic.
    'DEFAULT_THROTTLE_RATES': {
        'inquiry': '10/hour',
    },
}

# Access tokens are short-lived and silently refreshed via the httpOnly
# bn_refresh cookie. ROTATE_REFRESH_TOKENS stays False on purpose: the
# refresh token keeps its original 24h expiry from login instead of sliding
# forward on every use, giving admin sessions a real 24h hard cutoff rather
# than one that can be kept alive indefinitely by staying active.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=24),
    'ROTATE_REFRESH_TOKENS': False,
}

CORS_ALLOWED_ORIGINS = env.list(
    'DJANGO_CORS_ALLOWED_ORIGINS',
    default=['http://localhost:5173', 'http://127.0.0.1:5173'],
)
# Cookie-based auth requires the browser to send/receive cookies on
# cross-origin requests (frontend on Vercel, backend on Railway) — both this
# and the cookies' SameSite=None depend on CORS_ALLOWED_ORIGINS never being
# '*', since credentialed CORS responses can't use a wildcard origin.
CORS_ALLOW_CREDENTIALS = True

# Auth cookies need SameSite=None (cross-site: Vercel frontend, Railway
# backend) in production, but SameSite=None is only honored by browsers when
# the cookie is also Secure — which requires actual HTTPS. Local dev runs
# over plain http://localhost, so it falls back to SameSite=Lax/non-Secure
# (same-site enough for localhost:5173 -> localhost:8000) or the cookies
# would silently never be set at all during local testing.
AUTH_COOKIE_SECURE = not DEBUG
AUTH_COOKIE_SAMESITE = 'None' if AUTH_COOKIE_SECURE else 'Lax'

# Django's CSRF cookie needs the same Secure/SameSite treatment as the auth
# cookies for the same cross-site reason — otherwise the browser won't
# attach it to the cross-origin XHR/fetch calls the frontend makes, and
# every state-changing admin request would fail CSRF validation. It stays
# readable by JS (not httpOnly) on purpose: that's how axios reads it to
# echo it back as X-CSRFToken (the standard double-submit-cookie pattern).
# CSRF_TRUSTED_ORIGINS must list the frontend origin(s) too, since Django
# checks the request's Origin header against this list for cross-origin
# unsafe requests, independently of the token itself matching.
CSRF_COOKIE_SECURE = AUTH_COOKIE_SECURE
CSRF_COOKIE_SAMESITE = AUTH_COOKIE_SAMESITE
CSRF_COOKIE_HTTPONLY = False
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# HTTPS is terminated by Railway's edge proxy in production; trust its
# forwarded-proto header so Django knows the original request was secure.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
