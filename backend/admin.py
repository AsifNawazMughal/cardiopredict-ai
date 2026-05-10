"""
Admin panel mounted at /admin
=============================
Auto-generated UI over SQLAlchemy models, gated by an `admin` role on User.
After login, redirects straight to the Users list.
"""
import os
from itsdangerous import TimestampSigner, BadSignature
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse, HTMLResponse
from wtforms import SelectField
from markupsafe import Markup, escape
from dotenv import load_dotenv

from database.db import engine, SessionLocal
from database.models.user import User, UserRole
from database.models.patient import Patient
from database.models.prediction import Prediction
from controllers.auth_controller import authenticate_user

load_dotenv()
ADMIN_SECRET = os.getenv("SECRET_KEY", "changeme")


# ─── Auth backend ─────────────────────────────────────────────────────────────
class AdminAuth(AuthenticationBackend):
    """Sessions stored as a signed cookie. Only role=admin users can log in."""

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = (form.get("username") or "").strip()
        password = (form.get("password") or "").strip()
        if not username or not password:
            return False

        db = SessionLocal()
        try:
            user = authenticate_user(db, username, password)
        except Exception:
            return False
        finally:
            db.close()

        if user.role != UserRole.admin:
            return False

        request.session.update({"admin_user_id": user.id})
        return True

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        user_id = request.session.get("admin_user_id")
        if not user_id:
            return False
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
        finally:
            db.close()
        return bool(user and user.role == UserRole.admin and user.is_active)


# ─── Custom Admin: redirect /admin/ to /admin/user/list ──────────────────────
class CardioAdmin(Admin):
    async def index(self, request: Request):
        return RedirectResponse(url="/admin/user/list", status_code=302)


# ─── Display helpers ──────────────────────────────────────────────────────────
def _role_badge(model, _attr):
    color = "#dc2626" if model.role == UserRole.admin else "#2563eb"
    label = model.role.value.replace("_", " ").title()
    return Markup(
        f'<span style="background:{color};color:#fff;padding:2px 8px;'
        f'border-radius:9999px;font-size:11px;font-weight:600;">{label}</span>'
    )


def _bool_badge(model, attr):
    val = getattr(model, attr)
    if val:
        return Markup('<span style="color:#16a34a;font-weight:700;">✓ Active</span>')
    return Markup('<span style="color:#9ca3af;">✗ Disabled</span>')


def _fmt_date(model, attr):
    val = getattr(model, attr)
    return val.strftime("%Y-%m-%d %H:%M") if val else "—"


def _patient_report_button(model, _attr):
    """Render a 'View Report' link that opens the patient's report page."""
    return Markup(
        f'<a href="/reports/patient/{model.id}" '
        f'target="_blank" '
        f'style="background:#dc2626;color:#fff;padding:4px 10px;'
        f'border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">'
        f'View Report</a>'
    )


# ─── Model Views ─────────────────────────────────────────────────────────────
class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

    column_list = [
        User.id, User.username, User.email, User.role,
        User.first_name, User.last_name, User.specialization,
        User.hospital_name, User.is_active, User.created_at,
    ]
    column_details_list = [
        User.id, User.username, User.email, User.role,
        User.first_name, User.last_name, User.specialization,
        User.hospital_name, User.phone, User.license_number,
        User.is_active, User.created_at,
    ]
    column_labels = {
        "first_name": "First Name",
        "last_name": "Last Name",
        "hospital_name": "Hospital",
        "is_active": "Status",
        "created_at": "Joined",
    }
    column_searchable_list = [User.username, User.email, User.first_name, User.last_name]
    column_sortable_list = [User.id, User.username, User.email, User.role, User.is_active, User.created_at]
    column_default_sort = ("created_at", True)

    column_formatters = {
        User.role: _role_badge,
        User.is_active: lambda m, a: _bool_badge(m, "is_active"),
        User.created_at: lambda m, a: _fmt_date(m, "created_at"),
    }

    form_excluded_columns = [User.hashed_password, User.created_at, User.patients, User.predictions]
    form_overrides = {
        "role": SelectField,
        "is_active": SelectField,
    }
    form_args = {
        "role": {
            "choices": [(r.value, r.name.replace("_", " ").title()) for r in UserRole],
            # field.data may arrive as a UserRole enum (loading from DB) or a plain
            # string (form submit). Always normalise to the underlying string value.
            "coerce": lambda v: v.value if hasattr(v, "value") else (str(v) if v else ""),
        },
        "is_active": {
            "choices": [("true", "Active"), ("false", "Disabled")],
            "coerce": lambda v: v == "true" or v is True,
        },
    }


class PatientAdmin(ModelView, model=Patient):
    name = "Patient"
    name_plural = "Patients"
    icon = "fa-solid fa-user-injured"

    column_list = [
        Patient.id, Patient.first_name, Patient.last_name,
        Patient.gender, Patient.date_of_birth,
        Patient.contact_number, Patient.doctor_id, Patient.created_at, "report",
    ]
    column_details_list = [
        Patient.id, Patient.first_name, Patient.last_name,
        Patient.gender, Patient.date_of_birth,
        Patient.contact_number, Patient.address,
        Patient.doctor_id, Patient.created_at, "report",
    ]
    column_labels = {
        "first_name":     "First Name",
        "last_name":      "Last Name",
        "date_of_birth":  "DOB",
        "contact_number": "Phone",
        "doctor_id":      "Doctor",
        "created_at":     "Added",
        "report":         "Report",
    }
    column_searchable_list = [Patient.first_name, Patient.last_name, Patient.contact_number]
    column_sortable_list   = [Patient.id, Patient.first_name, Patient.last_name, Patient.created_at]
    column_default_sort    = ("created_at", True)

    column_formatters = {
        Patient.created_at: lambda m, a: _fmt_date(m, "created_at"),
        "report":           _patient_report_button,
    }
    column_formatters_detail = {
        Patient.created_at: lambda m, a: _fmt_date(m, "created_at"),
        "report":           _patient_report_button,
    }


# ─── Patient HTML report page ────────────────────────────────────────────────
# Cookie name + signer used by Starlette's SessionMiddleware. SQLAdmin sets up
# SessionMiddleware on its mounted sub-app, so we re-validate the cookie ourselves
# rather than relying on `request.session` outside that mount point.
_signer = TimestampSigner(ADMIN_SECRET)


def _admin_user_from_cookie(request: Request):
    """Verify the session cookie set by sqladmin and return the admin User, or None."""
    cookie = request.cookies.get("session")
    if not cookie:
        return None
    try:
        # Starlette stores session as base64(json).timestamp.signature
        import base64, json
        unsigned = _signer.unsign(cookie, max_age=60 * 60 * 24 * 14)
        data = json.loads(base64.b64decode(unsigned))
    except (BadSignature, ValueError, Exception):
        return None
    user_id = data.get("admin_user_id")
    if not user_id:
        return None
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()
    if not user or user.role != UserRole.admin or not user.is_active:
        return None
    return user


_RISK_COLORS = {"Low": "#16a34a", "Medium": "#d97706", "High": "#dc2626"}


def _render_report_html(patient, predictions) -> str:
    full_name = escape(f"{patient.first_name or ''} {patient.last_name or ''}".strip() or "—")
    rows = []
    for p in predictions:
        hp = p.health_parameter
        risk = p.risk_class.value if p.risk_class else ""
        risk_color = _RISK_COLORS.get(risk, "#6b7280")
        rows.append(f"""
            <tr>
              <td>{p.id}</td>
              <td><span class="risk-badge" style="background:{risk_color};">{escape(risk)}</span></td>
              <td><b>{round((p.confidence or 0) * 100, 1)}%</b></td>
              <td>{round((p.risk_score_low or 0) * 100, 1)}%</td>
              <td>{round((p.risk_score_medium or 0) * 100, 1)}%</td>
              <td>{round((p.risk_score_high or 0) * 100, 1)}%</td>
              <td>{escape(p.ml_model.model_type.value) if p.ml_model else "—"}</td>
              <td>{hp.age if hp else "—"}</td>
              <td>{("Male" if hp and hp.gender == 1 else "Female") if hp else "—"}</td>
              <td>{hp.cholesterol if hp else "—"}</td>
              <td>{hp.resting_bp if hp else "—"}</td>
              <td>{hp.max_heart_rate if hp else "—"}</td>
              <td>{p.predicted_at.strftime("%Y-%m-%d %H:%M") if p.predicted_at else "—"}</td>
            </tr>
        """)
    rows_html = "".join(rows) or '<tr><td colspan="13" style="text-align:center;color:#9ca3af;padding:24px;">No predictions yet</td></tr>'

    return f"""<!doctype html>
<html><head>
  <meta charset="utf-8">
  <title>Patient Report — {full_name}</title>
  <style>
    *, *::before, *::after {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background:#f9fafb; color:#111827; margin:0; padding:24px; }}
    .container {{ max-width: 1200px; margin: 0 auto; }}
    .top {{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }}
    .top a {{ color:#dc2626; text-decoration:none; font-size:14px; font-weight:500; }}
    h1 {{ font-size: 22px; margin: 0 0 4px; }}
    .subtitle {{ color:#6b7280; font-size: 13px; margin-bottom: 20px; }}
    .card {{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px; margin-bottom:16px; }}
    .card h2 {{ font-size: 15px; margin: 0 0 12px; color:#374151; }}
    .grid {{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:10px; }}
    .field {{ background:#f9fafb; border-radius:8px; padding:10px 12px; }}
    .field .label {{ font-size: 11px; color:#6b7280; text-transform: uppercase; letter-spacing: 0.5px; }}
    .field .value {{ font-size: 14px; font-weight: 600; color:#111827; margin-top: 2px; }}
    table {{ width:100%; border-collapse: collapse; font-size: 13px; table-layout: auto; }}
    th, td {{ text-align:left; padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }}
    th {{ background:#f9fafb; font-size: 11px; text-transform: uppercase; color:#6b7280; font-weight: 600; letter-spacing: 0.4px; }}
    tr:hover td {{ background:#fafafa; }}
    .risk-badge {{ color:#fff; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:600; display:inline-block; }}

    @media print {{
      @page {{ size: A4 landscape; margin: 12mm; }}
      body {{ background:#fff; padding:0; font-size: 11px; }}
      .top {{ display: none; }}
      .card {{ border:1px solid #d1d5db; box-shadow:none; page-break-inside: avoid; padding: 12px; }}
      .table-wrap {{ overflow: visible !important; }}
      table {{ font-size: 10px; }}
      th, td {{ padding: 4px 6px; }}
      tr:hover td {{ background: transparent; }}
      .risk-badge {{ border: 1px solid rgba(0,0,0,0.1); }}
    }}
  </style>
</head><body>
  <div class="container">
    <div class="top">
      <a href="/admin/patient/list">← Back to patients</a>
      <a href="javascript:window.print()">🖨 Print</a>
    </div>
    <h1>Patient Report</h1>
    <p class="subtitle">All prediction records for this patient.</p>

    <div class="card">
      <h2>Patient Information</h2>
      <div class="grid">
        <div class="field"><div class="label">ID</div><div class="value">#{patient.id}</div></div>
        <div class="field"><div class="label">Full Name</div><div class="value">{full_name}</div></div>
        <div class="field"><div class="label">Gender</div><div class="value">{escape(patient.gender or "—")}</div></div>
        <div class="field"><div class="label">DOB</div><div class="value">{escape(str(patient.date_of_birth) if patient.date_of_birth else "—")}</div></div>
        <div class="field"><div class="label">Phone</div><div class="value">{escape(patient.contact_number or "—")}</div></div>
        <div class="field"><div class="label">Doctor ID</div><div class="value">{patient.doctor_id or "—"}</div></div>
        <div class="field"><div class="label">Address</div><div class="value">{escape(patient.address or "—")}</div></div>
        <div class="field"><div class="label">Added</div><div class="value">{patient.created_at.strftime("%Y-%m-%d %H:%M") if patient.created_at else "—"}</div></div>
        <div class="field"><div class="label">Total Predictions</div><div class="value">{len(predictions)}</div></div>
      </div>
    </div>

    <div class="card">
      <h2>Prediction History</h2>
      <div class="table-wrap" style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Risk</th><th>Confidence</th>
              <th>Low %</th><th>Medium %</th><th>High %</th>
              <th>Model</th><th>Age</th><th>Sex</th>
              <th>Chol</th><th>BP</th><th>Max HR</th><th>Predicted At</th>
            </tr>
          </thead>
          <tbody>{rows_html}</tbody>
        </table>
      </div>
    </div>
  </div>
</body></html>"""


async def patient_report_page(patient_id: int, request: Request):
    """HTML report showing one patient's full record + every prediction."""
    if not _admin_user_from_cookie(request):
        return RedirectResponse(url="/admin/login", status_code=302)

    db = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return HTMLResponse("<h1>404</h1><p>Patient not found.</p>", status_code=404)
        predictions = (
            db.query(Prediction)
            .filter(Prediction.patient_id == patient_id)
            .order_by(Prediction.predicted_at.desc())
            .all()
        )
        # Eagerly access related fields while session is open
        for p in predictions:
            _ = p.health_parameter
            _ = p.ml_model
        html = _render_report_html(patient, predictions)
    finally:
        db.close()

    return HTMLResponse(html)


# ─── Setup ────────────────────────────────────────────────────────────────────
def setup_admin(app):
    """Mount admin at /admin and register Users + Patients only."""
    auth = AdminAuth(secret_key=ADMIN_SECRET)
    admin = CardioAdmin(
        app,
        engine,
        title="CardioPredict AI — Admin",
        authentication_backend=auth,
    )
    admin.add_view(UserAdmin)
    admin.add_view(PatientAdmin)

    # Custom HTML report page — lives OUTSIDE /admin/ because sqladmin's
    # mount at /admin/ intercepts every URL underneath it. We re-validate
    # the session cookie ourselves in patient_report_page().
    app.add_api_route(
        "/reports/patient/{patient_id}",
        patient_report_page,
        methods=["GET"],
        include_in_schema=False,
    )
    return admin
