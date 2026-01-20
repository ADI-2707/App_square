from django.urls import path
from . import views

urlpatterns = [
    path("owned/", views.owned_projects),
    path("joined/", views.joined_projects),
    path("search/", views.search_projects),
    path("create/", views.create_project, name="create-project"),
    path("<uuid:project_id>/overview/", views.project_overview),
    path("my-projects/", views.user_projects),
]
