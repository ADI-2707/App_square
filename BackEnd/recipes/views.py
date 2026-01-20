from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction

from .models import Recipe, Combination, RecipeCombination, Tag
from .serializers import (
    RecipeDetailSerializer,
    RecipeCreateSerializer,
    TagSerializer,
    CombinationSerializer
)
from .utils import get_user_role, verify_project_pin
from projects.models import Project


class TagListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(TagSerializer(Tag.objects.all(), many=True).data)


class CombinationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CombinationSerializer(Combination.objects.all(), many=True).data)


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

        if role == "root":
            pin = request.data.get("pin")
            if not pin or not verify_project_pin(project, pin):
                return Response({"detail": "Invalid PIN"}, status=403)

        serializer = RecipeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipe = Recipe.objects.create(
            name=serializer.validated_data["name"],
            project=project
        )

        combos = Combination.objects.filter(
            id__in=serializer.validated_data["combination_ids"]
        )

        for idx, combo in enumerate(combos):
            RecipeCombination.objects.create(
                recipe=recipe,
                combination=combo,
                order=idx
            )

        return Response({"message": "Recipe created"}, status=201)
