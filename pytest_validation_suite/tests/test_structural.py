import pytest
from validators.structural import validate_employee_size, validate_hq

def test_employee_size_valid():
    assert validate_employee_size("1-5") == True
    assert validate_employee_size("10000-50000") == True
    assert validate_employee_size("100") == True

def test_employee_size_invalid():
    # TC_6.1_12: "Few"
    assert validate_employee_size("Few") == False
    # TC_6.2_13: Reversed range
    assert validate_employee_size("50000-10000") == False

def test_hq_format():
    # TC_6.2_07: New York, USA
    assert validate_hq("New York, USA") == True
    # TC_PC_011: Bangalore (missing country)
    assert validate_hq("Bangalore") == False
