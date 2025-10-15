"""
Production settings for AWS deployment

Ovaj fajl nasledjuje osnovne settings i override-uje ih za production.
Koristi environment varijable (.env fajl) za osetljive podatke.
"""

from .settings import *
import os
from decouple import config

# =============================================================================
# SIGURNOST
# =============================================================================

# SECRET_KEY - NIKAD ne stavljaj hardcoded u production!
# Generisi novi: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY = config('SECRET_KEY')

# DEBUG - MORA biti False u production!
# Zašto? DEBUG=True pokazuje detaljne error poruke sa podacima o sistemu
# - haker može da vidi strukturu projekta, SQL queries, lokaciju fajlova
DEBUG = config('DEBUG', default=False, cast=bool)

# ALLOWED_HOSTS - Lista domena/IP-eva koji smeju da pristupe aplikaciji
# Ovo je sigurnosna mera protiv HTTP Host header napada
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')
# Primer: 'ec2-3-121-45-78.compute.amazonaws.com,yourdomain.com'

# =============================================================================
# BAZA PODATAKA - RDS PostgreSQL
# =============================================================================

# Prebacujemo sa SQLite (development) na PostgreSQL (production)
#
# Zašto PostgreSQL umesto SQLite?
# - SQLite je jedan fajl na disku - ako se server restartuje, može biti problem
# - PostgreSQL je server baza - podržava više konekcija istovremeno
# - RDS automatski pravi backup-e i održava bazu
# - PostgreSQL podržava složenije queries i više korisnika

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),              # ime baze (npr: freelance_db)
        'USER': config('DB_USER'),              # korisnik (npr: postgres)
        'PASSWORD': config('DB_PASSWORD'),       # lozinka koju si kreirao u RDS
        'HOST': config('DB_HOST'),              # RDS endpoint (npr: freelance-db.xxx.rds.amazonaws.com)
        'PORT': config('DB_PORT', default='5432'),  # PostgreSQL default port
        'OPTIONS': {
            'connect_timeout': 10,              # Timeout za konekciju (sekungi)
        },
    }
}

# =============================================================================
# STATIC FILES (CSS, JavaScript, Images)
# =============================================================================

# Šta su static fajlovi?
# - CSS, JavaScript, slike koje su deo tvoje aplikacije
# - U development-u, Django ih služi automatski
# - U production-u, koristimo WhiteNoise (brži i efikasniji)

# WhiteNoise - služi static fajlove direktno iz Django app-a
# Alternativa je nginx, ali WhiteNoise je jednostavniji za Free Tier setup
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise compression i caching
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# =============================================================================
# MEDIA FILES (Upload-ovani fajlovi) - S3
# =============================================================================

# Šta su media fajlovi?
# - Fajlovi koje korisnici upload-uju (PDF fakture, slike, itd.)
# - Ne držimo ih na EC2 instance jer:
#   1. EC2 može biti restartovan (izgubili bi fajlove)
#   2. Ograničen storage (8GB)
#   3. S3 je napravljen za file storage (beskonačan, siguran, backup-ovan)

# AWS S3 konfiguracija
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='eu-central-1')

# S3 custom domain (opciono - možeš koristiti CloudFront CDN)
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

# File upload settings
AWS_S3_FILE_OVERWRITE = False  # Ne pregazi fajl ako već postoji
AWS_DEFAULT_ACL = None         # Koristi bucket default ACL
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',  # Keširaj 1 dan
}

# Koristi S3 za media fajlove
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# =============================================================================
# CORS (Cross-Origin Resource Sharing)
# =============================================================================

# Šta je CORS?
# - Sigurnosna mera u browser-ima
# - Sprečava da random website-ovi pozivaju tvoj API
# - Moraš eksplicitno dozvoliti svoje frontend domene

# Frontend će biti na CloudFront ili S3, moramo dozvoliti te domene
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000'
).split(',')

# Primer za production:
# CORS_ALLOWED_ORIGINS = [
#     'https://d1234567890.cloudfront.net',
#     'https://yourdomain.com',
# ]

CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# SIGURNOSNA PODEŠAVANJA
# =============================================================================

# HTTPS settings (kad staviš SSL certifikat)
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=False, cast=bool)

# HSTS (HTTP Strict Transport Security)
# Govori browser-u: "UVEK koristi HTTPS za ovaj sajt"
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=False, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=False, cast=bool)

# X-Frame-Options - sprečava clickjacking napade
X_FRAME_OPTIONS = 'DENY'

# X-Content-Type-Options - sprečava MIME type sniffing
SECURE_CONTENT_TYPE_NOSNIFF = True

# XSS Protection
SECURE_BROWSER_XSS_FILTER = True

# =============================================================================
# LOGGING - CloudWatch Logs
# =============================================================================

# Logging je bitan za debugging u production-u
# Ne možeš videti print() statements na serveru - moraš koristiti logove

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/django.log'),
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# =============================================================================
# EMAIL (opciono - za slanje faktura preko email-a)
# =============================================================================

# Možeš koristiti Amazon SES (Simple Email Service) - FREE TIER: 62,000 emails/mesec
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'email-smtp.eu-central-1.amazonaws.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = config('AWS_SES_ACCESS_KEY_ID', default='')
# EMAIL_HOST_PASSWORD = config('AWS_SES_SECRET_ACCESS_KEY', default='')
# DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@yourdomain.com')

# =============================================================================
# CACHE (opciono - za bolje performanse)
# =============================================================================

# Za početak ne treba cache, ali ako ti aplikacija postane spora,
# možeš dodati Redis (Amazon ElastiCache - FREE TIER dostupan)

# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
#         'OPTIONS': {
#             'CLIENT_CLASS': 'django_redis.client.DefaultClient',
#         }
#     }
# }
