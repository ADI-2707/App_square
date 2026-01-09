from rest_framework import serializers
from .models import Project


class ProjectListSerializer(serializers.ModelSerializer):
    role = serializers.CharField()
    is_owner = serializers.BooleanField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "public_code",
            "created_at",
            "role",
            "is_owner",
        ]
