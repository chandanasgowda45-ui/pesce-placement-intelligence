from pytest_validation_suite.validators.field_validators import validate_field

res = validate_field("Company Name", "Microsft Pvt Ltd")
print(f"Result for 'Microsft Pvt Ltd': {res}")

res2 = validate_field("Short Name", "My#Company!")
print(f"Result for 'My#Company!': {res2}")
