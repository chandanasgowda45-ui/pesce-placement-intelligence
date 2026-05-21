import pytest
from validators.consistency import validate_cross_field_consistency, validate_entity_isolation

def test_layoff_propagation():
    # TC_AP_10.5_01: Crisis not propagated
    company = {
        "recent_news": "2025-02-10 - Massive Layoffs",
        "layoff_history": None
    }
    success, errors = validate_cross_field_consistency(company)
    assert success == False
    assert "layoff" in errors[0]

def test_cybersecurity_contradiction():
    # TC_AP_10.5_02: Breach vs Strong posture
    company = {
        "recent_news": "2024-11-01 - Data Breach Incident",
        "cybersecurity_posture": "Strong, No Issues"
    }
    success, errors = validate_cross_field_consistency(company)
    assert success == False
    assert "breach" in errors[0]

def test_entity_isolation():
    # TC_CTX_02: CEO leakage
    apple_inc = {"name": "Apple Inc.", "ceo_name": "Tim Cook"}
    apple_bank = {"name": "Apple Bank", "ceo_name": "Tim Cook"} # LEAKED!
    assert validate_entity_isolation(apple_inc, apple_bank) == False

def test_location_consistency():
    company = {
        "headquarters_address": "New York, USA",
        "operating_countries": "India, UK" # Missing USA!
    }
    success, errors = validate_cross_field_consistency(company)
    assert success == False
