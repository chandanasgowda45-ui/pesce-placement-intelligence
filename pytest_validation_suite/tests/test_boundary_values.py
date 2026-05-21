import pytest
from validators.financial import (
    validate_revenue, validate_valuation, validate_turnover, 
    validate_market_share, validate_ratio_mix, validate_runway,
    validate_cac, validate_burn_rate
)
from validators.temporal import validate_year, validate_recent_news, validate_future_event
from validators.structural import validate_employee_size

def test_extreme_high_values():
    # TC_7.1_012: $999,999,999,999 -> Now must be numeric 999999999999.0
    assert validate_revenue(999999999999.0) == True
    # TC_7.1_015: $10,000,000,000,000
    assert validate_valuation(10000000000000.0) == True

def test_zero_boundaries():
    # TC_7.2_010: Pre-revenue $0
    assert validate_revenue(0.0) == True
    # TC_7.2_012: Valuation $0 FAIL
    assert validate_valuation(0.0) == False
    # TC_7.2_016: CAC $0 FAIL
    assert validate_cac(0.0) == False
    # TC_7.2_021: Burn rate $0 FAIL
    assert validate_burn_rate(0.0) == False
    # TC_7.2_022: Runway 0 FAIL
    assert validate_runway(0.0) == False

def test_percentage_bounds():
    # TC_7.1_004: Turnover 150% FAIL
    assert validate_turnover("150%") == False
    # TC_7.1_017: Market Share 150% FAIL
    assert validate_market_share("150%") == False
    # TC_7.2_003: Turnover 0% PASS
    assert validate_turnover("0%") == True

def test_ratio_mix():
    # TC_7.1_014: 120/30 FAIL
    assert validate_ratio_mix("120/30") == False
    assert validate_ratio_mix("80/20") == True

def test_date_boundaries():
    # TC_DB_001: 2035 FAIL
    assert validate_year(2035) == False
    # TC_DB_002: 1750 FAIL
    assert validate_year(1750) == False
    # TC_DB_006: Future news FAIL
    assert validate_recent_news("2030-01-01 - News") == False
    # TC_DB_014: Past projection FAIL
    assert validate_future_event("2020 - Revenue Growth") == False

def test_workforce_boundaries():
    # TC_7.2_002: Size 0 FAIL
    assert validate_employee_size("0") == False
    # TC_6.2_13: Reversed range FAIL
    assert validate_employee_size("50000-10000") == False
