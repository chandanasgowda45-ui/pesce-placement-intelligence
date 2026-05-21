import re
from .common import parse_financial_string, validate_not_null_or_empty, validate_type

def validate_numeric_metric(value, allow_zero=True):
    # TC_8.1_60/61: Must be numeric (INTEGER/DECIMAL)
    if not validate_type(value, float): return False
    if not allow_zero and value == 0: return False
    return value >= 0

def validate_valuation(value):
    return validate_numeric_metric(value, allow_zero=False)

def validate_revenue(value):
    return validate_numeric_metric(value, allow_zero=True)

def validate_profit(value):
    if not validate_type(value, float): return False
    return True

def validate_social_followers(value):
    return validate_type(value, int) and value >= 0

def validate_rating(value, min_val=0, max_val=10):
    if not validate_type(value, float): return False
    return min_val <= value <= max_val

def validate_percentage_string(value, allow_above_100=False):
    if not validate_type(value, str): return False
    if not value.endswith('%'): return False
    val_str = value.replace('%', '').strip()
    try:
        num = float(val_str)
        if not allow_above_100 and num > 100: return False
        if num < 0: return False
        return True
    except: return False

def validate_turnover(value):
    return validate_percentage_string(value, allow_above_100=False)

def validate_market_share(value):
    return validate_percentage_string(value, allow_above_100=False)

def validate_growth_rate(value):
    return validate_percentage_string(value, allow_above_100=True)

def validate_ratio_mix(value):
    if not validate_type(value, str): return False
    if '/' not in value: return False
    try:
        parts = map(float, value.split('/'))
        return sum(parts) == 100
    except: return False

def validate_ratio_colon(value):
    if not validate_type(value, str): return False
    if not bool(re.match(r"^\d+(\.\d+)?:\d+(\.\d+)?$", value)): return False
    try:
        num, den = map(float, value.split(':'))
        if den == 0 or num == 0: return False
        return True
    except: return False

def validate_cac(value):
    return validate_numeric_metric(value, allow_zero=False)

def validate_burn_rate(value):
    return validate_numeric_metric(value, allow_zero=False)

def validate_burn_multiplier(value):
    return validate_numeric_metric(value, allow_zero=True)

def validate_runway(value):
    return validate_numeric_metric(value, allow_zero=False)

def validate_tech_adoption(value):
    return validate_rating(value, 1, 10)

def validate_glassdoor(value):
    return validate_rating(value, 1, 5)
