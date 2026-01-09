from django.urls import path
from . import views

urlpatterns = [
    path("owned/", views.owned_projects),
    path("joined/", views.joined_projects),
    path("search/", views.search_projects),
    path("create/", views.create_project, name="create-project"),
]