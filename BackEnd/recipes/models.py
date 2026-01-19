from django.db import models
from projects.models import Project


class Tag(models.Model):
    """
    Atomic measurable unit.
    Example: Tag1, Tag2, Tag3
    """
    name = models.CharField(max_length=50, unique=True)
    default_value = models.FloatField(default=0)

    def __str__(self):
        return self.name


class Combination(models.Model):
    """
    Group of tags with fixed values.
    Example: C1, C2, C3
    """
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class CombinationTag(models.Model):
    """
    Junction table:
    Combination ↔ Tag with value
    """
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

    def __str__(self):
        return f"{self.combination} - {self.tag}: {self.value}"


class Recipe(models.Model):
    """
    Recipe composed of combinations.
    Example: R1, R2, R3
    """
    name = models.CharField(max_length=50)
    project = models.ForeignKey(
        Project,
        related_name="recipes",
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("name", "project")

    def __str__(self):
        return f"{self.name} ({self.project})"


class RecipeCombination(models.Model):
    """
    Junction table:
    Recipe ↔ Combination
    """
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

    def __str__(self):
        return f"{self.recipe} → {self.combination}"
