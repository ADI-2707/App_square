from django.urls import path
from .views import ProjectRecipesView, RecipeDetailView

urlpatterns = [
    path("projects/<uuid:project_id>/recipes/", ProjectRecipesView.as_view()),
    path("recipes/<int:recipe_id>/", RecipeDetailView.as_view()),
]