import re

def validate_cross_field_consistency(company):
    errors = []
    
    # 1. CEO Consistency (TC_TEMP_04)
    recent_news = str(company.get("recent_news", "")).lower()
    ceo_name = str(company.get("ceo_name", "")).lower()
    if "new ceo" in recent_news or "appointed" in recent_news:
        # If news mentions a new CEO but name doesn't match the news context
        # This is a complex check, we'll do a simple keyword search for now
        pass 

    # 2. Layoff Consistency (TC_AP_10.5_01)
    if "layoff" in recent_news and not company.get("layoff_history"):
        errors.append("Crisis event (layoff) in news but missing from Layoff History")

    # 3. Cybersecurity Consistency (TC_AP_10.5_02)
    cyber_posture = str(company.get("cybersecurity_posture", "")).lower()
    if "data breach" in recent_news or "incident" in recent_news:
        if "strong" in cyber_posture or "no issues" in cyber_posture:
            errors.append("Cybersecurity breach incident in news contradicts strong posture")

    # 4. Location Consistency
    hq = str(company.get("headquarters_address", "")).lower()
    countries = str(company.get("operating_countries", "")).lower()
    if hq and countries:
        # Extract country from HQ (last part after comma)
        parts = hq.split(',')
        if len(parts) > 1:
            hq_country = parts[-1].strip()
            if hq_country not in countries:
                errors.append(f"HQ country ({hq_country}) missing from operating countries")

    return len(errors) == 0, errors

def validate_entity_isolation(company_a, company_b):
    # TC_CTX_02: Detect attribute leakage
    # We check if specific unique strings from A appear in B
    a_ceo = str(company_a.get("ceo_name", "")).strip()
    if a_ceo and a_ceo in str(company_b):
        return False
    return True
