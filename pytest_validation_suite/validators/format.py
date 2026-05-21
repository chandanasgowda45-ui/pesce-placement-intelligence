import re
from .common import validate_type, validate_not_null_or_empty, validate_list_format

def validate_email(value):
    if not validate_type(value, str): return False
    # TC_8.1_53: violates email regex
    return bool(re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", value))

def validate_url(value):
    if not validate_type(value, str): return False
    # TC_URL_01: regex match
    return bool(re.match(r"^https?://[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(/.*)?$", value))

def validate_linkedin(value, is_company=True):
    if not validate_url(value): return False
    if "linkedin.com" not in value.lower(): return False
    # TC_URL_08: must contain /company/
    if is_company and "/company/" not in value.lower(): return False
    if not is_company and "/in/" not in value.lower(): return False
    return True

def validate_phone(value):
    if not validate_type(value, str): return False
    return bool(re.match(r"^\+?[\d\s\-()]{7,20}$", value))

def validate_length(value, min_len, max_len):
    if not validate_type(value, str): return False
    length = len(value)
    return min_len <= length <= max_len

def validate_short_name(value):
    # TC_LEN_01/02/03: 2-100 chars
    return validate_length(value, 2, 100)

def validate_overview(value):
    # TC_LEN_06/07/08: 50-5000 chars
    return validate_length(value, 50, 5000)

def validate_value_prop(value):
    # TC_LEN_09/10: 20-2000 chars
    return validate_length(value, 20, 2000)

def validate_countries(value):
    # TC_LIST_01: comma-separated
    return validate_list_format(value, delimiter=',')

def validate_competitors(value):
    # TC_LIST_10: valid competitor list
    return validate_list_format(value, delimiter=',')
