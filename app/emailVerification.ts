import os
import math
import random
import logging
from datetime import datetime, timedelta
from typing import Optional
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


# ─── Code Generation ──────────────────────────────────────────────────────────

def generate_verification_code() -> str:
    """Generate a cryptographically random 6-digit numeric code"""
    # Use secrets module for production instead of random
    import secrets
    return str(secrets.randbelow(900000) + 100000)


def code_expiry() -> datetime:
    """Returns a datetime 15 minutes from now"""
    return datetime.utcnow() + timedelta(minutes=15)


# ─── Transport ────────────────────────────────────────────────────────────────

def _create_transport() -> Optional[dict]:
    """Returns SMTP config dict if env vars are set, else None"""
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    secure_env = os.getenv("SMTP_SECURE")

    if not all([host, user, password]):
        return None

    use_ssl = secure_env.lower() == "true" if secure_env else port == 465

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password.replace(" ", ""),
        "use_ssl": use_ssl
    }


# ─── Email Template ───────────────────────────────────────────────────────────

def _build_html(to_name: str, code: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00c853,#1b5e20);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">CyberShield</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">#</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#1a1a1a;font-size:16px;margin:0 0 8px;">Hi {to_name},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Use the code below to verify your email address. It expires in <strong>15 minutes</strong>.
      </p>
      <!-- Code box -->
      <div style="background:#f0fdf4;border:2px solid #39ebe2;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
        <span style="font-size:40px;font-weight:900;letter-spacing:8px;color:#00c853;font-variant-numeric:tabular-nums;">{code}</span>
      </div>
      <p style="color:#888;font-size:12px;margin:0;">
        If you didn't create a CyberShield account, you can safely ignore this email.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="color:#bbb;font-size:11px;margin:0;">Chipmunks & Chippettes CyberShield Demo</p>
    </div>
  </div>
</body>
</html>""".strip()


# ─── Send Verification Email ──────────────────────────────────────────────────

def send_verification_email(
    to_email: str,
    to_name: str,
    code: str
) -> dict:
    """
    Sends a verification email with the given code.
    Returns {"success": bool, "preview_url": Optional[str]}
    Falls back to console logging if SMTP is not configured.
    """
    from_address = os.getenv("SMTP_FROM", "CyberShield <noreply@cactus.uwimona.edu.jm>")
    html_content = _build_html(to_name, code)
    plain_text = f"Your CyberShield verification code is: {code}\n\nIt expires in 15 minutes."

    transport = _create_transport()

    # No SMTP configured — log to console for local dev/POC
    if not transport:
        logger.info("─" * 52)
        logger.info(f"[EmailVerification] To:   {to_email}")
        logger.info(f"[EmailVerification] Code: {code}")
        logger.info("─" * 52)
        return {"success": True, "preview_url": None}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your CyberShield verification code"
        msg["From"] = from_address
        msg["To"] = to_email
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        if transport["use_ssl"]:
            with smtplib.SMTP_SSL(transport["host"], transport["port"]) as server:
                server.login(transport["user"], transport["password"])
                server.sendmail(from_address, to_email, msg.as_string())
        else:
            with smtplib.SMTP(transport["host"], transport["port"]) as server:
                server.ehlo()
                server.starttls()
                server.login(transport["user"], transport["password"])
                server.sendmail(from_address, to_email, msg.as_string())

        return {"success": True, "preview_url": None}

    except Exception as e:
        logger.error(f"[EmailVerification] Failed to send: {e}")
        return {"success": False, "preview_url": None}