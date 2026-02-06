from django.urls import path
from . import views

urlpatterns = [
    path("owned/", views.owned_projects),
    path("joined/", views.joined_projects),
    path("create/", views.create_project),
    path("<uuid:project_id>/invite/", views.send_project_invitation),
    path("<uuid:project_id>/overview/", views.project_overview),
    path("<uuid:project_id>/verify-password/", views.verify_project_password),
    path("my-projects/", views.my_projects, name="my-projects"),
    path("invitations/pending/", views.get_pending_invitations),
    path("invitations/<int:member_id>/accept/", views.accept_invitation_with_password),
    path("invitations/<int:member_id>/reject/", views.reject_invitation),
]