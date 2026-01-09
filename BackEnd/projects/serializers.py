from rest_framework import serializers
from .models import Project, ProjectMember


class ProjectListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    joined_at = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "public_code",
            "created_at",
            "role",
            "is_owner",
            "joined_at",
        ]

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return obj.root_admin == request.user

    def get_role(self, obj):
        request = self.context.get("request")

        if obj.root_admin == request.user:
            return "owner"

        member = ProjectMember.objects.filter(
            project=obj,
            user=request.user
        ).first()

        return member.role if member else None

    def get_joined_at(self, obj):
        request = self.context.get("request")

        if obj.root_admin == request.user:
            return obj.created_at

        member = ProjectMember.objects.filter(
            project=obj,
            user=request.user
        ).first()

        return member.joined_at if member else None
