from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .models import UserProfile
from django.contrib.auth import authenticate


# 🔐 Password rule (same as frontend)
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
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        validators=[password_validator]
    )
    confirmPassword = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["confirmPassword"]:
            raise serializers.ValidationError({
                "confirmPassword": "Passwords do not match."
            })
        return data

    def create(self, validated_data):
        validated_data.pop("confirmPassword")

        email = validated_data["email"]
        password = validated_data["password"]
        fullname = validated_data["fullname"]

        # Create Django user
        user = User.objects.create_user(
            username=email,  # email as username
            email=email,
            password=password
        )

        # Create user profile
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

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "User account is disabled."
            )

        data["user"] = user
        return data