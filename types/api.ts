/**
 * The Zod flatten() format from your backend:
 * {
 *   fieldErrors: { email?: string[], password?: string[], ... },
 *   formErrors: string[]
 * }
 */
export interface ZodFlattenIssues {
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
}

/**
 * Standard API error shape for all endpoints.
 * - message: always present
 * - issues: optional Zod flatten() result, for per-field error mapping
 */
export interface ApiErrorResponse {
  message: string;
  issues?: ZodFlattenIssues;
}

/**
 * Type guard to check if an unknown value matches ApiErrorResponse.
 */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;
  if (typeof obj.message !== "string") return false;

  if (obj.issues !== undefined) {
    const issues = obj.issues as ZodFlattenIssues;
    if (
      !issues ||
      typeof issues !== "object" ||
      typeof issues.fieldErrors !== "object" ||
      !Array.isArray(issues.formErrors)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Convenience mapper to flatten all form + field errors into a string[] list.
 */
export function mapIssuesToMessages(issues?: ZodFlattenIssues): string[] {
  if (!issues) return [];
  const fieldMessages = Object.values(issues.fieldErrors || {}).flat().filter(Boolean) as string[];
  return [...fieldMessages, ...(issues.formErrors || [])];
}
