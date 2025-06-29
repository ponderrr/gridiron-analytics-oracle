export function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return "Please enter a valid email address.";
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
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    return (error as any).message;
  }
  return "An unknown error occurred.";
}
