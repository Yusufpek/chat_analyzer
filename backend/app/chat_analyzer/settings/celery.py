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
        "task": "analyze.tasks.ai_tasks.get_sentimental_analysis_task",
        "schedule": crontab(minute="*/15"),
    },
    "get_conversation_title": {
        "task": "analyze.tasks.ai_tasks.get_conversation_title_task",
        "schedule": crontab(minute="*/15"),
    },
    "label_conversations": {
        "task": "analyze.tasks.ai_tasks.label_conversations_task",
        "schedule": crontab(minute="*/20"),
    },
    "conversations_to_qdrant": {
        "task": "analyze.tasks.qdrant_tasks.conversations_to_qdrant_task",
        "schedule": crontab(minute=0),  # runs every hour at minute 0
    },
    "group_messages": {
        "task": "analyze.tasks.qdrant_tasks.group_messages_task",
        "schedule": crontab(hour="*/1", minute="*/30"),
    },
}
