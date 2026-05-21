import pytest
from validators.disambiguation import validate_entity_resolution, validate_parent_subsidiary_separation

def test_delta_resolution():
    # TC_AR_11.1_01: Valid Airline
    delta_airline = {
        "name": "Delta",
        "website_url": "https://www.delta.com",
        "focus_sectors": "Airlines"
    }
    success, errors = validate_entity_resolution(delta_airline)
    assert success == True

    # TC_AR_11.1_02: Faucet vs Airline mismatch
    delta_mismatch = {
        "name": "Delta",
        "website_url": "https://www.deltafaucet.com",
        "focus_sectors": "Airlines"
    }
    success, errors = validate_entity_resolution(delta_mismatch)
    assert success == False
    assert "conflicting" in errors.lower()

def test_parent_subsidiary_leakage():
    # TC-11.2-012: Alphabet vs YouTube size
    alphabet = {"name": "Alphabet Inc", "employee_size": "150000"}
    youtube = {"name": "YouTube", "employee_size": "150000"} # LEAKED
    success, errors = validate_parent_subsidiary_separation(alphabet, youtube)
    assert success == False
