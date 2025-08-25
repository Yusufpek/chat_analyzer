from datetime import datetime
from zoneinfo import ZoneInfo


def filter_mapper(filter_dict: dict, prefix: str = "") -> dict:
    """
    Maps filter dictionary to Django ORM query parameters.
    Example input: {"created_at;gte": "2023-10-01", "status;eq": "active"}
    Example output: {"created_at__gte": datetime_object, "status": "active"}
    :param filter_dict: Dictionary with filter strings as keys and their values.
    :param prefix: Optional prefix to add to each field (e.g., for related fields use "related_field__").
    :return: Dictionary suitable for Django ORM filtering.
    :raises ValueError: If the filter format is invalid or contains unsupported fields/operators.
    """
    allowed_fields = {"created_at", "modified_at", "saved_at", "source"}
    allowed_operators = {
        "eq",
        "ne",
        "lt",
        "lte",
        "gt",
        "gte",
        "contains",
        "startswith",
        "endswith",
        "in",
    }

    query_params = {}
    for filter_str, value in filter_dict.items():
        try:
            field, operator = filter_str.split(";")
        except ValueError:
            raise ValueError(f"Invalid filter format: {filter_str}")

        if field not in allowed_fields:
            raise ValueError(f"Invalid field: {field}")
        if operator not in allowed_operators:
            raise ValueError(f"Invalid operator: {operator}")

        # Map operator to Django ORM syntax
        mapping = {
            "eq": "",
            "ne": "__ne",
            "lt": "__lt",
            "lte": "__lte",
            "gt": "__gt",
            "gte": "__gte",
            "contains": "__icontains",
            "startswith": "__istartswith",
            "endswith": "__iendswith",
            "in": "__in",
        }

        # Handle datetime fields
        if field == "created_at":
            value = parse_date(value).astimezone(ZoneInfo("America/New_York"))
        if field in {"modified_at", "saved_at"}:
            value = parse_date(value)

        query_params[f"{prefix}{field}{mapping[operator]}"] = value

    return query_params


def parse_date(date_str: str):
    """Parses a date string into a datetime object."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}")


def sentiment_converter(str):
    """Converts sentiment string to a standardized format."""
    mapping = {
        "super_positive": "SUPER_POSITIVE",
        "super positive": "SUPER_POSITIVE",
        "positive": "POSITIVE",
        "neutral": "NEUTRAL",
        "negative": "NEGATIVE",
        "super_negative": "SUPER_NEGATIVE",
        "super negative": "SUPER_NEGATIVE",
    }
    return mapping.get(str.lower(), str.upper())
