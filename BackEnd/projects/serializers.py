from rest_framework import serializers
from .models import Project, ProjectMember


class ProjectListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "public_code",
            "created_at",
            "role",
        ]

    def get_role(self, obj):
        user = self.context["request"].user

        if obj.root_admin == user:
            return "admin"

        member = ProjectMember.objects.filter(
            project=obj,
            user=user
        ).first()

        return member.role if member else None
