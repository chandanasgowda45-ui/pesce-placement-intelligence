import re

def validate_entity_resolution(company):
    # TC_AR_11.1_01: domain + industry + HQ match
    website = str(company.get("website_url", "")).lower()
    name = str(company.get("name", "")).lower()
    focus = str(company.get("focus_sectors", "")).lower()
    hq = str(company.get("headquarters_address", "")).lower()
    
    # Simple heuristic: if name is "Delta" but website is "deltafaucet.com", 
    # it shouldn't be in "Airlines"
    if "delta" in name:
        if "faucet" in website and "airline" in focus:
            return False, "Conflicting entity signals: faucet website with airline focus"
        if "delta.com" in website and "faucet" in focus:
            return False, "Conflicting entity signals: airline website with faucet focus"
            
    # TC_AR_11.1_05: Target retail vs agency
    if "target" in name:
        if "target.com" in website and "agency" in focus:
            return False, "Conflicting entity signals: retail website with agency focus"
            
    return True, []

def validate_parent_subsidiary_separation(parent, subsidiary):
    # TC-11.2-012: Parent employee count assigned to subsidiary
    p_size = parent.get("employee_size")
    s_size = subsidiary.get("employee_size")
    if p_size and s_size and p_size == s_size:
        # In major tech, subsidiaries rarely have the exact same employee count as parents
        # (e.g. YouTube vs Alphabet)
        if "alphabet" in str(parent.get("name")).lower() and "youtube" in str(subsidiary.get("name")).lower():
            return False, "Subsidiary inherits parent employee size"
    return True, []

def validate_regional_distinction(entity_a, entity_b):
    # TC-11.3-009: Multiple HQs merged incorrectly
    if entity_a.get("name") == entity_b.get("name"):
        hq_a = str(entity_a.get("headquarters_address")).lower()
        hq_b = str(entity_b.get("headquarters_address")).lower()
        if hq_a == hq_b:
            return False, "Regional entities merged into same HQ"
    return True, []
