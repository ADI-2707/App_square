from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Q, Value, BooleanField
from django.shortcuts import get_object_or_404
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
    cursor = parse_datetime(request.query_params.get("cursor")) if request.query_params.get("cursor") else None
    limit = int(request.query_params.get("limit", DEFAULT_LIMIT))

    qs = (
        Project.objects
        .filter(root_admin=request.user)
        .annotate(
            role=Value("root_admin"),
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
    cursor = parse_datetime(request.query_params.get("cursor")) if request.query_params.get("cursor") else None
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
def project_overview(request, project_id):
    project = get_object_or_404(Project, id=project_id)

    if project.root_admin == request.user:
        role = "root_admin"
        is_owner = True
    else:
        membership = ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).first()

        if not membership:
            return Response(
                {"detail": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        role = membership.role
        is_owner = False

    return Response({
        "id": str(project.id),
        "name": project.name,
        "public_code": project.public_code,
        "created_at": project.created_at,
        "role": role,
        "is_owner": is_owner,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_project(request):
    name = request.data.get("name", "").strip()
    if not name:
        return Response({"error": "Project name is required"}, status=400)

    with transaction.atomic():
        project = Project(name=name, root_admin=request.user)

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

    return Response({
        "id": str(project.id),
        "name": project.name,
        "public_code": project.public_code,
        "pin": raw_pin,
    }, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_projects(request):
    q = request.query_params.get("q", "").strip()

    if not q:
        return Response({"results": []})

    # Projects where user is owner or member
    owned_qs = Project.objects.filter(
        root_admin=request.user
    )

    joined_qs = Project.objects.filter(
        projectmember__user=request.user
    )

    qs = (
        owned_qs | joined_qs
    ).filter(
        Q(name__icontains=q) |
        Q(public_code__icontains=q)
    ).distinct().order_by("-created_at")[:10]

    results = []
    for project in qs:
        if project.root_admin == request.user:
            role = "root_admin"
            is_owner = True
        else:
            membership = ProjectMember.objects.filter(
                project=project,
                user=request.user
            ).first()
            role = membership.role if membership else "user"
            is_owner = False

        results.append({
            "id": str(project.id),
            "name": project.name,
            "public_code": project.public_code,
            "role": role,
            "is_owner": is_owner,
        })

    return Response({"results": results})