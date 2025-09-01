from celery import shared_task

from common.utils.inform_email import send_register_email
from common.models.log import Log


@shared_task
def send_register_email_task(username, email):
    log = Log(
        task_name="Register Email Task - " + username, category=Log.Category.EMAIL
    )
    log.save()
    response = send_register_email(username, email)
    log.complete_task(response)
    return response
