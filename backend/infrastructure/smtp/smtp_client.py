import smtplib
from email.message import EmailMessage
from typing import List

class SMTPClient:
    def __init__(self, hostname: str = "localhost", port: int = 2525):
        self.hostname = hostname
        self.port = port

    def send_message(self, sender: str, recipients: List[str], subject: str, body: str, cc: List[str] = None):
        """
        Sends an email using the local SMTP server.
        """
        msg = EmailMessage()
        msg.set_content(body)
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = ", ".join(recipients)

        if cc:
            msg["Cc"] = ", ".join(cc)
            # Add CC to the list of recipients for the envelope
            recipients.extend(cc)

        try:
            with smtplib.SMTP(self.hostname, self.port) as smtp:
                smtp.send_message(msg)
        except Exception as e:
            # Re-raise as a generic exception or log it?
            # Service layer will handle exceptions, but we should probably wrap it
            # if we wanted strict custom exceptions.
            # For now, let's allow it to bubble up or wrap in a generic infrastructure error.
            raise e
