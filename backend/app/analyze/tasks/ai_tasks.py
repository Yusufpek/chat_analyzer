from celery import shared_task
from django.core import management
from django_celery_beat.models import PeriodicTask, IntervalSchedule

from common.models.log import Log

from datetime import datetime
import json


@shared_task
def get_sentimental_analysis_task():
    """
    Task to perform sentimental analysis on conversations.
    """

    log = Log(task_name="Get Sentimental Analysis", category=Log.Category.ANALYTICS)
    log.save()
    try:
        management.call_command("get_sentimental_analysis")
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Analyzed conversations {}".format(now.strftime("%m/%d/%Y, %H:%M"))
    )
    return True


@shared_task
def get_conversation_title_task():
    """
    Task to perform conversation title extraction on conversations.
    """

    log = Log(task_name="Get Conversation Title", category=Log.Category.ANALYTICS)
    log.save()
    try:
        management.call_command("get_conversation_title")
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Analyzed title of conversations {}".format(now.strftime("%m/%d/%Y, %H:%M"))
    )
    return True


@shared_task
def label_conversations_task(agent_id, label_all=False):
    """
    Task to label conversations for a specific agent.
    """
    log = Log(
        task_name=f"Label Conversations {'All' if label_all else 'Not Labeled'} - {agent_id}",
        category=Log.Category.ANALYTICS,
    )
    log.save()
    try:
        if label_all:
            management.call_command(
                "label_conversations", agent_id=agent_id, all=label_all
            )
        else:
            management.call_command("label_conversations", agent_id=agent_id)
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Labeled conversations for agent {} at {}".format(
            agent_id, now.strftime("%m/%d/%Y, %H:%M")
        )
    )
    return True


def setup_label_conversations_periodic_task(agent_id, sync_interval=None):
    """
    Sets up or updates a periodic task to fetch JotForm conversations and histories.
    If sync_interval is None, the task will run every 60 minutes by default.
    """
    log = Log(
        task_name=f"Label JotForm Agent Conversations Periodic Task - {agent_id}",
        category=Log.Category.JOTFORM_FETCH,
    )
    log.save()

    schedule, created = IntervalSchedule.objects.get_or_create(
        every=sync_interval or 60,
        period=IntervalSchedule.MINUTES,
    )

    task, created = PeriodicTask.objects.get_or_create(
        name=f"Label JotForm Agent Conversations - {agent_id}",
        defaults={
            "interval": schedule,
            "task": "analyze.tasks.ai_tasks.label_conversations_task",
            "kwargs": json.dumps({"agent_id": agent_id}),
        },
    )
    if not created:
        task.interval = schedule
        task.kwargs = json.dumps({"agent_id": agent_id})
        task.save()

    log.complete_task(
        f"Periodic Task {'Created' if created else 'Updated'}: Label JotForm Agent Conversations - {agent_id} "
        f"with interval: {sync_interval or 60} minutes"
    )

    return True
