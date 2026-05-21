from .common import validate_type, validate_not_null_or_empty

PLACEHOLDERS = ["N/A", "UNKNOWN", "NONE", "PLACEHOLDER", "TBD", "0"]

def validate_field_quality(field_name, value, is_mandatory=False):
    # TC_14.4_003: Mandatory fields must not have placeholders
    val_str = str(value).upper().strip()
    
    if is_mandatory:
        if val_str in PLACEHOLDERS or val_str == "":
            return False, f"Mandatory field '{field_name}' contains invalid placeholder: {value}"
            
    # TC_14.4_004: URL placeholders
    if field_name.endswith("URL") and val_str in PLACEHOLDERS:
        return False, f"URL field '{field_name}' cannot be a placeholder"

    # TC_14.4_001: Financials should not be "0" arbitrarily
    if field_name in ["Annual Revenues", "Employee Size", "Website Traffic Rank"]:
        if val_str == "0":
            return False, f"Critical field '{field_name}' cannot be '0' by default"

    return True, []

def validate_record_quality(company, mandatory_fields):
    errors = []
    for field in mandatory_fields:
        success, msg = validate_field_quality(field, company.get(field), is_mandatory=True)
        if not success:
            errors.append(msg)
    return len(errors) == 0, errors
