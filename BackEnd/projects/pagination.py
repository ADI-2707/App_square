from django.db.models import Q
from django.utils.dateparse import parse_datetime
from django.utils import timezone


def parse_cursor(cursor_str):
    if not cursor_str:
        return None
    cursor = parse_datetime(cursor_str)
    if cursor and timezone.is_naive(cursor):
        cursor = timezone.make_aware(cursor, timezone.get_current_timezone())
    return cursor


def cursor_paginate(queryset, cursor, limit, date_field="created_at"):
    if cursor:
        queryset = queryset.filter(**{f"{date_field}__lt": cursor})

    queryset = queryset.order_by(f"-{date_field}", "-id")

    items = list(queryset[: limit + 1])
    has_more = len(items) > limit
    results = items[:limit]

    next_cursor = None
    if has_more and results:
        next_cursor = getattr(results[-1], date_field).isoformat()

    return results, has_more, next_cursor
