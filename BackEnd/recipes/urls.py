from django.urls import path
from .views import (
    ProjectRecipesView,
    RecipeDetailView,
    CreateRecipeView,
    TagListView,
    CombinationListView
)

urlpatterns = [
    path("tags/", TagListView.as_view()),
    path("combinations/", CombinationListView.as_view()),
    path("projects/<uuid:project_id>/recipes/", ProjectRecipesView.as_view()),
    path("projects/<uuid:project_id>/recipes/create/", CreateRecipeView.as_view()),
    path("recipes/<int:recipe_id>/", RecipeDetailView.as_view()),
]
