import json
import re
from .common import validate_not_null_or_empty, validate_type

def validate_json(value):
    if isinstance(value, (dict, list)): return True
    if not isinstance(value, str): return False
    try:
        parsed = json.loads(value)
        return isinstance(parsed, (dict, list))
    except: return False

def validate_employee_size(value):
    if not validate_type(value, str): return False
    val_str = value
    if val_str == "0": return False 
    
    if " to " in val_str: return False
    if not re.match(r"^\d+(-\d+)?$", val_str):
        return bool(re.match(r"^\d+$", val_str))
    
    if '-' in val_str:
        try:
            min_val, max_val = map(int, val_str.split('-'))
            return 0 < min_val < max_val 
        except: return False
    return True

def validate_office_count(value):
    return validate_type(value, int) and value >= 0

def validate_traffic_rank(value):
    return validate_type(value, int) and value > 0

def validate_structural_chronology(created_year, divested_year):
    # TC_STRUCT_12: Divested before created
    try:
        return int(created_year) <= int(divested_year)
    except: return True

def validate_hq(value):
    if not validate_type(value, str): return False
    if not validate_not_null_or_empty(value): return False
    if '@' in value: return False
    if ',' not in value: return False
    return bool(re.match(r"^[a-zA-Z0-9\s,.\-]+$", value, re.IGNORECASE))
