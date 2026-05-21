import re
from datetime import datetime

CURRENT_YEAR = datetime.now().year

# Lists of restricted/generic terms
GENERIC_COMPANY_NAMES = ["delta", "mercury", "alpha", "omega", "global", "amazon"]
GENERIC_CATEGORIES = ["investor", "business"]
COMMON_PEOPLE_NAMES = ["john doe", "jane doe"]
FABRICATED_ENTITIES = ["quantumsoftx", "cyberdyne systems", "stark industries", "umbella corp"]
FABRICATED_AWARDS = ["global unicorn award 2099", "universal excellence prize"]

def validate_not_null_or_empty(value):
    if value is None: return False
    if str(value).upper() == "NULL": return False
    if str(value).strip() == "": return False
    return True

def validate_type(value, expected_type):
    if expected_type == int:
        return isinstance(value, int)
    if expected_type == float:
        return isinstance(value, (int, float))
    if expected_type == str:
        return isinstance(value, str)
    if expected_type == bool:
        return isinstance(value, bool)
    return False

def parse_financial_string(value):
    if value is None: return 0
    val_str = str(value).replace('$', '').replace(',', '').upper().strip()
    multiplier = 1
    if val_str.endswith('B'):
        multiplier = 1_000_000_000
        val_str = val_str[:-1]
    elif val_str.endswith('M'):
        multiplier = 1_000_000
        val_str = val_str[:-1]
    elif val_str.endswith('K'):
        multiplier = 1_000
        val_str = val_str[:-1]
    elif val_str.endswith('T'):
        multiplier = 1_000_000_000_000
        val_str = val_str[:-1]
    
    val_str = val_str.replace('+', '')
    try:
        return float(val_str) * multiplier
    except:
        return 0

def validate_list_format(value, delimiter=',', expected_count=None):
    if not isinstance(value, str): return False
    if delimiter == ',' and ';' in value: return False # TC_LIST_02
    if ',,' in value: return False # TC_LIST_11
    if value.strip().endswith(delimiter): return False # TC_LIST_03
    
    items = [i.strip() for i in value.split(delimiter)]
    if any(i == "" for i in items): return False # TC_LIST_17
    
    if expected_count and len(items) != expected_count:
        return False
    return True
