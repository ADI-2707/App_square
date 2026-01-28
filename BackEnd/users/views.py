from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from .serializers import ChangePasswordSerializer

from .models import UserProfile
from projects.models import Project, ProjectMember
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data["user"]

    refresh = RefreshToken.for_user(user)

    try:
        profile = UserProfile.objects.get(user=user)
        full_name = profile.full_name
    except UserProfile.DoesNotExist:
        full_name = ""

    return Response(
        {
            "message": "Login successful",
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": full_name,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout endpoint to invalidate tokens.
    Blacklists the refresh token (if using token blacklist).
    """
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response(
            {"message": "Logout successful"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"detail": "Logout failed"},
            status=status.HTTP_400_BAD_REQUEST,
        )



class CreateProjectView(APIView):
    """
    Only authenticated users can create projects.
    Creator becomes ROOT admin automatically.
    Max 3 members allowed during creation.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        name = request.data.get("name")
        members = request.data.get("members", [])

        if not name or not name.strip():
            return Response(
                {"detail": "Project name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(members) > 3:
            return Response(
                {"detail": "Maximum 3 members allowed during creation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project = Project.objects.create(
            name=name.strip(),
            owner=user,
        )

        ProjectMember.objects.create(
            project=project,
            user=user,
            role="root",
        )

        for member in members:
            email = member.get("email")
            role = member.get("role", "user")

            if not email:
                continue

            try:
                member_user = User.objects.get(email=email)
            except User.DoesNotExist:
                continue

            if member_user == user:
                continue

            ProjectMember.objects.create(
                project=project,
                user=member_user,
                role="admin" if role == "admin" else "user",
            )

        return Response(
            {
                "id": project.id,
                "name": project.name,
                "owner": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class MyProjectsView(APIView):
    """
    Returns all projects the user is a member of.
    Used by HomePrivate page.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = (
            ProjectMember.objects
            .filter(user=request.user, is_active=True)
            .select_related("project", "project__owner")
        )

        data = []
        for m in memberships:
            data.append(
                {
                    "id": m.project.id,
                    "name": m.project.name,
                    "role": m.role,
                    "rootAdmin": {
                        "name": m.project.owner.userprofile.full_name
                        if hasattr(m.project.owner, "userprofile")
                        else m.project.owner.email,
                        "email": m.project.owner.email,
                    },
                }
            )

        return Response(data, status=status.HTTP_200_OK)


class ProjectDetailView(APIView):
    """
    Access single project if user is a member.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        membership = ProjectMember.objects.filter(
            project=project,
            user=request.user,
            is_active=True,
        ).first()

        if not membership:
            return Response(
                {"detail": "Access denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                "id": project.id,
                "name": project.name,
                "role": membership.role,
                "owner": project.owner.email,
                "created_at": project.created_at,
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        current_password = serializer.validated_data["current_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(current_password):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if current_password == new_password:
            return Response(
                {"detail": "New password cannot be the same as the current password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Password updated successfully. Please log in again."},
            status=status.HTTP_200_OK,
        )