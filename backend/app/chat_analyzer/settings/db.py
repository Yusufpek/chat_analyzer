import os

DATABASES = {
    "default": {
        "ENGINE": os.environ.get(
            "DATABASE_DEFAULT_ENGINE", "django.db.backends.postgresql"
        ),
        "NAME": os.environ.get("DATABASE_DEFAULT_NAME"),
        "USER": os.environ.get("DATABASE_DEFAULT_USER"),
        "PASSWORD": os.environ.get("DATABASE_DEFAULT_PASSWORD"),
        "HOST": os.environ.get("DATABASE_DEFAULT_HOST"),
        "PORT": os.environ.get("DATABASE_DEFAULT_PORT"),
    },
}
