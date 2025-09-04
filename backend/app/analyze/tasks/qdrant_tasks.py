from celery import shared_task
from django.core import management
from common.models.log import Log
from analyze.utils.qdrant_service import QDrantService

from datetime import datetime


@shared_task
def group_messages_task():
    """
    Task to group messages by agent.
    """

    log = Log(task_name="Group Messages", category=Log.Category.ANALYTICS)
    log.save()
    try:
        management.call_command("group_messages")
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task("Grouped messages {}".format(now.strftime("%m/%d/%Y, %H:%M")))
    return True


@shared_task
def conversations_to_qdrant_task():
    """
    Task to send conversations to Qdrant.
    """

    log = Log(task_name="Send Conversations to Qdrant", category=Log.Category.ANALYTICS)
    log.save()
    try:
        management.call_command("conversations_to_qdrant")
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Sent conversations to QDrant {}".format(now.strftime("%m/%d/%Y, %H:%M"))
    )
    return True


@shared_task
def delete_collection_task(agent_id: str):
    """
    Task to delete a collection in Qdrant.
    """

    log = Log(task_name="Delete Collection in Qdrant", category=Log.Category.ANALYTICS)
    log.save()
    try:
        QDrantService().delete_collection(agent_id)
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Deleted collection in QDrant {}".format(now.strftime("%m/%d/%Y, %H:%M"))
    )
    return True
