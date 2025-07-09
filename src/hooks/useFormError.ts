import { useState, useCallback } from "react";
import { formatErrorMessage } from "../lib/errorHandling";

export interface FormErrorHook {
  error: string;
  setError: (error: string) => void;
  clearError: () => void;
  formatAndSetError: (error: unknown) => void;
}

export function useFormError(): FormErrorHook {
  const [error, setError] = useState("");

  const clearError = useCallback(() => setError(""), []);

  const formatAndSetError = useCallback((err: unknown) => {
    setError(formatErrorMessage(err));
  }, []);

  return {
    error,
    setError,
    clearError,
    formatAndSetError,
  };
}
