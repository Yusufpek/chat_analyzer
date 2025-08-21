from celery import shared_task
from common.models.log import Log
from django.core import management
from django_celery_beat.models import PeriodicTask, IntervalSchedule


@shared_task
def fetch_agent_conversations(agent_id):
    log = Log(
        task_name=f"Fetch Agent Conversations - {agent_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()
    management.call_command("fetch_jotform_agent_conversations", agent_id=agent_id)
    log.complete_task("Jotform Agent Fetched")
    return True


def create_fetch_jotform_connection_periodic_task(connection_id, sync_interval=None):
    log = Log(
        task_name=f"Fetch User JotForm Conversations - {connection_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()

    PeriodicTask.objects.create(
        task_name=f"Fetch User JotForm Conversations - {connection_id}",
        task="fetch_jotform_agent_conversations_and_histories",
        interval=IntervalSchedule.objects.get(
            every=sync_interval or 60,
            period=IntervalSchedule.MINUTES,
        ),
        kwargs=f'{{"connection_id": "{connection_id}"}}',
    )

    log.complete_task("Jotform Conversation Fetch Periodic Task Created")

    return True


def update_fetch_jotform_connection_periodic_task(connection_id, sync_interval):
    log = Log(
        task_name=f"Update Fetch User JotForm Conversations - {connection_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()

    periodic_task = PeriodicTask.objects.filter(
        task_name=f"Fetch User JotForm Conversations - {connection_id}"
    ).first()

    if periodic_task:
        periodic_task.interval.every = sync_interval or 60
        periodic_task.save()
        log.complete_task("Jotform Conversation Fetch Periodic Task Updated")
    else:
        log.complete_task_error("Periodic task not found for the given connection ID.")

    return True
