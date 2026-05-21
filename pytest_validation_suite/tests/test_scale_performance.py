import pytest
from validators.integrity import validate_content_integrity, validate_json_integrity, validate_memory_independence

def test_sentence_truncation():
    # TC-13.3-01: Valid complete sentence
    text = "The company is a market leader in AI technology."
    success, msg = validate_content_integrity(text, max_len=100)
    assert success == True
    
    # Mid-sentence cutoff at max_len
    text_cut = "The company is a market leader in AI techn"
    success, msg = validate_content_integrity(text_cut, max_len=42)
    assert success == False
    assert "truncated" in msg

def test_json_integrity():
    # TC-13.3-05: Valid
    valid_json = '{"CEO": "John", "Offices": ["NY", "SF"]}'
    assert validate_json_integrity(valid_json) == True
    
    # Broken JSON (truncated)
    broken_json = '{"CEO": "John", "Offices": ["NY"'
    assert validate_json_integrity(broken_json) == False

def test_memory_independence():
    # TC-13.4-01: Data leakage
    company_a = {"name": "Apple Inc", "ceo": "Tim Cook"}
    company_b = {"name": "Delta Airlines", "overview": "Airlines competing with Apple Inc"} # LEAKED
    success, msg = validate_memory_independence(company_a, company_b)
    assert success == False
    assert "leakage" in msg
