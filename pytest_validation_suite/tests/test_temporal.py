import pytest
from validators.temporal import validate_year, validate_retention

def test_year_valid():
    assert validate_year(2023) == True
    assert validate_year(1800) == True

def test_year_invalid():
    assert validate_year("2023") == False
    assert validate_year(2099) == False
    assert validate_year(1799) == False

def test_retention():
    assert validate_retention("2.5 Years") == True
    assert validate_retention("6 Months") == True
    assert validate_retention("2 yrs") == False
