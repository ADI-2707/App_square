from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import F, Value, BooleanField
from django.utils.dateparse import parse_datetime
import secrets
from .models import Project, ProjectMember
from .serializers import ProjectListSerializer
from .utils import generate_project_pin

DEFAULT_LIMIT = 10


def cursor_paginate(queryset, cursor, limit):
    if cursor:
        queryset = queryset.filter(created_at__lt=cursor)

    items = list(queryset[: limit + 1])
    has_more = len(items) > limit

    return items[:limit], has_more


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def owned_projects(request):
    cursor_param = request.query_params.get("cursor")
    cursor = parse_datetime(cursor_param) if cursor_param else None

    limit = int(request.query_params.get("limit", DEFAULT_LIMIT))

    qs = (
        Project.objects
        .filter(root_admin=request.user)
        .annotate(
            role=Value("admin"),
            is_owner=Value(True, output_field=BooleanField()),
        )
        .order_by("-created_at")
    )

    projects, has_more = cursor_paginate(qs, cursor, limit)

    serializer = ProjectListSerializer(projects, many=True)
    return Response({
        "results": serializer.data,
        "has_more": has_more,
        "next_cursor": projects[-1].created_at if has_more else None
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def joined_projects(request):
    cursor_param = request.query_params.get("cursor")
    cursor = parse_datetime(cursor_param) if cursor_param else None

    limit = int(request.query_params.get("limit", DEFAULT_LIMIT))

    memberships = (
        ProjectMember.objects
        .filter(user=request.user)
        .exclude(project__root_admin=request.user)
        .select_related("project")
        .order_by("-joined_at")
    )

    if cursor:
        memberships = memberships.filter(joined_at__lt=cursor)

    memberships = memberships[: limit + 1]
    has_more = len(memberships) > limit

    projects = []
    for m in memberships[:limit]:
        p = m.project
        p.role = m.role
        p.is_owner = False
        projects.append(p)

    serializer = ProjectListSerializer(projects, many=True)
    return Response({
        "results": serializer.data,
        "has_more": has_more,
        "next_cursor": memberships[limit - 1].joined_at if has_more else None
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_projects(request):
    q = request.query_params.get("q", "").strip()

    if not q:
        return Response([])

    qs = (
        Project.objects
        .filter(
            projectmember__user=request.user,
        )
        .filter(name__icontains=q)
        .distinct()
        .order_by("-created_at")
    )

    serializer = ProjectListSerializer(qs[:25], many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_project(request):
    name = request.data.get("name", "").strip()

    if not name:
        return Response(
            {"error": "Project name is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():
        project = Project(
            name=name,
            root_admin=request.user
        )

        # creator becomes admin member
        raw_access_key = secrets.token_urlsafe(16)
        raw_pin = generate_project_pin()

        project.set_access_key(raw_access_key)
        project.set_pin(raw_pin)
        project.save()

        ProjectMember.objects.create(
            project=project,
            user=request.user,
            role="admin"
        )

    return Response(
        {
            "id": str(project.id),
            "name": project.name,
            "public_code": project.public_code,
            "pin": raw_pin,
        },
        status=status.HTTP_201_CREATED
    )