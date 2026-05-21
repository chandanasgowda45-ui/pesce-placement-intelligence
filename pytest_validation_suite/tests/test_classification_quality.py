import pytest
from validators.classification import validate_category, validate_classification_consistency
from validators.quality import validate_field_quality

def test_category_classification():
    # TC_12.1_01: Valid
    assert validate_category("Startup") == True
    # TC_12.1_06: Invalid
    assert validate_category("SmallBiz") == False

def test_classification_mismatch():
    # TC_12.1_09: Large size + Startup
    company = {
        "category": "Startup",
        "employee_size": "1000"
    }
    success, errors = validate_classification_consistency(company)
    assert success == False
    assert "inconsistent" in errors[0]

def test_sentiment_consistency():
    # TC_12.4_19: High rating + Negative sentiment
    company = {
        "glassdoor_rating": 4.5,
        "brand_sentiment": "Negative"
    }
    success, errors = validate_classification_consistency(company)
    assert success == False

def test_placeholder_defaults():
    # TC_14.4_003: Mandatory N/A
    success, msg = validate_field_quality("Company Name", "N/A", is_mandatory=True)
    assert success == False
    
    # TC_14.4_001: Revenue 0
    success, msg = validate_field_quality("Annual Revenues", 0, is_mandatory=True)
    assert success == False
