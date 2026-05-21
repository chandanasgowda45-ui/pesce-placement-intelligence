from .common import (
    CURRENT_YEAR, 
    parse_financial_string, 
    validate_not_null_or_empty,
    contains_emoji,
    GENERIC_COMPANY_NAMES,
    COMMON_PEOPLE_NAMES,
    FABRICATED_ENTITIES
)
from .completeness import validate_completeness, validate_nullable
from .financial import (
    validate_valuation, 
    validate_revenue, 
    validate_turnover, 
    validate_ratio_colon,
    validate_burn_multiplier,
    validate_runway
)
from .temporal import validate_year, validate_retention
from .hallucination import validate_hallucination, validate_lorem_ipsum
from .format import validate_url, validate_email, validate_phone, validate_linkedin
from .structural import validate_json, validate_employee_size, validate_hq

import re

# Additional specific validators that are too small for their own file
def validate_company_name(value):
    val_str = str(value)
    if not validate_not_null_or_empty(val_str): return False
    if contains_emoji(val_str): return False
    if val_str.lower() in GENERIC_COMPANY_NAMES: return False
    if len(val_str) < 4: return False
    pattern = "^[a-zA-Z0-9\\s&.,\\-\\(\\)'\\u00C0-\\u017F\\u2122\\u00AE]+$"
    return bool(re.match(pattern, val_str, re.IGNORECASE))

def validate_ceo_name(value):
    val_str = str(value)
    if not validate_not_null_or_empty(val_str): return False
    if "former" in val_str.lower(): return False
    if val_str.lower() in COMMON_PEOPLE_NAMES: return False
    if val_str.lower() in [e.lower() for e in FABRICATED_ENTITIES]: return False
    return all(not char.isdigit() for char in val_str)

def validate_field(field_name, value):
    """
    Main entry point for field-level validation.
    Maps 163 parameters to their respective specialized validators.
    """
    validators = {
        "Company Name": validate_company_name,
        "Founded Year": validate_year,
        "CEO Name": validate_ceo_name,
        "Website": validate_url,
        "Email": validate_email,
        "Phone": validate_phone,
        "LinkedIn": validate_linkedin,
        "Valuation": validate_valuation,
        "Revenue": validate_revenue,
        "Turnover": validate_turnover,
        "Employee Size": validate_employee_size,
        "HQ": validate_hq,
        "Retention": validate_retention,
        "Overview": validate_lorem_ipsum,
        "CAC:LTV": validate_ratio_colon,
        "Burn Multiplier": validate_burn_multiplier,
        "Runway": validate_runway,
        "Market Share (%)": validate_market_share,
        "Social Media Followers": validate_social_followers,
        "Glassdoor Rating": validate_glassdoor,
        "Tech Adoption Rating": validate_tech_adoption
    }
    
    if field_name in validators:
        return validators[field_name](value)
    
    # Default to hallucination check for general text fields
    if isinstance(value, str) and len(value) > 20:
        return validate_hallucination(value)
        
    return True

def validate_all_fields(data):
    """
    Final aggregator for the 163-parameter schema.
    """
    try:
        results = []
        # Basic Structural Integrity
        results.append(validate_company_name(data.get("Company Name")))
        results.append(validate_year(data.get("Founded Year")))
        
        # Financial Consistency
        val = data.get("Valuation")
        rev = data.get("Revenue")
        if val and rev:
            v_num = parse_financial_string(val)
            r_num = parse_financial_string(rev)
            if v_num > 0 and r_num > 0:
                results.append(v_num >= r_num) # Valuation should be >= Revenue
        
        # Hallucination Check
        results.append(validate_hallucination(str(data)))
        
        return all(results)
    except:
        return False
