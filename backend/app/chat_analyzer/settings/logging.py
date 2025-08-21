import os

if "MEDIA_ROOT" not in locals():
    MEDIA_ROOT = os.path.join(
        os.getcwd(), "media"
    )  # Default to a 'media' folder in the current working directory

if not os.path.exists(os.path.join(MEDIA_ROOT, "logs")):
    os.makedirs(os.path.join(MEDIA_ROOT, "logs"))


if "django.log" not in os.listdir(os.path.join(MEDIA_ROOT, "logs")):
    with open(os.path.join(MEDIA_ROOT, "logs", "django.log"), "w") as f:
        f.write("Django log file created.\n")


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
        "handlers": ["console", "file"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}
