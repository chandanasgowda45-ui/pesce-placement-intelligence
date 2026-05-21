from .common import FABRICATED_ENTITIES, FABRICATED_AWARDS, validate_not_null_or_empty

def validate_hallucination(value):
    val_str = str(value).lower()
    if not validate_not_null_or_empty(val_str): return True
    
    for fake in FABRICATED_ENTITIES:
        if fake.lower() in val_str:
            return False
            
    for fake_award in FABRICATED_AWARDS:
        if fake_award.lower() in val_str:
            return False
            
    if "(fabricated)" in val_str:
        return False
        
    # TC_6.1_04: Recently announced startup with placeholder description
    if val_str.strip() == "coming soon":
        return False
        
    return True

def validate_overview(value):
    val_str = str(value).lower()
    # TC_6.1_03: Stealth startup with insufficient public info (below min length)
    if len(val_str) < 50:
        return False
    return "lorem ipsum" not in val_str

def validate_lorem_ipsum(value):
    return "lorem ipsum" not in str(value).lower()
