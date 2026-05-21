import Ajv, { ValidateFunction } from "ajv";
import companyShortSchema from "../../schema/company_short.schema.json";
import companyFullSchema from "../../schema/company_full.schema.json";
import innovxSchema from "../../schema/innovx_json.schema.json";
import jobRoleDetailsSchema from "../../schema/job_role_details_json.schema.json";
import hiringRoundsSchema from "../../schema/hiring_rounds_json.schema.json";

const ajv = new Ajv({ allErrors: true, removeAdditional: false, coerceTypes: true, strict: false });

const companyShortValidator = ajv.compile(companyShortSchema) as ValidateFunction;
const companyFullValidator = ajv.compile(companyFullSchema) as ValidateFunction;
const innovxValidator = ajv.compile(innovxSchema) as ValidateFunction;
const jobRoleDetailsValidator = ajv.compile(jobRoleDetailsSchema) as ValidateFunction;
const hiringRoundsValidator = ajv.compile(hiringRoundsSchema) as ValidateFunction;

export interface JsonValidationResult<T = unknown> {
  valid: boolean;
  data: T | null;
  errors: string[];
}

function validateJson<T>(validator: ValidateFunction, data: unknown, schemaName: string): JsonValidationResult<T> {
  const normalized = data ?? {};
  const copy = JSON.parse(JSON.stringify(normalized));
  const valid = validator(copy);
  const errors = validator.errors?.map((error) => {
    const instancePath = error.instancePath || error.schemaPath || "";
    return `${instancePath} ${error.message || "invalid value"}`.trim();
  }) ?? [];

  if (!valid && errors.length === 0) {
    errors.push(`Validation failed for ${schemaName}`);
  }

  return {
    valid: Boolean(valid),
    data: valid ? (copy as T) : null,
    errors,
  };
}

export function parseCompanyShortJson<T = unknown>(data: unknown): T {
  const result = validateJson<T>(companyShortValidator, data, "company_short");
  return result.data as T;
}

export function parseCompanyFullJson<T = unknown>(data: unknown): T {
  const result = validateJson<T>(companyFullValidator, data, "company_full");
  return result.data as T;
}

export function parseInnovxJson<T = unknown>(data: unknown): T {
  const result = validateJson<T>(innovxValidator, data, "innovx_json");
  return result.data as T;
}

export function parseJobRoleDetailsJson<T = unknown>(data: unknown): T {
  const result = validateJson<T>(jobRoleDetailsValidator, data, "job_role_details_json");
  return result.data as T;
}

export function parseHiringRoundsJson<T = unknown>(data: unknown): T {
  const result = validateJson<T>(hiringRoundsValidator, data, "hiring_rounds_json");
  return result.data as T;
}

export function validateCompanyShortJson<T = unknown>(data: unknown): JsonValidationResult<T> {
  return validateJson<T>(companyShortValidator, data, "company_short");
}

export function validateCompanyFullJson<T = unknown>(data: unknown): JsonValidationResult<T> {
  return validateJson<T>(companyFullValidator, data, "company_full");
}

export function validateInnovxJson<T = unknown>(data: unknown): JsonValidationResult<T> {
  return validateJson<T>(innovxValidator, data, "innovx_json");
}

export function validateJobRoleDetailsJson<T = unknown>(data: unknown): JsonValidationResult<T> {
  return validateJson<T>(jobRoleDetailsValidator, data, "job_role_details_json");
}

export function validateHiringRoundsJson<T = unknown>(data: unknown): JsonValidationResult<T> {
  return validateJson<T>(hiringRoundsValidator, data, "hiring_rounds_json");
}
