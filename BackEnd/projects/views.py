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

def cursor_paginate(queryset, cursor, limit, date_field='created_at'):
    """
    Standard cursor pagination for descending order.
    Uses microsecond precision to prevent skip/repeat loops.
    date_field: field to use for cursor comparison ('created_at' or 'project__created_at')
    """
    # Apply cursor filter first
    if cursor:
        queryset = queryset.filter(**{f'{date_field}__lt': cursor})
    
    # Ensure ordering is applied BEFORE distinct for proper results
    # Django's distinct() behavior depends on database backend
    queryset = queryset.order_by(f'-{date_field}', '-id')

    items = list(queryset[: limit + 1])
    has_more = len(items) > limit
    results = items[:limit]
    
    # Handle getting the date value for related fields (e.g., 'project__created_at')
    if results:
        last_item = results[-1]
        if '__' in date_field:
            # For related fields like 'project__created_at'
            parts = date_field.split('__')
            date_value = last_item
            for part in parts:
                date_value = getattr(date_value, part)
        else:
            # For direct fields like 'created_at'
            date_value = getattr(last_item, date_field)
        
        next_cursor = date_value.strftime('%Y-%m-%dT%H:%M:%S.%f%z') if has_more else None
    else:
        next_cursor = None
    
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
    )

    projects, has_more, next_cursor = cursor_paginate(qs, cursor, limit, 'created_at')
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
    )
    
    # Use cursor pagination with project created_at
    memberships, has_more, next_cursor = cursor_paginate(memberships_qs, cursor, limit, 'project__created_at')

    results = []
    for m in memberships:
        results.append({
            "id": str(m.project.id),
            "name": m.project.name,
            "public_code": m.project.public_code,
            "created_at": m.project.created_at,
            "role": m.role,
            "is_owner": False,
        })

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


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_project(request, project_id):
    """
    Delete a project with PIN verification.
    Only the root_admin can delete a project.
    
    Expected request data:
    {
        "pin": "the_project_pin"
    }
    """
    project = get_object_or_404(Project, id=project_id)
    
    # Check if user is root_admin
    if project.root_admin != request.user:
        return Response(
            {"detail": "Only the project owner can delete this project"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Verify PIN
    pin = request.data.get("pin", "").strip()
    
    if not pin:
        return Response(
            {"detail": "PIN is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not project.check_pin(pin):
        return Response(
            {"detail": "Invalid PIN"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Delete the project
    project_name = project.name
    project.delete()
    
    return Response(
        {"detail": f"Project '{project_name}' has been deleted successfully"},
        status=status.HTTP_200_OK
    )