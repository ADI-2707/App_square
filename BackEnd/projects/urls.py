from django.urls import path
from .views import my_projects, create_project, search_projects

urlpatterns = [
    path("my/", my_projects, name="my-projects"),
    path("create/", create_project, name="create_project"),
    path("search/", search_projects, name="search-projects"),
]
