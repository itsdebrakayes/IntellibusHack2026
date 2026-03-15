import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from datetime import datetime, timedelta
from app.config import settings


def generate_verification_code(length: int = 6) -> str:
    """Generate a random verification code."""
    return ''.join(random.choices(string.digits, k=length))


def code_expiry() -> datetime:
    """Return the expiry time for verification codes (10 minutes from now)."""
    return datetime.utcnow() + timedelta(minutes=10)


def send_verification_email(to_email: str, to_name: str, code: str) -> dict:
    """Send verification email with the code."""
    if not all([
        settings.smtp_host,
        settings.smtp_port,
        settings.smtp_user,
        settings.smtp_password,
        settings.smtp_from
    ]):
        return {"success": False, "error": "SMTP settings are not configured"}

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_from
        msg['To'] = to_email
        msg['Subject'] = "Your Verification Code - BreachBuddy"

        body = f"""
        Hello {to_name},

        Welcome to BreachBuddy!

        Your verification code is: {code}

        This code will expire in 10 minutes.

        If you didn't request this, please ignore this email.
        """
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()          # ← must be BEFORE login
            server.ehlo()              # ← call ehlo again after starttls
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to_email, msg.as_string())

        # Connect to SMTP server
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        if settings.smtp_secure:
            server.starttls()

        server.login(settings.smtp_user, settings.smtp_password)
        text = msg.as_string()
        server.sendmail(settings.smtp_from, to_email, text)
        server.quit()

        return {"success": True}
    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"success": False, "error": str(e)}