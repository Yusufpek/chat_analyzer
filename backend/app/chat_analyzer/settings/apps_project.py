if "INSTALLED_APPS" not in locals():
    INSTALLED_APPS = []

PROJECT_APPS = [
    "common",
    "chat",
    "analyze",
]

INSTALLED_APPS += PROJECT_APPS
