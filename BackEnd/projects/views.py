from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Q, Value, BooleanField, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.contrib.auth.models import User
import secrets

from .models import Project, ProjectMember
from .serializers import ProjectListSerializer
from .utils import generate_project_pin

DEFAULT_LIMIT = 10

def cursor_paginate(queryset, cursor, limit):
    """
    Standard cursor pagination for descending order (-created_at).
    Uses microsecond precision to prevent skip/repeat loops.
    """
    if cursor:
        queryset = queryset.filter(
            created_at__lt=cursor
            )

    items = list(queryset[: limit + 1])
    has_more = len(items) > limit
    results = items[:limit]
    
    next_cursor = results[-1].created_at.strftime('%Y-%m-%dT%H:%M:%S.%f%z') if results and has_more else None
    
    return results, has_more, next_cursor


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def owned_projects(request):
    cursor_str = request.query_params.get("cursor")
    cursor = parse_datetime(cursor_str) if cursor_str else None
    if cursor and timezone.is_naive(cursor):
        cursor = timezone.make_aware(cursor, timezone.get_current_timezone())

    limit = int(request.query_params.get("limit", DEFAULT_LIMIT))

    qs = (
        Project.objects
        .filter(root_admin=request.user)
        .annotate(
            role=Value("root_admin"),
            is_owner=Value(True, output_field=BooleanField()),
        )
        .order_by("-created_at", "-id")
        .distinct()
    )

    projects, has_more, next_cursor = cursor_paginate(qs, cursor, limit)
    serializer = ProjectListSerializer(projects, many=True)

    return Response({
        "results": serializer.data,
        "has_more": has_more,
        "next_cursor": next_cursor
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def joined_projects(request):
    cursor_str = request.query_params.get("cursor")
    cursor = parse_datetime(cursor_str) if cursor_str else None
    if cursor and timezone.is_naive(cursor):
        cursor = timezone.make_aware(cursor, timezone.get_current_timezone())

    limit = int(request.query_params.get("limit", DEFAULT_LIMIT))

    memberships_qs = (
        ProjectMember.objects
        .filter(
            user=request.user,
            role__in=["admin", "user"]
        )
        .select_related("project")
        .annotate(
            p_id=F("project__id"),
            p_name=F("project__name"),
            p_code=F("project__public_code"),
            p_created=F("project__created_at"),
        )
        .order_by("-joined_at", "-id")
    )

    if cursor:
        memberships_qs = memberships_qs.filter(joined_at__lt=cursor)

    memberships = list(memberships_qs[: limit + 1])
    has_more = len(memberships) > limit
    current_page_members = memberships[:limit]

    results = []
    for m in current_page_members:
        results.append({
            "id": str(m.project.id),
            "name": m.project.name,
            "public_code": m.project.public_code,
            "created_at": m.project.created_at,
            "role": m.role,
            "is_owner": False,
        })

    next_cursor = current_page_members[-1].joined_at.strftime('%Y-%m-%dT%H:%M:%S.%f%z') if current_page_members and has_more else None

    return Response({
        "results": results,
        "has_more": has_more,
        "next_cursor": next_cursor
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
    members_list = request.data.get("members", []) 

    if not name:
        return Response({"error": "Project name is required"}, status=400)

    if Project.objects.filter(name__iexact=name).exists():
        return Response(
            {"error": "A project with this name already exists. Please choose a different name."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    raw_pin = generate_project_pin()
    raw_access_key = secrets.token_urlsafe(16)

    with transaction.atomic():
        project = Project(name=name, root_admin=request.user)
        project.set_access_key(raw_access_key)
        project.set_pin(raw_pin)
        project.save()

        for m_data in members_list:
            email = m_data.get("email", "").strip()
            role = m_data.get("role", "user").lower()

            if email:
                
                if email.lower() == request.user.email.lower():
                    continue 

                target_user = User.objects.filter(email__iexact=email).first()
                if target_user:
                    ProjectMember.objects.get_or_create(
                        project=project,
                        user=target_user,
                        defaults={'role': role}
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

    owned_qs = Project.objects.filter(root_admin=request.user)
    joined_qs = Project.objects.filter(projectmember__user=request.user)

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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_projects(request):
    """
    Lightweight endpoint for frontend access checks.
    Returns a flat list of all projects the user can access.
    """

    owned = Project.objects.filter(root_admin=request.user)
    joined = Project.objects.filter(projectmember__user=request.user)

    qs = (owned | joined).distinct()

    return Response([
        {
            "id": str(p.id),
            "name": p.name,
        }
        for p in qs
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_projects(request):
    owned = Project.objects.filter(root_admin=request.user)
    joined = Project.objects.filter(projectmember__user=request.user)

    qs = (owned | joined).distinct().order_by("-created_at")

    return Response({
        "results": [
            {
                "id": str(p.id),
                "name": p.name,
            }
            for p in qs
        ]
    })