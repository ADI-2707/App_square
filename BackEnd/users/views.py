from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.decorators import throttle_classes
from rest_framework.permissions import AllowAny

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def register(request):
    register.throttle_scope = "register"
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(
        {"detail": "Registered successfully"},
        status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def login(request):
    login.throttle_scope = "login"
    serializer = LoginSerializer(
        data=request.data,
        context={"request": request}
    )
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]
    refresh = RefreshToken.for_user(user)

    return Response({
        "tokens": {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        },
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ScopedRateThrottle])
def logout(request):
    logout.throttle_scope = "logout"
    refresh = request.data.get("refresh")
    if refresh:
        RefreshToken(refresh).blacklist()

    return Response({"detail": "Logged out"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ScopedRateThrottle])
def change_password(request):
    change_password.throttle_scope = "password_change"
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user

    if not user.check_password(serializer.validated_data["current_password"]):
        return Response(
            {"detail": "Incorrect current password"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(serializer.validated_data["new_password"])
    user.save()

    return Response({"detail": "Password changed successfully"})
