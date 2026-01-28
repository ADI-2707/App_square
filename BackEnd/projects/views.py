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

    if cursor:
        queryset = queryset.filter(**{f'{date_field}__lt': cursor})
    
    queryset = queryset.order_by(f'-{date_field}', '-id')

    items = list(queryset[: limit + 1])
    has_more = len(items) > limit
    results = items[:limit]

    if results:
        last_item = results[-1]
        if '__' in date_field:
            parts = date_field.split('__')
            date_value = last_item
            for part in parts:
                date_value = getattr(date_value, part)
        else:
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
    access_key = request.data.get("access_key", "").strip()
    members_list = request.data.get("members", []) 

    if not name:
        return Response({"detail": "Project name is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not access_key:
        return Response({"detail": "Project access key is required"}, status=status.HTTP_400_BAD_REQUEST)

    if len(access_key) < 6:
        return Response({"detail": "Project access key must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)

    if Project.objects.filter(name__iexact=name).exists():
        return Response(
            {"detail": "A project with this name already exists. Please choose a different name."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    valid_members = []
    admin_count = 0
    
    for m_data in members_list:
        email = m_data.get("email", "").strip()
        role = m_data.get("role", "user").lower()

        if email:
            if email.lower() == request.user.email.lower():
                continue

            target_user = User.objects.filter(email__iexact=email).first()
            if not target_user:
                return Response(
                    {"detail": f"User with email '{email}' is not registered. Please invite only registered users."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_members.append((target_user, role))
            if role == "admin":
                admin_count += 1

    if admin_count < 1:
        return Response(
            {"detail": "At least one member must be marked as Admin"},
            status=status.HTTP_400_BAD_REQUEST
        )

    raw_pin = generate_project_pin()

    with transaction.atomic():
        project = Project(name=name, root_admin=request.user)
        project.set_access_key(access_key)
        project.set_pin(raw_pin)
        project.save()

        for target_user, role in valid_members:
            ProjectMember.objects.get_or_create(
                project=project,
                user=target_user,
                defaults={'role': role, 'invited_by': request.user}
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

    if project.root_admin != request.user:
        return Response(
            {"detail": "Only the project owner can delete this project"},
            status=status.HTTP_403_FORBIDDEN
        )

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

    project_name = project.name
    project.delete()
    
    return Response(
        {"detail": f"Project '{project_name}' has been deleted successfully"},
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users_for_invitation(request, project_id):
    """
    Search for registered users by email to invite them to a project.
    Only root_admin can invite users.
    Returns users that are not already members of the project.
    """
    project = get_object_or_404(Project, id=project_id)

    if project.root_admin != request.user:
        return Response(
            {"detail": "Only the project owner can invite members"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    email = request.query_params.get("email", "").strip()
    
    if len(email) < 3:
        return Response({"results": []})

    existing_members = ProjectMember.objects.filter(project=project).values_list('user_id', flat=True)
    
    users = User.objects.filter(
        email__icontains=email
    ).exclude(
        id__in=existing_members
    ).exclude(
        id=request.user.id
    ).values('id', 'email', 'first_name', 'last_name')[:10]
    
    return Response({
        "results": list(users)
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_project_invitation(request, project_id):
    """
    Send an invitation to a registered user to join the project.
    Only root_admin can send invitations.
    Invited user starts with 'pending' status.
    """
    project = get_object_or_404(Project, id=project_id)

    if project.root_admin != request.user:
        return Response(
            {"detail": "Only the project owner can invite members"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_id = request.data.get("user_id")
    
    if not user_id:
        return Response(
            {"detail": "user_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        invited_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    existing = ProjectMember.objects.filter(
        project=project,
        user=invited_user
    ).first()
    
    if existing:
        return Response(
            {"detail": "User is already a member of this project"},
            status=status.HTTP_400_BAD_REQUEST
        )

    member, created = ProjectMember.objects.get_or_create(
        project=project,
        user=invited_user,
        defaults={
            'role': 'user',
            'status': 'pending',
            'invited_by': request.user
        }
    )
    
    if not created and member.status == 'pending':
        return Response(
            {"detail": "Invitation already sent to this user"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({
        "detail": f"Invitation sent to {invited_user.email}",
        "member": {
            "id": member.id,
            "user_email": invited_user.email,
            "status": member.status
        }
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_pending_invitations(request):
    """
    Get all pending invitations for the logged-in user.
    """
    pending = ProjectMember.objects.filter(
        user=request.user,
        status='pending'
    ).select_related('project')
    
    invitations = []
    for member in pending:
        inviter = member.invited_by or member.project.root_admin

        if inviter:
            try:
                inviter_name = inviter.profile.full_name
            except:
                inviter_name = inviter.email
        else:
            inviter_name = "Unknown"
        
        invitations.append({
            "id": member.id,
            "project_id": str(member.project.id),
            "project_name": member.project.name,
            "public_code": member.project.public_code,
            "invited_at": member.invited_at,
            "invited_by_name": inviter_name,
            "invited_by_email": inviter.email if inviter else "unknown@example.com",
            "role": member.role
        })
    
    return Response({
        "count": len(invitations),
        "results": invitations
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def respond_to_invitation(request, member_id):
    """
    Accept or reject a project invitation.
    Action should be 'accept' or 'reject'.
    """
    member = get_object_or_404(ProjectMember, id=member_id)

    if member.user != request.user:
        return Response(
            {"detail": "You can only respond to your own invitations"},
            status=status.HTTP_403_FORBIDDEN
        )

    if member.status != 'pending':
        return Response(
            {"detail": f"Invitation is already {member.status}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    action = request.data.get("action", "").lower()
    
    if action == "accept":
        member.status = "accepted"
        member.save()
        return Response({
            "detail": f"Invitation to '{member.project.name}' accepted",
            "project": {
                "id": str(member.project.id),
                "name": member.project.name
            }
        })
    elif action == "reject":
        member.delete()
        return Response({
            "detail": "Invitation rejected"
        })
    else:
        return Response(
            {"detail": "action must be 'accept' or 'reject'"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_project_members(request, project_id):
    """
    Get all members of a project (root_admin + accepted members).
    Only root_admin can view this.
    Supports pagination with limit and offset.
    """
    project = get_object_or_404(Project, id=project_id)

    if project.root_admin != request.user:
        return Response(
            {"detail": "Only project owner can view members"},
            status=status.HTTP_403_FORBIDDEN
        )

    limit = int(request.query_params.get("limit", 10))
    offset = int(request.query_params.get("offset", 0))
    
    members_list = []

    try:
        root_admin_name = project.root_admin.profile.full_name
    except:
        root_admin_name = project.root_admin.email
    
    members_list.append({
        "id": 0,
        "user_id": str(project.root_admin.id),
        "email": project.root_admin.email,
        "name": root_admin_name,
        "role": "root_admin"
    })

    accepted_members = ProjectMember.objects.filter(
        project=project,
        status='accepted'
    ).select_related('user').order_by('joined_at')
    
    for member in accepted_members:
        try:
            member_name = member.user.profile.full_name
        except:
            member_name = member.user.email
        
        members_list.append({
            "id": member.id,
            "user_id": str(member.user.id),
            "email": member.user.email,
            "name": member_name,
            "role": member.role
        })

    total_count = len(members_list)
    paginated_members = members_list[offset:offset + limit]
    
    return Response({
        "count": total_count,
        "limit": limit,
        "offset": offset,
        "results": paginated_members
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_project_password(request, project_id):
    """
    Verify the project password.
    User must be a member or admin of the project.
    """
    project = get_object_or_404(Project, id=project_id)

    is_member = ProjectMember.objects.filter(
        project=project,
        user=request.user,
        status='accepted'
    ).exists()
    is_root_admin = project.root_admin.id == request.user.id
    
    if not (is_member or is_root_admin):
        return Response(
            {"detail": "You are not a member of this project"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    password = request.data.get("password", "").strip()
    
    if not password:
        return Response(
            {"detail": "Password is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not project.check_access_key(password):
        return Response(
            {"detail": "Invalid password"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    return Response({
        "detail": "Password verified successfully"
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def revoke_member_access(request, project_id, member_id):
    """
    Revoke a member's access to the project.
    Only root_admin can revoke access.
    """
    project = get_object_or_404(Project, id=project_id)
    member = get_object_or_404(ProjectMember, id=member_id, project=project)

    if project.root_admin != request.user:
        return Response(
            {"detail": "Only project owner can revoke access"},
            status=status.HTTP_403_FORBIDDEN
        )

    if member.user == project.root_admin:
        return Response(
            {"detail": "Cannot remove project owner"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    member_email = member.user.email
    member.delete()
    
    return Response({
        "detail": f"Access revoked for {member_email}"
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_project_pin(request, project_id):
    """
    Change project password (access key).
    Only root_admin can change it.
    """
    project = get_object_or_404(Project, id=project_id)

    if project.root_admin != request.user:
        return Response(
            {"detail": "Only project owner can change password"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_password = request.data.get("new_password", "").strip()
    
    if not new_password:
        return Response(
            {"detail": "new_password is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 6:
        return Response(
            {"detail": "Password must be at least 6 characters"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    project.set_access_key(new_password)
    project.save()
    
    return Response({
        "detail": "Project password updated successfully"
    })