from celery import shared_task
from django.core import management
from common.models.log import Log

from datetime import datetime


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
def label_conversations_task(label_all=False):
    """
    Task to label conversations for a specific agent.
    """
    log = Log(
        task_name=f"Label Conversations {'All' if label_all else 'Not Labeled'}",
        category=Log.Category.ANALYTICS,
    )
    log.save()
    try:
        if label_all:
            management.call_command("label_conversations", all=label_all)
        else:
            management.call_command("label_conversations")
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Labeled conversations for agents at {}".format(now.strftime("%m/%d/%Y, %H:%M"))
    )
    return True


@shared_task
def label_agent_conversations_task(agent_id, label_all=False):
    """
    Task to label conversations for a specific agent.
    """
    log = Log(
        task_name=f"Label Agent Conversations {'All' if label_all else 'Not Labeled'} - {agent_id}",
        category=Log.Category.ANALYTICS,
    )
    log.save()
    try:
        if label_all:
            management.call_command(
                "label_agent_conversations",
                agent_id=agent_id,
                all=label_all,
            )
        else:
            management.call_command("label_agent_conversations", agent_id=agent_id)
    except Exception as e:
        print(e)
    now = datetime.now()
    log.complete_task(
        "Labeled conversations for agent {} at {}".format(
            agent_id, now.strftime("%m/%d/%Y, %H:%M")
        )
    )
    return True


@shared_task
def get_context_change_analysis_task():
    """
    Task to perform context change analysis on conversations.
    """

    log = Log(task_name="Get Context Change Analysis", category=Log.Category.ANALYTICS)
    log.save()
    try:
        management.call_command("get_context_change_analysis")
    except Exception as e:
        log.complete_task_error(
            "Error during context change analysis: {}".format(str(e))
        )
    now = datetime.now()
    log.complete_task(
        "Analyzed context changes of conversations {}".format(
            now.strftime("%m/%d/%Y, %H:%M")
        )
    )
    return True
