import pytest
from validators.format import (
    validate_email, validate_url, validate_short_name, 
    validate_overview, validate_countries, validate_linkedin
)
from validators.financial import validate_revenue, validate_social_followers
from validators.temporal import validate_year
from validators.structural import validate_office_count

def test_data_type_validation():
    # TC_8.1_1: Company Name (not string) - handled by dispatcher or type check
    # TC_8.1_5: Year must be INTEGER
    assert validate_year("2020") == False
    assert validate_year(2020) == True
    
    # TC_8.1_10: Number of Offices must be INTEGER
    assert validate_office_count("10") == False
    assert validate_office_count(10) == True
    
    # TC_8.1_36: Followers must be INTEGER
    assert validate_social_followers("5000") == False
    assert validate_social_followers(5000) == True
    
    # TC_8.1_60: Revenue must be numeric
    assert validate_revenue("1M") == False
    assert validate_revenue(1000000.0) == True

def test_url_validity():
    # TC_URL_01: Regex
    assert validate_url("https://example.com") == True
    assert validate_url("12345") == False
    
    # TC_URL_08: LinkedIn /company/
    assert validate_linkedin("https://linkedin.com/company/openai", is_company=True) == True
    assert validate_linkedin("https://linkedin.com/in/satya", is_company=True) == False

def test_list_formatting():
    # TC_LIST_01/02: Delimiters
    assert validate_countries("India, USA, Germany") == True
    assert validate_countries("India; USA; Germany") == False
    
    # TC_LIST_03: Trailing comma
    assert validate_countries("India, USA,") == False

def test_text_length():
    # TC_LEN_01/02/03: Short Name 2-100
    assert validate_short_name("A") == False
    assert validate_short_name("OpenAI") == True
    assert validate_short_name("A" * 101) == False
    
    # TC_LEN_07: Too short overview
    assert validate_overview("AI company") == False
    assert validate_overview("A detailed technical overview of the company operations and mission." * 2) == True
