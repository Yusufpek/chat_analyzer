from os import path
from os import getenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = getenv("SECRET_KEY")
SECRET_KEY_FOR_PASSWORD = getenv("SECRET_KEY_FOR_PASSWORD")
ALLOWED_HOSTS = ["*"]
DEBUG = getenv("DEBUG", "False")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

AUTH_USER_MODEL = "common.User"

ROOT_URLCONF = "chat_analyzer.urls"

WSGI_APPLICATION = "chat_analyzer.wsgi.application"

ASGI_APPLICATION = "chat_analyzer.asgi.application"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ORIGIN_ALLOW_ALL = True

SETTINGS_PATH = path.dirname(path.abspath(__file__))

LOCALE_PATHS = (
    path.join(SETTINGS_PATH, "../locale"),
    path.join(SETTINGS_PATH, "../locale_extra"),
)

# Secret Key
SECRET_KEY = getenv("SECRET_KEY")
SECRET_KEY_FOR_PASSWORD = getenv("SECRET_KEY_FOR_PASSWORD")

# Static
STATIC_URL = "static/"
STATIC_ROOT = path.join(BASE_DIR, "static")
STATICFILES_DIRS = []

# Media
MEDIA_URL = "/media/"
MEDIA_ROOT = path.join(BASE_DIR, "..", "media")

# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
