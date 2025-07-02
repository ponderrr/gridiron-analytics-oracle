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

// Password validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: MIN_PASSWORD_LENGTH,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false, // Optional for now
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
