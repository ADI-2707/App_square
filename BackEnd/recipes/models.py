from django.db import models
from projects.models import Project


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    default_value = models.FloatField(default=0)

    def __str__(self):
        return self.name


class Combination(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class CombinationTag(models.Model):
    combination = models.ForeignKey(
        Combination,
        related_name="tag_values",
        on_delete=models.CASCADE
    )
    tag = models.ForeignKey(
        Tag,
        related_name="combination_values",
        on_delete=models.CASCADE
    )
    value = models.FloatField()

    class Meta:
        unique_together = ("combination", "tag")


class Recipe(models.Model):
    name = models.CharField(max_length=50)
    project = models.ForeignKey(
        Project,
        related_name="recipes",
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("name", "project")


class RecipeCombination(models.Model):
    recipe = models.ForeignKey(
        Recipe,
        related_name="recipe_combinations",
        on_delete=models.CASCADE
    )
    combination = models.ForeignKey(
        Combination,
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("recipe", "combination")
        ordering = ["order"]
