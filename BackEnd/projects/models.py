import uuid
import secrets
from datetime import timedelta

from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone


def generate_public_code():
    from .models import Project
    while True:
        code = f"APSQ-{secrets.token_hex(4).upper()}"
        if not Project.objects.filter(public_code=code).exists():
            return code


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255, unique=True)
    public_code = models.CharField(
        max_length=16,
        unique=True,
        db_index=True,
        default=generate_public_code
    )

    root_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="root_admin_projects"
    )

    access_key_hash = models.CharField(max_length=128)
    pin_hash = models.CharField(max_length=128)

    created_at = models.DateTimeField(auto_now_add=True)

    def set_access_key(self, raw_access_key: str):
        self.access_key_hash = make_password(raw_access_key)

    def check_access_key(self, raw_access_key: str) -> bool:
        return check_password(raw_access_key, self.access_key_hash)

    def set_pin(self, raw_pin: str):
        self.pin_hash = make_password(raw_pin)

    def check_pin(self, raw_pin: str) -> bool:
        return check_password(raw_pin, self.pin_hash)


class ProjectMember(models.Model):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("user", "User"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending"
    )

    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_invitations"
    )

    invited_at = models.DateTimeField(default=timezone.now)
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "project"],
                name="unique_project_member"
            )
        ]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["user", "status"]),
            models.Index(fields=["project", "role", "status"]),
        ]

    def __str__(self):
        return f"{self.user.email} → {self.project.name} ({self.status})"


class ProjectAccessSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )

    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ("user", "project")

    def is_active(self):
        return self.expires_at > timezone.now()

    def extend(self, hours=24):
        if self.expires_at - timezone.now() < timedelta(hours=2):
            self.expires_at = timezone.now() + timedelta(hours=hours)
            self.save(update_fields=["expires_at"])
