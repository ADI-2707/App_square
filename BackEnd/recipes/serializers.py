from rest_framework import serializers
from .models import (
    Tag,
    Combination,
    CombinationTag,
    Recipe,
    RecipeCombination
)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "default_value"]


class CombinationTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer()

    class Meta:
        model = CombinationTag
        fields = ["tag", "value"]


class CombinationSerializer(serializers.ModelSerializer):
    tag_values = CombinationTagSerializer(many=True)

    class Meta:
        model = Combination
        fields = ["id", "name", "tag_values"]


class RecipeCombinationSerializer(serializers.ModelSerializer):
    combination = CombinationSerializer()

    class Meta:
        model = RecipeCombination
        fields = ["order", "combination"]


class RecipeDetailSerializer(serializers.ModelSerializer):
    recipe_combinations = RecipeCombinationSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ["id", "name", "recipe_combinations"]


class RecipeCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    combination_ids = serializers.ListField(
        child=serializers.IntegerField()
    )