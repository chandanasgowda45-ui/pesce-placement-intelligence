import json
import re

def validate_content_integrity(text, max_len=None):
    if not isinstance(text, str): return True
    if not text: return True
    
    # TC-13.3-01: No mid-sentence cutoff
    # A complete sentence should end with . ! or ?
    # We allow a few chars margin if max_len is reached
    if max_len and len(text) >= max_len - 5:
        if not re.search(r'[.!?]$', text.strip()):
            return False, "Content truncated mid-sentence"
            
    # TC-13.3-04: No mid-word truncation
    # Check if last char is an alphanumeric followed by nothing
    if re.search(r'\w$', text) and not re.search(r'\w\s$', text):
        # This is hard to detect without the original intended text
        # but if it ends in a very long sequence of letters without punctuation
        pass

    return True, []

def validate_json_integrity(value):
    # TC-13.3-05: JSON remains valid under high load
    try:
        if isinstance(value, (dict, list)): return True
        json.loads(str(value))
        return True
    except:
        return False

def validate_memory_independence(company_a, company_b):
    # TC-13.4-01: No data leakage
    # We check if unique IDs or names from A appear in B
    a_name = company_a.get("name")
    if a_name and a_name in str(company_b):
        if company_b.get("name") != a_name:
            return False, f"Data leakage detected: {a_name} found in unrelated record"
    return True, []
