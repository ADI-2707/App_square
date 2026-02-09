from rest_framework import serializers
from .models import (
    Tag,
    Combination,
    CombinationTag,
    Recipe,
    RecipeCombination,
    RecipeCombinationTagValue
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


class RecipeCombinationTagValueSerializer(serializers.ModelSerializer):
    tag = TagSerializer()

    class Meta:
        model = RecipeCombinationTagValue
        fields = ["tag", "value"]


class RecipeCombinationDetailSerializer(serializers.ModelSerializer):
    combination = CombinationSerializer()
    custom_tag_values = RecipeCombinationTagValueSerializer(many=True)

    class Meta:
        model = RecipeCombination
        fields = ["id", "order", "combination", "custom_tag_values"]


class RecipeDetailSerializer(serializers.ModelSerializer):
    recipe_combinations = RecipeCombinationDetailSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ["id", "name", "version", "recipe_combinations", "created_at", "updated_at", "is_archived"]


class RecipeCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    combinations = serializers.ListField(
        child=serializers.DictField(
            child=serializers.JSONField(),
            required=True
        )
    )

    def validate_combinations(self, value):
        for idx, combo in enumerate(value):
            if "id" not in combo:
                raise serializers.ValidationError(
                    f"Combination {idx}: missing id"
                )
            if "tag_values" not in combo:
                raise serializers.ValidationError(
                    f"Combination {idx}: missing tag_values"
                )
        return value