if "INSTALLED_APPS" not in locals():
    INSTALLED_APPS = []

# noinspection PyUnboundLocalVariable
INSTALLED_APPS += [
    "rest_framework",
    "rest_framework.authtoken",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ]
}
