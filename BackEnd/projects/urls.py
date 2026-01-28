from django.urls import path
from . import views

urlpatterns = [
    path("owned/", views.owned_projects),
    path("joined/", views.joined_projects),
    path("search/", views.search_projects),
    path("create/", views.create_project, name="create-project"),
    path("<uuid:project_id>/overview/", views.project_overview),
    path("<uuid:project_id>/delete/", views.delete_project, name="delete-project"),
    path("<uuid:project_id>/verify-password/", views.verify_project_password, name="verify-password"),
    path("<uuid:project_id>/search-users/", views.search_users_for_invitation, name="search-users"),
    path("<uuid:project_id>/invite/", views.send_project_invitation, name="send-invitation"),
    path("<uuid:project_id>/members/", views.get_project_members, name="project-members"),
    path("<uuid:project_id>/members/<int:member_id>/revoke/", views.revoke_member_access, name="revoke-member"),
    path("<uuid:project_id>/change-pin/", views.change_project_pin, name="change-pin"),
    path("invitations/pending/", views.get_pending_invitations, name="pending-invitations"),
    path("members/<int:member_id>/respond/", views.respond_to_invitation, name="respond-invitation"),
    path("my-projects/", views.user_projects),
]