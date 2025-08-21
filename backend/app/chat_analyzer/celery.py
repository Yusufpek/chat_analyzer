import os

from celery import Celery
from django.apps import apps


# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chat_analyzer.settings")


app = Celery("chat_analyzer")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(lambda: [n.name for n in apps.get_app_configs()])


@app.task(bind=True)
def debug_task(self):
    print(f"Discovered tasks: {app.tasks.keys()}")
