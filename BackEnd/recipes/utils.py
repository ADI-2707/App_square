from projects.models import ProjectMember


def get_user_role(user, project_id):
    try:
        membership = ProjectMember.objects.get(
            user=user,
            project_id=project_id
        )
        return membership.role
    except ProjectMember.DoesNotExist:
        return None


def verify_project_pin(project, raw_pin):
    return project.check_pin(raw_pin)
