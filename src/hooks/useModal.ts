import { useState, useCallback, useRef } from "react";

interface UseModalOptions<T = undefined> {
  initialOpen?: boolean;
  initialForm?: T;
}

interface UseModalReturn<T = undefined> {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
  form: T;
  setForm: (form: T) => void;
  resetForm: () => void;
}

/**
 * Reusable hook for modal open/close, loading, error, and form state.
 */
export function useModal<T = undefined>(
  options: UseModalOptions<T> = {}
): UseModalReturn<T> {
  // Runtime check for initialForm
  let initialFormValue: T;
  if (options.initialForm !== undefined) {
    initialFormValue = options.initialForm;
  } else {
    // If T is undefined, allow undefined. Otherwise, throw error for missing initialForm.
    if (typeof (undefined as unknown as T) === "undefined") {
      initialFormValue = undefined as T;
    } else {
      throw new Error(
        "useModal: initialForm is required when T is not undefined. Please provide an initialForm value."
      );
    }
  }

  const initialFormRef = useRef<T>(initialFormValue);
  const [isOpen, setIsOpen] = useState<boolean>(!!options.initialOpen);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<T>(initialFormRef.current);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((v) => !v), []);
  const resetForm = useCallback(() => {
    setForm(initialFormRef.current);
    setError(null);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    loading,
    setLoading,
    error,
    setError,
    form,
    setForm,
    resetForm,
  };
}
