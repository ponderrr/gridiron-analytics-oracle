import isEmail from "validator/lib/isEmail";

// Validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "zoho.com",
  "mail.com",
  "gmx.com",
];

// Email validation options interface
export interface EmailValidationOptions {
  requireCommonDomain?: boolean;
  customAllowedDomains?: string[];
}

// Unified validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  score?: number; // For password/email strength
}

// Password strength interface
export interface PasswordStrength {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial?: boolean;
}

/**
 * Validates an email address and checks if the domain is whitelisted.
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): string | null {
  if (!email) return "Email is required.";
  if (!isEmail(email)) return "Please enter a valid email address.";

  if (options.requireCommonDomain) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain) {
      const allowedDomains = [
        ...COMMON_EMAIL_DOMAINS,
        ...(options.customAllowedDomains || []),
      ];
      if (!allowedDomains.includes(domain)) {
        return "Please use a common email provider (gmail, yahoo, etc.).";
      }
    }
  }
  return null;
}

/**
 * Validates a password and returns error message if any.
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) {
    errors.push("Password is required.");
    return errors;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  return errors;
}

/**
 * Returns a password strength object with individual checks.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  return {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

/**
 * Returns a password strength score from 0-100.
 */
export function passwordStrengthScore(password: string): number {
  let score = 0;
  if (!password) return score;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 25;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  return Math.min(score, 100);
}

/**
 * Validates multiple fields at once.
 * @param fields Object with field names and values
 * @param validators Object with field names and validation functions
 * @returns Object with field names and ValidationResult
 */
export function validateFields(
  fields: Record<string, string>,
  validators: Record<string, (value: string) => ValidationResult>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  for (const key in fields) {
    if (validators[key]) {
      results[key] = validators[key](fields[key]);
    }
  }
  return results;
}

export function formatErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred.";
}
