import re
from .common import validate_type

# Taxonomy definitions
VALID_CATEGORIES = ["Startup", "MSME", "SMB", "Enterprise", "Investor", "VC", "Conglomerate"]
VALID_NATURES = ["Private", "Public", "Subsidiary", "Govt", "Non-Profit"]
VALID_SENTIMENTS = ["Positive", "Neutral", "Negative"]
VALID_RISK_LEVELS = ["High", "Medium", "Low"]

def validate_category(value):
    # TC_12.1_01-05: Exact enum match
    return value in VALID_CATEGORIES

def validate_nature(value):
    # TC_12.3_01-03: Private/Public/Subsidiary
    return value in VALID_NATURES

def validate_sentiment_label(value):
    # TC_12.4-01: Positive/Neutral/Negative
    return value in VALID_SENTIMENTS

def validate_risk_level(value):
    return value in VALID_RISK_LEVELS

def validate_nps(value):
    # TC_12.4-14: -100 to 100
    if not validate_type(value, (int, float)): return False
    return -100 <= value <= 100

def validate_glassdoor_range(value):
    # TC_12.4-08: 1.0 to 5.0
    if not validate_type(value, float): return False
    return 1.0 <= value <= 5.0

def validate_classification_consistency(company):
    errors = []
    category = company.get("category")
    size_str = str(company.get("employee_size", ""))
    
    # TC_12.1_09: Large size but Startup
    if category == "Startup":
        if '-' in size_str:
            max_size = int(size_str.split('-')[-1])
            if max_size > 500:
                errors.append("Large employee size ( > 500) inconsistent with Startup category")
        elif size_str.isdigit() and int(size_str) > 500:
            errors.append("Large employee size ( > 500) inconsistent with Startup category")

    # TC_12.4_19: Glassdoor vs Sentiment
    glassdoor = company.get("glassdoor_rating")
    sentiment = company.get("brand_sentiment")
    if glassdoor and sentiment:
        if float(glassdoor) >= 4.0 and sentiment == "Negative":
            errors.append("High Glassdoor rating contradicts Negative brand sentiment")
        if float(glassdoor) <= 2.0 and sentiment == "Positive":
            errors.append("Low Glassdoor rating contradicts Positive brand sentiment")

    return len(errors) == 0, errors
