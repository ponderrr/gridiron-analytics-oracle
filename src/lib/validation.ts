import isEmail from "validator/lib/isEmail";

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!isEmail(email)) return "Please enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) errors.push("Password is required.");
  if (password.length < 8)
    errors.push("Password must be at least 8 characters.");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter.");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter.");
  if (!/\d/.test(password))
    errors.push("Password must contain at least one number.");
  return errors;
}

export function formatErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  function hasMessage(e: unknown): e is { message: string } {
    return (
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as { message: unknown }).message === "string"
    );
  }
  if (hasMessage(error)) {
    return error.message;
  }
  return "An unknown error occurred.";
}
