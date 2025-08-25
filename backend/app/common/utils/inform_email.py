import os
from django.core.mail import send_mail


SENDER_EMAIL = os.environ.get("MAIL")


def send_register_email(username, email):
    """
    Sends a registration email to the user.
    """
    subject = "Welcome to ChatAnalyzer!"
    message = f"""
    <html>
        <body>
            <h2>Hi {username},</h2>
            <p>
                Thank you for registering with <strong>ChatAnalyzer</strong>. We're excited to have you on board!
            </p>
            <p>
                If you have any questions or need assistance, feel free to reach out to our support team.
            </p>
            <p>
                Best regards,<br>
                <strong>The ChatAnalyzer Team</strong>
            </p>
        </body>
    </html>
    """
    try:
        send_mail(
            subject=subject,
            html_message=message,
            from_email=SENDER_EMAIL,
            recipient_list=[email],
        )
        return "Email sent to: " + email
    except Exception as e:
        return "Error sending email: " + str(e)
