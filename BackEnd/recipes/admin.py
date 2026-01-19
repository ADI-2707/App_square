from django.contrib import admin
from .models import (
    Tag,
    Combination,
    CombinationTag,
    Recipe,
    RecipeCombination
)

admin.site.register(Tag)
admin.site.register(Combination)
admin.site.register(CombinationTag)
admin.site.register(Recipe)
admin.site.register(RecipeCombination)