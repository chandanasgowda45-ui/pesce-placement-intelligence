import re
from datetime import datetime
from .common import CURRENT_YEAR, validate_not_null_or_empty, validate_type

def validate_year(value):
    # TC_8.1_5: must be INTEGER
    if not validate_type(value, int): return False
    # TC_DB_001/002: Boundary 1800 to CURRENT_YEAR
    return 1800 <= value <= CURRENT_YEAR

def validate_historical_event(value):
    if not validate_type(value, str): return False
    match = re.search(r"(\d{4})", value)
    if not match: return True 
    year = int(match.group(1))
    return year <= CURRENT_YEAR

def validate_future_event(value):
    if not validate_type(value, str): return False
    match = re.search(r"(\d{4})", value)
    if not match: return True
    year = int(match.group(1))
    return year >= CURRENT_YEAR

def validate_recent_news(value):
    if not validate_type(value, str): return False
    match = re.search(r"(\d{4})", value)
    if not match: return False
    year = int(match.group(1))
    return (CURRENT_YEAR - 2) <= year <= CURRENT_YEAR

def validate_retention(value):
    # TC_8.1_15: must be string with unit
    if not validate_type(value, str): return False
    if " yrs" in value.lower(): return False
    return bool(re.match(r"^\d+(\.\d+)? (Years|Months)$", value, re.IGNORECASE))
