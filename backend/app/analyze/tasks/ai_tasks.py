from celery import shared_task
from django.core import management

from common.models.log import Log

from datetime import datetime


@shared_task
def get_sentimental_analysis_task():
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
    print("log saved :)")
    return True
