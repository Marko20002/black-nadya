"""
Django settings for the Black Nadya project.
"""

from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, True),
)
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env(
    'DJANGO_SECRET_KEY',
    default='django-insecure-=_e8(#^fmcbxe&96m21$10y!l44cr%z!7j$voz4$mwq3@8x!^6',
)

DEBUG = env('DJANGO_DEBUG')

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['*'])


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
    AWS_S3_ENDPOINT_URL = env('AWS_S3_ENDPOINT_URL')  # e.g. https://<account_id>.r2.cloudflarestorage.com
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default=None)  # e.g. media.blacknadya.com
    AWS_S3_ADDRESSING_STYLE = 'virtual'
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
else:
    STORAGES['default'] = {'BACKEND': 'django.core.files.storage.FileSystemStorage'}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

CORS_ALLOWED_ORIGINS = env.list(
    'DJANGO_CORS_ALLOWED_ORIGINS',
    default=['http://localhost:5173', 'http://127.0.0.1:5173'],
)

# HTTPS is terminated by Railway's edge proxy in production; trust its
# forwarded-proto header so Django knows the original request was secure.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
