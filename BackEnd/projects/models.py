import uuid
import secrets
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password


def generate_public_code():
    return f"APSQ-{secrets.token_hex(4).upper()}"


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
        User,
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

    def __str__(self):
        return self.name


class ProjectMember(models.Model):
    ROLE_CHOICES = (
        ("root", "Root Admin"),
        ("admin", "Admin"),
        ("user", "User"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "project")

    def __str__(self):
        return f"{self.user.email} → {self.project.name} ({self.role})"
