from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q

from .models import Project, ProjectMember
from .serializers import ProjectListSerializer
from .utils import generate_project_pin


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_projects(request):
    """
    HOME PAGE:
    All projects where the user is a MEMBER or ROOT ADMIN
    """
    projects = (
        Project.objects
        .filter(projectmember__user=request.user)
        .distinct()
        .order_by("-created_at")
    )

    serializer = ProjectListSerializer(
        projects,
        many=True,
        context={"request": request}
    )
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_project(request):
    """
    Creates a project with:
    - public project code
    - admin-defined access key
    - system-generated security PIN (returned ONCE)
    """
    user = request.user
    data = request.data
    members = data.get("members", [])

    name = data.get("name", "").strip()
    access_key = data.get("access_key", "").strip()

    # ---------------- VALIDATION ----------------
    if not name:
        return Response(
            {"error": "Project name is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not access_key or len(access_key) < 6:
        return Response(
            {"error": "Access Key must be at least 6 characters"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(members) > 3:
        return Response(
            {"error": "Maximum 3 members allowed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    admin_count = sum(1 for m in members if m.get("role") == "admin")
    if admin_count < 1:
        return Response(
            {"error": "At least one admin required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------------- CREATION ----------------
    raw_pin = generate_project_pin()

    with transaction.atomic():
        project = Project.objects.create(
            name=name,
            root_admin=user,
            access_key_hash="temp",
            pin_hash="temp",
        )

        project.set_access_key(access_key)
        project.set_pin(raw_pin)
        project.save()

        # Root admin is always admin member
        ProjectMember.objects.get_or_create(
            project=project,
            user=user,
            defaults={"role": "admin"}
        )

        for m in members:
            email = m.get("email")
            role = m.get("role", "user")

            if not email:
                continue
            
            try:
                member_user = User.objects.get(email=email)
            except User.DoesNotExist:
                continue

            if member_user == user:
                continue

            ProjectMember.objects.get_or_create(
                project=project,
                user=member_user,
                role=m.get("role", role)
            )

    return Response(
        {
            "project": {
                "id": project.id,
                "name": project.name,
                "public_code": project.public_code,
            },
            "pin": raw_pin,  # ⚠️ RETURNED ONCE ONLY
        },
        status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_projects(request):
    """
    Search by project name or public code
    """
    q = request.query_params.get("q", "").strip()

    if not q:
        return Response([])

    projects = (
        Project.objects
        .filter(
            Q(name__icontains=q) |
            Q(public_code__icontains=q)
        )
        .filter(projectmember__user=request.user)
        .distinct()
        .order_by("-created_at")
    )

    serializer = ProjectListSerializer(
        projects,
        many=True,
        context={"request": request}
    )
    return Response(serializer.data)