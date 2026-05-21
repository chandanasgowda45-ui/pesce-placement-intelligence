from datetime import datetime
from .common import CURRENT_YEAR

SOURCE_TIERS = {
    "SEC Filing": 1,
    "Official Website": 1,
    "Crunchbase": 2,
    "LinkedIn": 2,
    "Press Release": 2,
    "News Article": 3,
    "Blog Post": 3,
    "Blog": 3
}

def calculate_quality_score(company, mandatory_fields):
    # 1. Completeness Score
    filled_mandatory = sum(1 for f in mandatory_fields if company.get(f) is not None)
    completeness = (filled_mandatory / len(mandatory_fields)) * 100
    
    # 2. Recency Score (TC_015_301-303)
    recency = 0
    date_str = company.get("last_updated_date")
    if date_str:
        try:
            update_date = datetime.strptime(date_str, "%Y-%m-%d")
            months_old = (datetime.now() - update_date).days // 30
            if months_old < 6: recency = 100
            elif months_old < 12: recency = 75
            else: recency = 0
        except: recency = 0
    
    # 3. Source Tier Score (TC_015_201-203)
    source = company.get("source")
    source_score = 0
    if source in SOURCE_TIERS:
        tier = SOURCE_TIERS[source]
        if tier == 1: source_score = 100
        elif tier == 2: source_score = 75
        elif tier == 3: source_score = 50
    
    # 4. Composite Score
    # Weighted: Completeness (40%), Source (30%), Recency (30%)
    composite = (completeness * 0.4) + (source_score * 0.3) + (recency * 0.3)
    
    # 5. Grade Assignment (TC_15.5_010)
    grade = "F"
    if composite >= 90: grade = "A"
    elif composite >= 80: grade = "B"
    elif composite >= 70: grade = "C"
    elif composite >= 60: grade = "D"
    
    # TC_15.5_006: Critical field compliance
    # If Company Name is missing, fail immediately
    if not company.get("name"):
        grade = "F"
        composite = 0

    return {
        "composite_score": composite,
        "grade": grade,
        "metrics": {
            "completeness": completeness,
            "recency": recency,
            "source_tier": source_score
        }
    }

def validate_confidence_tagging(company):
    # TC_015_101: Estimated data without label
    source = company.get("source")
    confidence = company.get("confidence_level")
    
    if not confidence:
        return False, "Missing confidence_level tagging"
        
    if source in ["SEC Filing", "Official Website"]:
        # Tier 1 should justify High confidence (TC_015_102)
        if confidence != "High":
            return False, "Tier 1 source should have High confidence"
            
    if source in ["Blog", "News Article"]:
        # Tier 3 should have Low/Medium confidence
        if confidence == "High":
            return False, "Tier 3 source cannot have High confidence"
            
    return True, []
