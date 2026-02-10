from django.db.models import Q
from django.utils.dateparse import parse_datetime
from django.utils import timezone
import json


def parse_cursor(cursor_str):
    if not cursor_str:
        return None

    try:
        data = json.loads(cursor_str)
        created_at = parse_datetime(data.get("created_at"))
        obj_id = data.get("id")

        if created_at and timezone.is_naive(created_at):
            created_at = timezone.make_aware(
                created_at,
                timezone.get_current_timezone()
            )

        return created_at, obj_id
    except Exception:
        return None


def encode_cursor(obj, date_field="created_at"):
    return json.dumps({
        "created_at": getattr(obj, date_field).isoformat(),
        "id": str(obj.id)
    })


def cursor_paginate(queryset, cursor, limit, date_field="created_at"):
    if cursor:
        cursor_date, cursor_id = cursor
        queryset = queryset.filter(
            Q(**{f"{date_field}__lt": cursor_date}) |
            Q(**{date_field: cursor_date, "id__lt": cursor_id})
        )

    queryset = queryset.order_by(f"-{date_field}", "-id")

    items = list(queryset[: limit + 1])
    has_more = len(items) > limit
    results = items[:limit]

    next_cursor = None
    if has_more and results:
        next_cursor = encode_cursor(results[-1], date_field)

    return results, has_more, next_cursor