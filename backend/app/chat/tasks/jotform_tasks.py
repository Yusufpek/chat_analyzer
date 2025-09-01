import json
from celery import shared_task
from common.models.log import Log
from django.core import management
from django_celery_beat.models import PeriodicTask, IntervalSchedule


@shared_task
def fetch_agent_conversations(agent_id):
    """
    Fetch conversations for a specific agent.
    """
    log = Log(
        task_name=f"Fetch Agent Conversations - {agent_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()
    management.call_command("fetch_jotform_agent_conversations", agent_id=agent_id)
    log.complete_task("Jotform Agent Fetched")
    return True


@shared_task
def fetch_jotform_conversations_and_histories_task(connection_id):
    """
    Fetch conversations and histories for a specific JotForm connection.
    """
    log = Log(
        task_name=f"Fetch JotForm Agent Conversations and Histories - {connection_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()

    management.call_command(
        "fetch_jotform_conversations_and_histories",
        connection_id=connection_id,
    )
    log.complete_task("Jotform Agent Conversations and Histories Fetched")
    return True


def fetch_jotform_connection_periodic_task(connection_id, sync_interval=None):
    """
    Sets up or updates a periodic task to fetch JotForm conversations and histories.
    If sync_interval is None, the task will run every 60 minutes by default.
    """
    log = Log(
        task_name=f"Fetch User JotForm Conversations Periodic Task - {connection_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()

    schedule, created = IntervalSchedule.objects.get_or_create(
        every=sync_interval or 60,
        period=IntervalSchedule.MINUTES,
    )

    task, created = PeriodicTask.objects.get_or_create(
        name=f"Fetch User JotForm Conversations - {connection_id}",
        defaults={
            "interval": schedule,
            "task": "chat.tasks.jotform_tasks.fetch_jotform_conversations_and_histories_task",
            "kwargs": json.dumps({"connection_id": connection_id}),
        },
    )
    if not created:
        task.interval = schedule
        task.kwargs = json.dumps({"connection_id": connection_id})
        task.save()

    log.complete_task(
        f"Periodic Task {'Created' if created else 'Updated'}: Fetch User JotForm Conversations - {connection_id} "
        f"with interval: {sync_interval or 60} minutes"
    )

    return True
