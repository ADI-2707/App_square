from django.core.management.base import BaseCommand
from recipes.models import Tag


class Command(BaseCommand):
    help = "Seed initial tags"

    def handle(self, *args, **kwargs):
        for i in range(1, 11):
            tag_name = f"Tag{i}"
            Tag.objects.get_or_create(
                name=tag_name,
                defaults={"default_value": 0}
            )
        self.stdout.write(self.style.SUCCESS("Tags seeded successfully"))