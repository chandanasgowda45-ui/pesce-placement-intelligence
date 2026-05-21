import re
val_str = "$1B+"
pattern = r"^\$?\d+(\.\d+)?[BMKT]?\+?$"
print(f"Testing '{val_str}' with '{pattern}'")
print(f"Result: {bool(re.match(pattern, val_str, re.IGNORECASE))}")

val_str2 = "100M"
print(f"Testing '{val_str2}' with '{pattern}'")
print(f"Result: {bool(re.match(pattern, val_str2, re.IGNORECASE))}")
