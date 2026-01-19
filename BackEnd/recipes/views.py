from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Recipe
from .serializers import RecipeDetailSerializer


class ProjectRecipesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        recipes = Recipe.objects.filter(project_id=project_id)
        data = [{"id": r.id, "name": r.name} for r in recipes]
        return Response(data)


class RecipeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, recipe_id):
        recipe = Recipe.objects.get(id=recipe_id)
        serializer = RecipeDetailSerializer(recipe)
        return Response(serializer.data)
