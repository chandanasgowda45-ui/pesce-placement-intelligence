def validate_null_dependencies(company):
    errors = []
    
    # 1. Null Propagation (TC_014_501)
    # If Revenue is null, YoY Growth must be null
    if company.get("annual_revenue") is None:
        if company.get("growth_rate") is not None:
            errors.append("YoY Growth present despite missing base Revenue")
            
    # 2. Ratio Dependencies (TC_014_502)
    if company.get("cac") is None or company.get("clv") is None:
        if company.get("cac_ltv_ratio") is not None:
            errors.append("CAC:LTV Ratio present despite missing CAC or CLV")

    # 3. Valuation Dependencies (TC_014_008/011)
    valuation = company.get("valuation")
    if valuation:
        if company.get("annual_revenue") is None:
            errors.append("Revenue expected when Valuation exists")
        if company.get("funding_rounds") is None:
            errors.append("Funding rounds expected when Valuation exists")

    # 4. Nature-based Exclusions (TC_014_001)
    category = company.get("category")
    if category == "VC":
        products = company.get("products_services")
        if products and str(products).upper() != "N/A":
             errors.append("Products/Services should not exist or be N/A for VC firms")

    # 5. Public Company Leadership (TC_014_001)
    nature = company.get("nature_of_company")
    if nature == "Public":
        if not company.get("ceo_name"):
            errors.append("CEO Name is mandatory for public companies")

    return len(errors) == 0, errors

def validate_placeholder_semantic(value, field_name):
    # TC_014_010: Distinguish Unknown vs Not Public
    val_str = str(value).upper()
    if val_str == "UNKNOWN":
        return False, f"{field_name} uses ambiguous 'Unknown'; specify 'Not Public' or 'Vacant'"
    return True, []
