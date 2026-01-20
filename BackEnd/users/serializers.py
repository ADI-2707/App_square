from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .models import UserProfile
from django.contrib.auth import authenticate
from projects.models import Project, ProjectMember


password_validator = RegexValidator(
    regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#_])[A-Za-z\d@#_]{8,}$',
    message=(
        "Password must contain at least 1 uppercase letter, "
        "1 lowercase letter, 1 number, 1 special character (@ # _), "
        "and be at least 8 characters long."
    ),
)

class RegisterSerializer(serializers.Serializer):

    fullname = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        validators=[password_validator]
    )
    confirmPassword = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered!")
        return value

    def validate(self, data):
        if data["password"] != data["confirmPassword"]:
            raise serializers.ValidationError({
                "confirmPassword": "Passwords do not match!"
            })
        return data

    def create(self, validated_data):
        validated_data.pop("confirmPassword")

        email = validated_data["email"].lower()
        password = validated_data["password"]
        fullname = validated_data["fullname"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        UserProfile.objects.create(
            user=user,
            full_name=fullname
        )

        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user_exists = User.objects.filter(username=email).exists()
        
        if not user_exists:
            raise serializers.ValidationError({"email": "User not found. Please register first!"})

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError({"password": "Invalid credentials!"})

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled!")

        data["user"] = user
        return data
    

class ProjectSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "owner_name", "created_at"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[password_validator])

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value