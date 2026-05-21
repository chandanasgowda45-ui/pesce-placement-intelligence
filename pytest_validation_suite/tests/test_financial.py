import pytest
from validators.financial import validate_valuation, validate_revenue, validate_burn_multiplier

def test_valuation_valid():
    assert validate_valuation(1000000000.0) == True

def test_valuation_invalid():
    assert validate_valuation(0.0) == False
    assert validate_valuation("$1B+") == False # Now must be numeric

def test_revenue_valid():
    assert validate_revenue(100000000.0) == True
    assert validate_revenue(0.0) == True

def test_burn_multiplier():
    assert validate_burn_multiplier(0.5) == True
    assert validate_burn_multiplier(1.5) == True
    assert validate_burn_multiplier("0.5") == False # Now must be numeric
