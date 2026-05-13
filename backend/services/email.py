"""Email service — sends verification emails via Gmail SMTP (or any SMTP server).

Gmail config (free, ~500 emails/day):
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your.address@gmail.com
  SMTP_PASSWORD=<16-char app password from https://myaccount.google.com/apppasswords>
  EMAIL_FROM=CardioPredict AI <your.address@gmail.com>
"""
import os
import smtplib
import ssl
from email.message import EmailMessage


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM") or (f"CardioPredict AI <{SMTP_USER}>" if SMTP_USER else None)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _verification_email_html(name: str, verify_url: str) -> str:
    return f"""\
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626,#e11d48);padding:32px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">&#10084;&#65039;</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">CardioPredict AI</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Welcome, {name}!</h2>
            <p style="margin:0 0 24px;color:#374151;line-height:1.6;font-size:15px;">
              Thanks for signing up to CardioPredict AI. Please confirm your email
              address by clicking the button below. The link expires in 24 hours.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr><td style="background:#dc2626;border-radius:10px;">
                <a href="{verify_url}" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Verify Email</a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Or paste this link into your browser:</p>
            <p style="margin:0 0 24px;color:#dc2626;font-size:13px;word-break:break-all;">{verify_url}</p>
            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
              If you didn&apos;t create this account, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;">
            CardioPredict AI &mdash; a portfolio project by Asif Nawaz
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_verification_email(*, to: str, name: str, token: str) -> None:
    """Send an account-verification email via SMTP. Raises if SMTP creds missing or send fails."""
    if not SMTP_USER or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_USER / SMTP_PASSWORD not configured — cannot send verification email"
        )

    verify_url = f"{FRONTEND_URL.rstrip('/')}/verify-email?token={token}"

    msg = EmailMessage()
    msg["From"] = EMAIL_FROM
    msg["To"] = to
    msg["Subject"] = "Verify your CardioPredict AI account"
    msg.set_content(
        f"Hi {name},\n\n"
        f"Verify your CardioPredict AI account by opening this link:\n{verify_url}\n\n"
        f"This link expires in 24 hours. If you didn't sign up, ignore this email."
    )
    msg.add_alternative(_verification_email_html(name=name or "there", verify_url=verify_url), subtype="html")

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
