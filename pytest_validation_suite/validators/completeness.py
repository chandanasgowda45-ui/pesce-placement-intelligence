from .common import validate_not_null_or_empty

def validate_completeness(value):
    return validate_not_null_or_empty(value)

def validate_nullable(value):
    return True
