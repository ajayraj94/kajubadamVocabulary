/**
 * Input Validation & Sanitization Utility
 * ────────────────────────────────────────
 * Provides helper functions to validate and sanitize user inputs
 * across all API routes.
 *
 * Usage:
 *   import { sanitizeString, validateRequired } from "@/lib/input-validator";
 *   const name = sanitizeString(inputName);
 *   const error = validateRequired(email, "Email");
 */

/**
 * Sanitize a string input: trim, remove excess whitespace, null bytes.
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(/\0/g, "")               // Remove null bytes
    .replace(/\s+/g, " ")             // Collapse multiple spaces
    .slice(0, maxLength);             // Truncate to max length
}

/**
 * Sanitize an email input: lowercase, trim, remove dangerous chars.
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    .toLowerCase()
    .trim()
    .replace(/\0/g, "")               // Remove null bytes
    .replace(/[<>()\[\]\\,;:\"\']/g, "") // Remove potentially dangerous chars
    .slice(0, 254);                   // Max email length per RFC
}

/**
 * Validate that a required field exists and is non-empty.
 * Returns an error message or null.
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return `${fieldName} cannot be empty`;
  }
  return null;
}

/**
 * Validate that a value is one of the allowed values.
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string
): string | null {
  if (!value) return `${fieldName} is required`;
  if (!allowedValues.includes(value as T)) {
    return `Invalid ${fieldName}. Allowed: ${allowedValues.join(", ")}`;
  }
  return null;
}

/**
 * Validate a Razorpay payment ID format (pay_...).
 */
export function isValidPaymentId(id: string): boolean {
  return /^pay_[a-zA-Z0-9]{16,24}$/.test(id);
}

/**
 * Validate a Razorpay order ID format (order_...).
 */
export function isValidOrderId(id: string): boolean {
  return /^order_[a-zA-Z0-9]{16,24}$/.test(id);
}

/**
 * Validate that a field is a positive number.
 */
export function validatePositiveNumber(value: any, fieldName: string): string | null {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

/**
 * Collect multiple validation errors into an array, filtering out nulls.
 */
export function validateAll(...validations: (string | null)[]): string[] {
  return validations.filter((v): v is string => v !== null);
}

/**
 * Remove HTML tags and dangerous characters from a string (XSS prevention).
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")          // Remove HTML tags
    .replace(/[<>]/g, "")             // Remove any remaining angle brackets
    .replace(/javascript:/gi, "")     // Remove javascript: protocol
    .replace(/on\w+=/gi, "")          // Remove event handlers (onclick=, etc.)
    .replace(/data:/gi, "");          // Remove data: URIs
}

/**
 * Validate that a string is a valid UUID format.
 */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
