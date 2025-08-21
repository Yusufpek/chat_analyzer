from celery.schedules import crontab


if "INSTALLED_APPS" not in locals():
    INSTALLED_APPS = []

# noinspection PyUnboundLocalVariable
INSTALLED_APPS += [
    "django_celery_beat",
    "celery",
]

CELERY_BROKER_URL = "amqp://guest:guest@rabbitmq:5672//"
CELERY_RESULT_BACKEND = "rpc://"

CELERY_BEAT_SCHEDULE = {
    "get_sentimental_analysis": {
        "task": "analyze.tasks.get_sentimental_analysis_task",
        "schedule": crontab(minute=1),
    },
}
