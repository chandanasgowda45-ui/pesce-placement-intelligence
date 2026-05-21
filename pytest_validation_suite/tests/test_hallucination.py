import pytest
from validators.hallucination import validate_hallucination, validate_lorem_ipsum

def test_hallucination_detected():
    assert validate_hallucination("This is a quantumsoftx project") == False
    assert validate_hallucination("Received the global unicorn award 2099") == False
    assert validate_hallucination("Normal company description") == True

def test_lorem_ipsum_detected():
    assert validate_lorem_ipsum("Lorem ipsum dolor sit amet") == False
    assert validate_lorem_ipsum("A detailed technical overview") == True

def test_stealth_mode_placeholder():
    # TC_6.1_03: Stealth startup with insufficient public info
    assert validate_hallucination("Coming soon") == False # If we consider "Coming soon" a hallucination/placeholder
    assert validate_hallucination("(fabricated)") == False
