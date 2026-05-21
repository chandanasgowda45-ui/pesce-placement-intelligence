from validators.field_validators import validate_field

def get_validation_rule(field_name):
    """
    Returns the validation logic for a given field.
    """
    return lambda value: validate_field(field_name, value)
