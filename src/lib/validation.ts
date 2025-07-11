import isEmail from "validator/lib/isEmail";

// Email validation constants
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

// Email validation configuration
export const EMAIL_VALIDATION_CONFIG = {
  RESTRICT_DOMAINS: false, // Set to true to restrict to common domains only
} as const;

// Password validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: MIN_PASSWORD_LENGTH,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  // REQUIRE_SPECIAL: false, // Removed
} as const;

// Password strength scoring weights
export const PASSWORD_STRENGTH_WEIGHTS = {
  MIN_LENGTH: 25,
  UPPERCASE: 20,
  LOWERCASE: 20,
  NUMBER: 20,
  SPECIAL: 15,
} as const;

// Error messages
export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Please enter a valid email address.",
  EMAIL_DOMAIN_RESTRICTED:
    "Please use a common email provider (gmail, yahoo, etc.).",
  PASSWORD_REQUIRED: "Password is required.",
  PASSWORD_TOO_SHORT: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  PASSWORD_NO_UPPERCASE: "Password must contain at least one uppercase letter.",
  PASSWORD_NO_LOWERCASE: "Password must contain at least one lowercase letter.",
  PASSWORD_NO_NUMBER: "Password must contain at least one number.",
  PASSWORD_NO_SPECIAL: "Password must contain at least one special character.",
  CONFIRM_PASSWORD_REQUIRED: "Please confirm your password.",
  PASSWORDS_DONT_MATCH: "Passwords do not match.",
  ACCOUNT_CREATED_SUCCESS:
    "Account created successfully! Please check your email to confirm your account before signing in.",
} as const;

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
  // hasSpecial?: boolean; // Removed
}

/**
 * Validates an email address and checks if the domain is whitelisted.
 */
export function validateEmail(email: string): string | null {
  if (!email) return VALIDATION_MESSAGES.EMAIL_REQUIRED;
  if (!isEmail(email)) return VALIDATION_MESSAGES.EMAIL_INVALID;
  return null;
}

/**
 * Validates a password and returns error message if any.
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_REQUIRED);
    return errors;
  }
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_NO_UPPERCASE);
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_NO_LOWERCASE);
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_NO_NUMBER);
  }
  return errors;
}

/**
 * Returns a password strength object with individual checks.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    // hasSpecial: /[^A-Za-z0-9]/.test(password), // Removed
  };
}

/**
 * Returns a password strength score from 0-100.
 */
export function passwordStrengthScore(password: string): number {
  let score = 0;
  if (!password) return score;
  if (password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH)
    score += PASSWORD_STRENGTH_WEIGHTS.MIN_LENGTH;
  if (/[A-Z]/.test(password)) score += PASSWORD_STRENGTH_WEIGHTS.UPPERCASE;
  if (/[a-z]/.test(password)) score += PASSWORD_STRENGTH_WEIGHTS.LOWERCASE;
  if (/\d/.test(password)) score += PASSWORD_STRENGTH_WEIGHTS.NUMBER;
  // if (/[^A-Za-z0-9]/.test(password)) score += PASSWORD_STRENGTH_WEIGHTS.SPECIAL; // Removed
  return Math.min(score, 100);
}

/**
 * Returns a comprehensive email validation result with feedback and suggestions.
 */
export function validateEmailDetailed(email: string): ValidationResult {
  const errors: string[] = [];
  let score = 0;
  if (!email) {
    errors.push(VALIDATION_MESSAGES.EMAIL_REQUIRED);
    return { valid: false, errors, score };
  }
  if (!isEmail(email)) {
    errors.push(VALIDATION_MESSAGES.EMAIL_INVALID);
  } else {
    score += 50;
  }
  const [_, domain] = email.split("@");
  if (domain) {
    if (
      EMAIL_VALIDATION_CONFIG.RESTRICT_DOMAINS &&
      !COMMON_EMAIL_DOMAINS.includes(domain)
    ) {
      errors.push(VALIDATION_MESSAGES.EMAIL_DOMAIN_RESTRICTED);
    } else {
      score += 50;
    }
  }
  return { valid: errors.length === 0, errors, score };
}

/**
 * Returns real-time feedback for password as the user types.
 */
export function getPasswordFeedback(password: string): string[] {
  const feedback: string[] = [];
  if (!password) {
    feedback.push("Password is required.");
    return feedback;
  }
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    feedback.push(`At least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    feedback.push("One uppercase letter");
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    feedback.push("One lowercase letter");
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/\d/.test(password)) {
    feedback.push("One number");
  }
  // if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !/[^A-Za-z0-9]/.test(password)) {
  //   feedback.push("One special character");
  // } // Removed
  return feedback;
}

/**
 * Returns a password strength label based on score.
 */
export function passwordStrengthLabel(score: number): string {
  if (score >= 90) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Weak";
}
