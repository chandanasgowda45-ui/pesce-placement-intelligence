import pytest
import csv
import os
from rules.validation_rules import get_validation_rule

def load_test_cases():
    cases = []
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'test_cases.csv')
    # Specify UTF-8 encoding to handle accented characters correctly
    with open(csv_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            cases.append((row['field'], row['input'], row['expected'], row['test_id'], row['description']))
    return cases

@pytest.mark.parametrize("field, input_value, expected, test_id, description", load_test_cases())
def test_company_field_validation(field, input_value, expected, test_id, description):
    """
    Validates company fields based on the golden dataset.
    Test ID: {test_id}
    Description: {description}
    """
    validator = get_validation_rule(field)
    is_valid = validator(input_value)
    
    actual_result = "pass" if is_valid else "fail"
    
    assert actual_result == expected, (
        f"[{test_id}] Validation failed for {field}.\n"
        f"Input: '{input_value}'\n"
        f"Expected: {expected}, Got: {actual_result}\n"
        f"Rule: {description}"
    )
