from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction

from .models import (
    Recipe,
    Combination,
    RecipeCombination,
    Tag,
    RecipeCombinationTagValue,
)
from .serializers import (
    RecipeDetailSerializer,
    RecipeCreateSerializer,
    TagSerializer,
    CombinationSerializer,
)
from .utils import get_user_role
from projects.models import Project


class TagListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(TagSerializer(Tag.objects.all(), many=True).data)


class CombinationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        combinations = Combination.objects.prefetch_related("tag_values__tag")
        return Response(CombinationSerializer(combinations, many=True).data)


class ProjectRecipesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        recipes = Recipe.objects.filter(project_id=project_id)
        return Response([{"id": r.id, "name": r.name} for r in recipes])


class RecipeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, recipe_id):
        recipe = Recipe.objects.get(id=recipe_id)
        return Response(RecipeDetailSerializer(recipe).data)


class CreateRecipeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, project_id):
        role = get_user_role(request.user, project_id)

        if role not in ("root", "admin"):
            return Response({"detail": "Forbidden"}, status=403)

        project = Project.objects.get(id=project_id)

        serializer = RecipeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]
        combinations_data = serializer.validated_data["combinations"]

        if Recipe.objects.filter(name=name, project=project).exists():
            return Response(
                {"detail": "Recipe with this name already exists"},
                status=400
            )

        recipe = Recipe.objects.create(
            name=name,
            project=project,
            version=1
        )

        for idx, combo_data in enumerate(combinations_data):
            combination = Combination.objects.get(id=combo_data["id"])

            recipe_combo = RecipeCombination.objects.create(
                recipe=recipe,
                combination=combination,
                order=idx
            )

            for tag_value in combo_data.get("tag_values", []):
                RecipeCombinationTagValue.objects.create(
                    recipe_combination=recipe_combo,
                    tag_id=tag_value["tag_id"],
                    value=tag_value["value"]
                )

        return Response(
            {"id": recipe.id, "name": recipe.name},
            status=201
        )