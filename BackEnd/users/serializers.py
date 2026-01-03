from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class RegisterSerializer(serializers.Serializer):
    fullname = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirmPassword = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["password"] != data["confirmPassword"]:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        fullname = validated_data["fullname"]

        # Create Django user
        user = User.objects.create_user(
            username=email,   # username = email
            email=email,
            password=password
        )

        # Create user profile
        UserProfile.objects.create(
            user=user,
            full_name=fullname
        )

        return user
