from projects.models import Project, ProjectMember

def get_user_role(user, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return None

    if project.root_admin_id == user.id:
        return "root"

    try:
        member = ProjectMember.objects.get(
            user=user,
            project=project
        )
        return member.role
    except ProjectMember.DoesNotExist:
        return None
