import pytest
from validators.completeness import validate_completeness, validate_nullable

def test_required_fields():
    # TC_PC_003: Logo NULL check
    assert validate_completeness(None) == False
    assert validate_completeness("NULL") == False
    assert validate_completeness("") == False
    assert validate_completeness("https://logo.com/img.png") == True

def test_nullable_fields():
    # TC_6.1_08: New startup but missing recent announcement data
    assert validate_nullable(None) == True
    assert validate_nullable("NULL") == True
