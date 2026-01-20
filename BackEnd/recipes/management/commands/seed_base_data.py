from django.core.management.base import BaseCommand
from recipes.models import Tag, Combination, CombinationTag


class Command(BaseCommand):
    help = "Seed global Tags and Combinations"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding tags...")

        tags = []
        for i in range(1, 101):
            tag, _ = Tag.objects.get_or_create(
                name=f"Tag{i}",
                defaults={"default_value": 0}
            )
            tags.append(tag)

        self.stdout.write("Seeding combinations...")

        for i in range(1, 11):
            combo, created = Combination.objects.get_or_create(
                name=f"C{i}"
            )

            if not created:
                continue

            start = (i - 1) * 10
            end = start + 10

            for tag in tags[start:end]:
                CombinationTag.objects.create(
                    combination=combo,
                    tag=tag,
                    value=0
                )

        self.stdout.write(self.style.SUCCESS("Base data seeded successfully"))
