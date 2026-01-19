from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction
from .models import (
    Recipe,
    Combination,
    CombinationTag,
    RecipeCombination,
    Tag
)
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


class CreateRecipeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, project_id):
        serializer = RecipeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Create recipe
        recipe = Recipe.objects.create(
            name=data["name"],
            project_id=project_id
        )

        for index, combo_data in enumerate(data["combinations"]):
            # Create combination
            combination = Combination.objects.create(
                name=combo_data["name"]
            )

            # Attach tags to combination
            for tag_data in combo_data["tags"]:
                tag = Tag.objects.get(id=tag_data["tag_id"])
                CombinationTag.objects.create(
                    combination=combination,
                    tag=tag,
                    value=tag_data["value"]
                )

            # Attach combination to recipe
            RecipeCombination.objects.create(
                recipe=recipe,
                combination=combination,
                order=index
            )

        return Response(
            {"message": "Recipe created successfully"},
            status=status.HTTP_201_CREATED
        )
