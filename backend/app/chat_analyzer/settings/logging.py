import os

if "MEDIA_ROOT" not in locals():
    MEDIA_ROOT = os.path.join(
        os.getcwd(), "media"
    )  # Default to a 'media' folder in the current working directory

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": os.path.join(
                MEDIA_ROOT, "logs", "django.log"
            ),  # Use MEDIA_ROOT for the file path
            "level": "DEBUG",  # Log level for the file
            "formatter": "verbose",  # Use the verbose formatter
        },
    },
    "formatters": {
        "verbose": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "root": {
        "handlers": ["console", "file"],  # Add the file handler here
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],  # Add the file handler here
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}
