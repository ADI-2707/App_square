import secrets
import string
from datetime import timedelta
from django.utils import timezone
from .models import ProjectAccessSession, ProjectMember

SPECIAL_CHARS = "!@#$%&*"
ACCESS_TTL_HOURS = 24


def generate_project_pin(length: int = 8) -> str:
    if length < 8:
        raise ValueError("Project PIN length must be at least 8 characters")

    alphabet = (
        string.ascii_lowercase
        + string.ascii_uppercase
        + string.digits
        + SPECIAL_CHARS
    )

    while True:
        pin = "".join(secrets.choice(alphabet) for _ in range(length))

        if (
            any(c.islower() for c in pin)
            and any(c.isupper() for c in pin)
            and any(c.isdigit() for c in pin)
            and any(c in SPECIAL_CHARS for c in pin)
        ):
            return pin


def ensure_project_access(user, project):
    session, created = ProjectAccessSession.objects.get_or_create(
        user=user,
        project=project,
        defaults={
            "expires_at": timezone.now() + timedelta(hours=ACCESS_TTL_HOURS)
        }
    )

    if not created:
        if session.expires_at <= timezone.now():
            session.expires_at = timezone.now() + timedelta(hours=ACCESS_TTL_HOURS)
            session.save()

    return session


def require_project_access(user, project):
    session = ProjectAccessSession.objects.filter(
        user=user,
        project=project,
        expires_at__gt=timezone.now()
    ).first()

    if not session:
        return False

    session.expires_at = timezone.now() + timedelta(hours=ACCESS_TTL_HOURS)
    session.save()
    return True


def get_admin_count(project):
    return ProjectMember.objects.filter(
        project=project,
        role="admin",
        status="accepted"
    ).count()