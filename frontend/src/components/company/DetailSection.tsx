import * as React from "react";
import { LucideIcon } from "lucide-react";
import { validateFieldKeyMetadata } from "../../agents/pipeline";
import { VALID_SUPABASE_FIELDS, validateFieldDefinitions } from "../../lib/schemaRegistry";
import { type FieldDefinition, type Company } from "../../types/company";

// Valid Supabase schema keys from Company interface (163 fields)
const loggedWarnings = new Set<string>();
const loggedInfos = new Set<string>();

function logWarningOnce(message: string) {
  if (!loggedWarnings.has(message)) {
    loggedWarnings.add(message);
    console.warn(`[WARNING] ${message}`);
  }
}


interface DetailFieldProps extends FieldDefinition {
  value: string | number | null | undefined;
}

export function DetailField({ label, value, icon: Icon, isLink }: DetailFieldProps) {
  if (!value && value !== 0) {
    return (
      <div className="space-y-1">
        <p className="data-label">{label}</p>
        <p className="text-sm text-muted-foreground/50 italic">Not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="data-label flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      {isLink && typeof value === "string" ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="data-value text-primary hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="data-value whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  icon: LucideIcon;
  fields: FieldDefinition[];
  company: Company;
}

export function DetailSection({ title, icon: Icon, fields, company }: DetailSectionProps) {
  const safeFields = React.useMemo(() => (Array.isArray(fields) ? fields : []), [fields]);

  const diagnostics = React.useMemo(() => {
    // Validate field definitions against schema
    try {
      validateFieldDefinitions(fields, `DetailSection "${title}"`);
    } catch (error) {
      // In development, throw to fail loudly; in production, log and continue
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        console.error(error);
      }
    }

    const warnings: string[] = [];
    const seenLabels = new Set<string>();

    if (!Array.isArray(fields)) {
      warnings.push(`Invalid section payload: ${title}`);
    }

    if (safeFields.length === 0) {
      warnings.push(`Empty section payload: ${title}`);
    }

    safeFields.forEach((field) => {
      const key = field.fieldKey ?? field.label;
      const val = company[field.fieldKey];

      if (seenLabels.has(key)) {
        warnings.push(`Duplicate field mapping: ${key} in ${title} section`);
      } else {
        seenLabels.add(key);
      }

      if (val === undefined) {
        warnings.push(`Undefined mapping: ${key} in ${title} section`);
      }

      if (
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        Object.keys(val as object).length === 0
      ) {
        warnings.push(`Empty object value: ${key} in ${title} section`);
      }
    });

    const fieldKeyValidation = validateFieldKeyMetadata(safeFields, VALID_SUPABASE_FIELDS);
    warnings.push(...fieldKeyValidation.warnings);

    return {
      warnings,
      missingFieldKeys: fieldKeyValidation.missingFieldKeys,
      invalidMappings: fieldKeyValidation.invalidMappings,
      duplicateMappings: fieldKeyValidation.duplicateMappings,
      unmappedLabels: fieldKeyValidation.unmappedLabels,
    };
  }, [fields, safeFields, title]);

  React.useEffect(() => {
    diagnostics.warnings.forEach((message) => logWarningOnce(message));
  }, [diagnostics]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 border-b pb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="section-heading">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {safeFields.map((field) => (
          <DetailField key={field.fieldKey} {...field} value={company[field.fieldKey]} />
        ))}
      </div>
    </div>
  );
}
