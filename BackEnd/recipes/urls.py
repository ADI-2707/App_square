from django.urls import path
from .views import ProjectRecipesView, RecipeDetailView, CreateRecipeView

urlpatterns = [
    path("projects/<uuid:project_id>/recipes/", ProjectRecipesView.as_view()),
    path("recipes/<int:recipe_id>/", RecipeDetailView.as_view()),
    path(
    "projects/<uuid:project_id>/recipes/create/",
    CreateRecipeView.as_view()
),
]