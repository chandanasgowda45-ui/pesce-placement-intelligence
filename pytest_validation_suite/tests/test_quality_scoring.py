import pytest
from datetime import datetime, timedelta
from validators.scoring import calculate_quality_score, validate_confidence_tagging

def test_quality_grading():
    # TC_15.5_010: Grade A Case
    today = datetime.now().strftime("%Y-%m-%d")
    company_a = {
        "name": "Apple Inc",
        "source": "SEC Filing",
        "last_updated_date": today,
        "industry": "Tech",
        "ceo_name": "Tim Cook"
    }
    mandatory = ["name", "industry", "ceo_name"]
    result = calculate_quality_score(company_a, mandatory)
    assert result["grade"] == "A"
    assert result["composite_score"] >= 90

    # Grade F Case (Missing name)
    company_f = {
        "source": "SEC Filing"
    }
    result = calculate_quality_score(company_f, mandatory)
    assert result["grade"] == "F"

def test_confidence_alignment():
    # TC_015_102: SEC Filing + High confidence
    company = {"source": "SEC Filing", "confidence_level": "High"}
    success, msg = validate_confidence_tagging(company)
    assert success == True

    # TC_015_104: Blog + High confidence (Invalid)
    company_bad = {"source": "Blog", "confidence_level": "High"}
    success, msg = validate_confidence_tagging(company_bad)
    assert success == False

def test_recency_scoring():
    # TC_015_303: Outdated data (>12 months)
    old_date = (datetime.now() - timedelta(days=400)).strftime("%Y-%m-%d")
    company = {
        "name": "OldCo",
        "last_updated_date": old_date,
        "source": "Official Website"
    }
    result = calculate_quality_score(company, ["name"])
    assert result["metrics"]["recency"] == 0
