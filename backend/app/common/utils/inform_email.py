import os
from django.core.mail import send_mail


SENDER_EMAIL = os.environ.get("MAIL")


def send_register_email(username, email):
    subject = "SUBJECT"
    message = """TEST"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=SENDER_EMAIL,
            recipient_list=[email],
        )
        return "email sent to: " + email
    except Exception as e:
        return "Error sending email: " + str(e)


def send_delete_account_email(username, email):
    subject = "SUBJECT"
    message = """message"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=SENDER_EMAIL,
            recipient_list=[email],
        )
        print("email sent to: ", email)
        return True
    except Exception as e:
        print("Error sending email: ", e)
        return False
