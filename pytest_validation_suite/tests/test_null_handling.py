import pytest
from validators.null_handling import validate_null_dependencies

def test_null_propagation():
    # TC_014_501: Revenue null -> YoY null
    company = {
        "annual_revenue": None,
        "growth_rate": "10%"
    }
    success, errors = validate_null_dependencies(company)
    assert success == False
    assert "Growth" in errors[0]

def test_valuation_consistency():
    # TC_014_008: Valuation exists -> Revenue expected
    company = {
        "valuation": "$5B",
        "annual_revenue": None
    }
    success, errors = validate_null_dependencies(company)
    assert success == False
    assert "Revenue expected" in errors[0]

def test_vc_exclusion():
    # TC_014_002 (Nature): VC incorrectly having products
    company = {
        "category": "VC",
        "products_services": "SaaS Platform"
    }
    success, errors = validate_null_dependencies(company)
    assert success == False

def test_public_leadership():
    # TC_014_001 (Null): Public company missing CEO
    company = {
        "nature_of_company": "Public",
        "ceo_name": None
    }
    success, errors = validate_null_dependencies(company)
    assert success == False
